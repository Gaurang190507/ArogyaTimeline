import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { familyLinkService } from "../services/familyLinkService";
import { authService } from "../services/authService";

const FamilyContext = createContext(null);

export const FamilyProvider = ({ children }) => {
  const { user, session, isAuthenticated } = useAuth();

  // Real family members fetched from Supabase (via family_links)
  const [familyMembers, setFamilyMembers] = useState([]);
  // The auth user we're currently acting as. When null, we're the
  // attendant signed into our own account. RLS keys off auth.uid()
  // so data is naturally scoped to whoever is signed in.
  const [activeMember, setActiveMember] = useState(null);

  // ── Fetch family members whenever the user/session changes ──
  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      setFamilyMembers([]);
      setActiveMember(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const members = await familyLinkService.getLinkedMembers();
      if (!cancelled) setFamilyMembers(members || []);
    })();

    return () => { cancelled = true; };
  }, [user?.id, isAuthenticated, session?.access_token]);

  // ── Helpers ────────────────────────────────────────────────
  // When viewing a family member, the session belongs to that
  // family member's auth user — so the HealthContext data is
  // automatically RLS-scoped. The only client-side check we need
  // is to know whether we're "wearing" a family member's identity.
  const isAttendantView = user && !activeMember;
  const isViewingSelf = activeMember === null;

  // Display name for the header — either the active member's name
  // or the logged-in user's name.
  const displayName = activeMember?.name || user?.name || "User";
  const displayRelation = activeMember?.relation || null;

  // ── Actions ────────────────────────────────────────────────
  const { switchToMember: authSwitchToMember, returnToAttendant: authReturnToAttendant } = useAuth();

  /**
   * Add a family member by their ABHA address. This creates a real
   * Supabase auth user and a family_links row. Returns the derived
   * password (shown once to the attendant).
   */
  const addFamilyMember = useCallback(async ({ abhaAddress, relation }) => {
    if (!abhaAddress) throw new Error("ABHA address is required");
    const result = await authService.addFamilyMemberByAbha(abhaAddress, relation);
    // Re-fetch the list (new member should appear)
    const members = await familyLinkService.getLinkedMembers();
    setFamilyMembers(members || []);
    return result;
  }, []);

  /**
   * Link an EXISTING Supabase user by their email + their own password.
   * Verifies the password by signing in as them, then creates a
   * family_links row with real credentials.
   */
  const linkExistingUser = useCallback(async ({ email, password, relation }) => {
    if (!email || !password) {
      throw new Error("Email and password are required to link an existing user.");
    }
    const result = await authService.linkExistingUser(email.trim(), password, relation);
    const members = await familyLinkService.getLinkedMembers();
    setFamilyMembers(members || []);
    return result;
  }, []);

  /**
   * Switch to a family member's account. The attendant MUST supply
   * the member's password — this is the password gate.
   */
  const switchToMember = useCallback(async (member, password) => {
    if (!member?.email || !password) {
      throw new Error("Email and password are required to switch profiles.");
    }
    await authSwitchToMember(member.email, password);
    setActiveMember(member);
  }, [authSwitchToMember]);

  /**
   * Return to the attendant's own account. Restores the session
   * saved before switching.
   */
  const returnToSelf = useCallback(async () => {
    await authReturnToAttendant();
    setActiveMember(null);
  }, [authReturnToAttendant]);

  const removeFamilyMember = useCallback(async (memberId) => {
    await familyLinkService.removeLink(memberId);
    setFamilyMembers((prev) => prev.filter((m) => m.linkId !== memberId && m.id !== memberId));
    setActiveMember((prev) => (prev?.id === memberId ? null : prev));
  }, []);

  // ── Context value ──────────────────────────────────────────
  const value = {
    familyMembers,
    activeMember,
    isAttendantView,
    isViewingSelf,
    displayName,
    displayRelation,
    addFamilyMember,
    linkExistingUser,
    switchToMember,
    returnToSelf,
    removeFamilyMember,
  };

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within a FamilyProvider");
  return ctx;
};
