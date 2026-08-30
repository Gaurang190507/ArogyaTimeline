import { supabase } from "./supabaseClient";
import { abhaService, credentialsFor } from "./abhaService";


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
   * Login via ABHA (Ayushman Bharat Health Account).
   *
   * Mock flow (no ABDM/edge-function required — designed for hackathon
   * demos):
   *  1. abhaService.confirmLogin → validates OTP, returns verified profile
   *  2. Derive deterministic (email, password) from the ABHA address
   *  3. signInWithPassword; if the user doesn't exist yet, signUp then
   *     signIn (reusing the existing email signup pattern). Email
   *     confirmation is OFF in this app, so a session is returned at once.
   *  4. Persist the ABHA fields on the profile row.
   *
   * @param {string} abhaAddress — e.g. "yourname@abdm"
   * @param {string} otp         — the derived demo OTP the user entered
   * @param {string|null} transactionId — informational (mock)
   * @returns {Promise<object>}  — shaped profile (same as login)
   */
  async abhaLogin(abhaAddress, otp, _transactionId) {
    if (!abhaAddress || !otp) {
      throw new Error("ABHA address and OTP are required.");
    }

    // Validate OTP and get the verified profile (deterministic in mock mode)
    const profile = await abhaService.confirmLogin(abhaAddress, otp);
    const { email, password } = credentialsFor(profile.abhaAddress);

    // 1. Try to sign in to an existing account
    let signIn = await supabase.auth.signInWithPassword({ email, password });

    // 2. If the account doesn't exist yet, create it (email confirm is off)
    if (signIn.error && /invalid|not found|no user|email.*registered|null/i.test(signIn.error.message || "")) {
      const { error: upErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: profile.name, via: "abha" } },
      });
      if (upErr) throw new Error(`ABHA signup error: ${upErr.message}`);

      signIn = await supabase.auth.signInWithPassword({ email, password });
    }

    if (signIn.error) {
      throw new Error(`ABHA session error: ${signIn.error.message}`);
    }
    if (!signIn.data?.session) {
      throw new Error("ABHA login succeeded but no session was returned.");
    }

    const user = signIn.data.user;

    // 3. Persist ABHA identity on the profile row (idempotent upsert)
    await this._upsertProfile(user, {
      name: profile.name,
      phone: profile.phone,
      dateOfBirth: profile.yearOfBirth ? `${profile.yearOfBirth}-01-01` : null,
      sex: profile.gender === "M" ? "male" : profile.gender === "F" ? "female" : null,
      genderIdentity: profile.gender,
      abhaAddress: profile.abhaAddress,
      abhaNumber: profile.abhaNumber,
    });

    return this._fetchAndShapeProfile(user.id);
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

  // ─── Family linking helpers ───────────────────────────────

  /**
   * Link a family member by ABHA address.
   *
   * Derives deterministic credentials from the ABHA address via
   * abhaService.credentialsFor(). If a Supabase auth user with that
   * email doesn't exist yet, it creates one. Then creates a
   * family_links row. Returns the derived credentials so the UI can
   * surface the password ONCE to the attendant — to switch to that
   * member later, the attendant MUST enter this password.
   *
   * @param {string} abhaAddress  e.g. "mother.name@abdm"
   * @param {string} relation     e.g. "Mother"
   * @returns {Promise<{email, password, inviteeId, name, abhaAddress}>}
   */
  async addFamilyMemberByAbha(abhaAddress, relation) {
    if (!abhaAddress) throw new Error("ABHA address is required");
    const abha = abhaAddress.trim().toLowerCase();
    if (!/^[a-z0-9._-]+@abdm$/.test(abha)) {
      throw new Error("ABHA address must be of the form name@abdm");
    }

    const { email, password } = credentialsFor(abha);
    const displayName = abha.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    // Get current attendant's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error("Attendant not authenticated");

    // Save the attendant's tokens so we can restore the session
    // after the family member's sign-up/sign-in disrupts it.
    const attendantToken = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };

    // Try to determine the invitee's auth user ID.
    // We use supabase.auth.signInWithPassword with the derived
    // credentials — if it succeeds, the account exists. If it
    // fails (invalid creds), we create it via signUp.
    let inviteeId = null;
    const signInAttempt = await supabase.auth.signInWithPassword({ email, password });

    if (signInAttempt.data?.user) {
      inviteeId = signInAttempt.data.user.id;
    } else {
      // Account doesn't exist — create it
      const { data: signUpData, error: upErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: displayName, via: "abha" } },
      });
      if (upErr) {
        const msg = (upErr.message || "").toLowerCase();
        if (msg.includes("already registered")) {
          throw new Error(
            "A family member with this ABHA address already exists with a different password. " +
            "Use 'Link Existing User' with their email and password instead.",
          );
        }
        throw new Error(`Failed to create family member account: ${upErr.message}`);
      }
      inviteeId = signUpData?.user?.id;
    }

    if (!inviteeId) throw new Error("Failed to resolve family member auth user.");

    // Restore the attendant's session BEFORE doing DB writes.
    // We must be signed in as the attendant (RLS policy) to insert
    // into family_links.
    await supabase.auth.setSession(attendantToken);

    // Upsert ABHA identity on the family member's profile
    try {
      await supabase
        .from("profiles")
        .upsert(
          {
            id: inviteeId,
            email,
            name: displayName,
            abha_address: abha,
            abha_number: abhaService._deriveAbhaNumber ? abhaService._deriveAbhaNumber(abha) : null,
          },
          { onConflict: "id" },
        );
    } catch (e) {
      // Non-fatal — profile may be auto-created by trigger
      console.warn("[addFamilyMemberByAbha] profile upsert warning:", e.message);
    }

    // Create the family_links row (idempotent — ignores duplicate).
    // Use try/catch because supabase.from(...).insert(...) returns a
    // postgrest Thenable, not a native Promise in all versions.
    try {
      await supabase.from("family_links").insert({
        inviter_id: session.user.id,
        invitee_id: inviteeId,
        relation: relation || "Family",
        status: "accepted",
      });
    } catch (linkErr) {
      const msg = (linkErr.message || "").toLowerCase();
      // Duplicate key — already linked, that's fine
      if (!msg.includes("duplicate")) throw linkErr;
    }

    return { email, password, inviteeId, name: displayName, abhaAddress: abha };
  },

  /**
   * Link an EXISTING Supabase auth user (by email + their own password)
   * as a family member. This is for the case where the family member
   * already has an account with their own chosen password (not an
   * ABHA-derived one). The attendant must know the member's email and
   * password to verify the link is intentional.
   *
   * @param {string} email     family member's email
   * @param {string} password  family member's ORIGINAL password (their own)
   * @param {string} relation  e.g. "Mother"
   * @returns {Promise<{email, inviteeId, name, abhaAddress}>}
   */
  async linkExistingUser(email, password, relation) {
    if (!email || !password) {
      throw new Error("Family member's email and password are required.");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error("Attendant not authenticated");

    const attendantToken = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };

    // Sign in as the family member to confirm the password is correct
    const verify = await supabase.auth.signInWithPassword({ email, password });
    if (verify.error || !verify.data?.user?.id) {
      const errMsg = (verify.error?.message || "").toLowerCase();
      if (errMsg.includes("invalid") || errMsg.includes("credentials") || errMsg.includes("password")) {
        throw new Error(
          "Password verification failed. The email and password must match the family member's existing account.",
        );
      }
      throw new Error(`Could not verify family member credentials: ${verify.error?.message}`);
    }

    const inviteeId = verify.data.user.id;
    const inviteeEmail = verify.data.user.email;
    const inviteeName = verify.data.user.user_metadata?.name || inviteeEmail.split("@")[0];

    // Restore the attendant's session for the insert
    await supabase.auth.setSession(attendantToken);

    // Create the link (idempotent)
    try {
      await supabase.from("family_links").insert({
        inviter_id: session.user.id,
        invitee_id: inviteeId,
        relation: relation || "Family",
        status: "accepted",
      });
    } catch (linkErr) {
      const msg = (linkErr.message || "").toLowerCase();
      if (!msg.includes("duplicate")) throw linkErr;
    }

    return { email: inviteeEmail, inviteeId, name: inviteeName, abhaAddress: "" };
  },

  /**
   * Sign in as a family member. The attendant must supply the
   * member's password — this is the gate Abhi requested.
   *
   * @param {string} email
   * @param {string} password
   */
  async switchToMember(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required to switch profiles.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("password")) {
        throw new Error(
          "Wrong password. The family member must share their password to view their records.",
        );
      }
      throw error;
    }
    if (!data?.session) throw new Error("Switch failed: no session returned.");
    // onAuthStateChange listener will fire and update the user/session.
    return data.session;
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
      abha_address: extraData.abhaAddress || null,
      abha_number: extraData.abhaNumber || null,
      abha_verified_at: extraData.abhaVerifiedAt || null,
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
        abhaAddress: "",
        abhaNumber: "",
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
      abhaAddress: profile.abha_address || "",
      abhaNumber: profile.abha_number || "",
    };
  },
};
