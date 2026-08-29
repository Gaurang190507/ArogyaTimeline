import { supabase } from "./supabaseClient";


export const authService = {
  /**
   * Login with email + password.
   * Throws if credentials are wrong or email isn't confirmed.
   */
  async login(email, password) {
    if (!password) throw new Error('Password is required.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Surface a friendly message for unconfirmed emails
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          'Email not confirmed. In Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email".',
        );
      }
      throw error;
    }
    if (!data?.session)
      throw new Error("Login succeeded but no session was returned.");

    // Refresh profile row (auto-created by trigger)
    return this._fetchAndShapeProfile(data.user.id);
  },

  /**
   * Signup with email + password. The signup form collects a password
   * on step 1, so no default is needed.
   */
  async signup(profileData) {
    const email = profileData.email;
    if (!email) throw new Error("Email is required.");

    const password = profileData.password;
    if (!password) throw new Error("Password is required.");
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: profileData.name || email },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      const message = (error.message || "").toLowerCase();

      if (message.includes("already registered")) {
        // Account already exists → the user clicked "sign up" again. Instead of
        // throwing (which left them half-logged-in and confused), just sign
        // them in with the password they entered.
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError || !signInData?.session) {
          throw new Error(
            "An account with that email already exists. Please log in with your password instead.",
          );
        }
        // Sign-in succeeded → upsert the profile and return it
        await this._upsertProfile(signInData.user, profileData);
        return this._fetchAndShapeProfile(signInData.user.id);
      }

      if (
        error.status >= 500 ||
        message.includes("internal server error") ||
        message.includes("database")
      ) {
        throw new Error(
          "Supabase signup is failing because the auth trigger or profile table setup is missing.\n\n" +
            "Fix: run the SQL in supabase-schema.sql in your Supabase SQL Editor, then try again.\n" +
            'If email confirmation is enabled, also turn OFF "Confirm email" in Authentication → Providers → Email.',
        );
      }

      throw error;
    }

    if (!data?.user) {
      throw new Error("Signup failed: no user returned.");
    }

    // Supabase returns {user} without a session if email confirmation is ON,
    // or in some demo setups right after signup. Try to get a session:
    // 1. If we have one, great.  2. If not, attempt auto-login.
    if (data?.session) {
      // Session present — proceed.
    } else {
      // No session: try signing in immediately (works when "Confirm email" is OFF,
      // and ignores confirmination even when the trigger isn't set up yet).
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData?.session) {
        // Still no session — probably email confirmation is actually ON.
        throw new Error(
          "Your account was created, but Supabase won't issue a session.\n\n" +
            'FIX: In Supabase Dashboard → Authentication → Providers → Email, turn OFF "Confirm email", then try again.',
        );
      }
    }

    // Upsert the full profile (trigger already created a basic row)
    await this._upsertProfile(data.user, profileData);
    return this._fetchAndShapeProfile(data.user.id);
  },

  /**
   * Returns the current user profile, or null if not signed in.
   */
  async getCurrentUser() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return await this._fetchAndShapeProfile(session.user.id);
    } catch (err) {
      console.error("[authService] getCurrentUser error:", err.message);
      return null;
    }
  },

  async updateUser(updates) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");

    const updatePayload = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.dateOfBirth !== undefined)
      updatePayload.date_of_birth = updates.dateOfBirth;
    if (updates.sex !== undefined) updatePayload.sex = updates.sex;
    if (updates.genderIdentity !== undefined)
      updatePayload.gender_identity = updates.genderIdentity;
    if (updates.height !== undefined) updatePayload.height_cm = updates.height;
    if (updates.weight !== undefined) updatePayload.weight_kg = updates.weight;
    if (updates.bloodGroup !== undefined)
      updatePayload.blood_group = updates.bloodGroup;
    if (updates.emergencyContact !== undefined)
      updatePayload.emergency_contact = updates.emergencyContact;
    if (updates.medicalBackground !== undefined)
      updatePayload.medical_background = updates.medicalBackground;
    if (updates.currentMedications !== undefined)
      updatePayload.current_medications = updates.currentMedications;
    if (updates.preferences !== undefined)
      updatePayload.preferences = updates.preferences;
    if (updates.avatarUrl !== undefined)
      updatePayload.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", session.user.id);

    if (error) throw error;
    return await this.getCurrentUser();
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    return true;
  },

  /**
   * Returns the raw Supabase session (contains access_token, refresh_token, user, etc.)
   */
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session || null;
  },

  /**
   * Subscribe to auth state changes. Returns the unsubscribe function.
   */
  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this._fetchAndShapeProfile(session.user.id);
        callback(profile, session);
      } else {
        callback(null, null);
      }
    });
    return () => subscription.unsubscribe();
  },

  // ─── Internal helpers ───
  async _upsertProfile(user, extraData = {}) {
    const dbRow = {
      id: user.id,
      email: user.email,
      name: extraData.name || user.user_metadata?.name || user.email,
      phone: extraData.phone || "",
      date_of_birth: extraData.dateOfBirth,
      sex: extraData.sex,
      gender_identity: extraData.genderIdentity,
      height_cm: typeof extraData.height === "number" ? extraData.height : null,
      weight_kg: typeof extraData.weight === "number" ? extraData.weight : null,
      blood_group: extraData.bloodGroup,
      emergency_contact: extraData.emergencyContact || {},
      medical_background: extraData.medicalBackground || {},
      current_medications: extraData.currentMedications || [],
      preferences: {
        language: extraData.preferredLanguage || "en",
        theme: "light",
      },
    };
    // Strip undefined / null so we don't clobber existing data
    Object.keys(dbRow).forEach((k) => {
      if (dbRow[k] === undefined || dbRow[k] === null) delete dbRow[k];
    });

    const { error } = await supabase
      .from("profiles")
      .upsert(dbRow, { onConflict: "id" });
    if (error) throw new Error(`Profile upsert failed: ${error.message}`);
  },

  async _fetchAndShapeProfile(userId) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      // No profile row yet — fall back to a minimal stub
      return {
        id: userId,
        name: "",
        email: "",
        phone: "",
        preferences: { language: "en", theme: "light" },
        currentMedications: [],
        medicalBackground: {},
        emergencyContact: {},
      };
    }
    return this._shapeUser(profile);
  },

  _shapeUser(profile) {
    if (!profile) return null;
    return {
      id: profile.id,
      name:
        profile.name || (profile.email ? profile.email.split("@")[0] : "User"),
      email: profile.email || "",
      phone: profile.phone || "",
      dateOfBirth: profile.date_of_birth,
      sex: profile.sex || "",
      genderIdentity: profile.gender_identity || "",
      height: profile.height_cm || 172,
      weight: profile.weight_kg || 72,
      bloodGroup: profile.blood_group || "",
      emergencyContact: profile.emergency_contact || {},
      medicalBackground: profile.medical_background || {},
      currentMedications: profile.current_medications || [],
      preferences: profile.preferences || { language: "en", theme: "light" },
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at || new Date().toISOString(),
    };
  },
};
