import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  User,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Copy,
  Lock,
} from "lucide-react";
import { useFamily } from "../../context/FamilyContext";
import { useLanguage } from "../../context/LanguageContext";

export const AttendantToggle = () => {
  const {
    familyMembers,
    activeMember,
    isViewingSelf,
    displayName,
    displayRelation,
    switchToSelf,
    switchToMember,
    addFamilyMember,
    linkExistingUser,
  } = useFamily();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [linkMode, setLinkMode] = useState("abha"); // "abha" | "existing"
  const [newAbhaAddress, setNewAbhaAddress] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Password prompt state (shown when clicking a family member)
  const [promptMember, setPromptMember] = useState(null);
  const [promptPassword, setPromptPassword] = useState("");
  const [promptError, setPromptError] = useState("");
  const [switching, setSwitching] = useState(false);

  // One-time password reveal state (after adding a member)
  const [revealedPassword, setRevealedPassword] = useState(null);

  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open && !showAdd && !promptMember && !revealedPassword) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowAdd(false);
        setPromptMember(null);
        setRevealedPassword(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, showAdd, promptMember, revealedPassword]);

  const relations = ["Father", "Mother", "Spouse", "Son", "Daughter", "Sibling", "Other"];

  // ── Add family member (both ABHA and existing-user modes) ─────
  const handleAddMember = async () => {
    setAddError("");

    if (linkMode === "abha") {
      // Link by ABHA address → derives deterministic credentials
      if (!newAbhaAddress.trim() || !newRelation) {
        setAddError("ABHA address and relation are required.");
        return;
      }
      if (!/^[a-z0-9._-]+@abdm$/.test(newAbhaAddress.trim().toLowerCase())) {
        setAddError("ABHA address must be of the form name@abdm (e.g. mother.name@abdm)");
        return;
      }

      setAdding(true);
      try {
        const result = await addFamilyMember({
          abhaAddress: newAbhaAddress,
          relation: newRelation,
        });
        // Reveal derived password once
        setRevealedPassword({
          name: result.name,
          email: result.email,
          password: result.password,
          relation: newRelation,
          abhaAddress: result.abhaAddress,
        });
        setNewAbhaAddress("");
        setNewRelation("");
        setShowAdd(false);
      } catch (err) {
        setAddError(err.message || "Failed to add family member.");
      } finally {
        setAdding(false);
      }
    } else {
      // Link existing user by their email + their OWN password
      if (!newMemberEmail.trim() || !newMemberPassword || !newRelation) {
        setAddError("Email, password, and relation are required.");
        return;
      }
      setAdding(true);
      try {
        const result = await linkExistingUser({
          email: newMemberEmail,
          password: newMemberPassword,
          relation: newRelation,
        });
        // No password to reveal — the member already knows it.
        // Just show a success banner.
        setRevealedPassword({
          name: result.name,
          email: result.email,
          password: null,
          relation: newRelation,
          abhaAddress: result.abhaAddress,
          existingUser: true,
        });
        setNewMemberEmail("");
        setNewMemberPassword("");
        setNewRelation("");
        setShowAdd(false);
      } catch (err) {
        setAddError(err.message || "Failed to link existing user.");
      } finally {
        setAdding(false);
      }
    }
  };

  // ── Switch to member (password gate) ───────────────────────
  const handleSwitchMember = async () => {
    if (!promptPassword) {
      setPromptError("Password is required to view this family member's records.");
      return;
    }
    setPromptError("");
    setSwitching(true);
    try {
      await switchToMember(promptMember, promptPassword);
      setPromptMember(null);
      setPromptPassword("");
      setOpen(false);
    } catch (err) {
      setPromptError(err.message || "Failed to switch profile.");
    } finally {
      setSwitching(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // ── Render password reveal banner after adding ────────────
  if (revealedPassword) {
    const isExisting = revealedPassword.existingUser;
    return (
      <div
        ref={ref}
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/80 border ${
          isExisting
            ? "border-green-300/50 hover:border-green-400"
            : "border-amber-300/50 hover:border-amber-400"
        } transition-all max-w-md`}
      >
        <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${
          isExisting ? "text-green-600" : "text-amber-600"
        }`} />
        <div className="flex-1 min-w-0">
          {isExisting ? (
            <>
              <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">
                Linked {revealedPassword.name} ({revealedPassword.relation})
              </p>
              <p className="text-[10px] text-green-700 mt-0.5">
                They will need their password to sign in when you view their records.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Password for {revealedPassword.name} ({revealedPassword.relation})
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <code className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded break-all">
                  {revealedPassword.password}
                </code>
                <button
                  onClick={() => copyToClipboard(revealedPassword.password)}
                  className="text-amber-600 hover:text-amber-800"
                  title="Copy password"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-amber-700 mt-0.5">
                Share this with the family member. You'll need it to view their records.
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => setRevealedPassword(null)}
          className="text-slate-400 hover:text-slate-600 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* ── Password prompt overlay (when switching to a member) ── */}
      {promptMember && (
        <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-slideDown">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <p className="text-xs font-bold text-slate-700">
                Enter password for {promptMember.name}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {promptMember.relation} • {promptMember.abhaAddress}
            </p>
          </div>
          <div className="px-3 py-3 space-y-2">
            <input
              type="password"
              value={promptPassword}
              onChange={(e) => { setPromptPassword(e.target.value); setPromptError(""); }}
              placeholder="Family member's password"
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-health-500 focus:border-health-400 outline-none"
              autoFocus
            />
            {promptError && (
              <p className="text-[10px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {promptError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setPromptMember(null)}
                className="flex-1 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchMember}
                disabled={switching || !promptPassword}
                className="flex-1 py-1.5 text-xs font-bold text-white bg-health-600 hover:bg-health-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {switching ? "Switching…" : "Switch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trigger button ── */}
      <button
        onClick={() => { if (!promptMember) setOpen(!open); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200 hover:border-health-300 hover:bg-health-50 transition-all"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-health-500 to-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
          {isViewingSelf ? (
            <User className="w-3 h-3" />
          ) : (
            displayName.charAt(0)
          )}
        </div>
        <span className="max-w-[90px] truncate text-slate-700">
          {isViewingSelf ? "Self" : displayName.split(" ")[0]}
        </span>
        {displayRelation && (
          <span className="text-[10px] text-slate-400 hidden lg:inline">
            ({displayRelation})
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-64 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-40 animate-slideDown">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Viewing as
            </p>
          </div>

          {/* Self option */}
          <button
            onClick={() => { switchToSelf(); setOpen(false); }}
            className={`w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-health-50 transition-all ${
              isViewingSelf ? "bg-health-50/50" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-health-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800">Self</p>
              <p className="text-[11px] text-slate-400">Your personal records</p>
            </div>
            {isViewingSelf && <Check className="w-4 h-4 text-health-600" />}
          </button>

          {/* Family members (each requires password to switch) */}
          {familyMembers.map((member) => (
            <button
              key={member.linkId || member.id}
              onClick={(e) => {
                e.stopPropagation();
                setPromptMember(member);
                setPromptPassword("");
                setPromptError("");
                setOpen(false);
              }}
              className={`w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-health-50 transition-all border-t border-slate-50 ${
                activeMember?.id === member.id ? "bg-health-50/50" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-white text-xs font-bold flex items-center justify-center">
                {member.name?.charAt(0) || "?"}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {member.name}
                </p>
                <p className="text-[11px] text-slate-400">{member.relation}</p>
                {member.abhaAddress && (
                  <p className="text-[10px] text-slate-400 truncate">
                    {member.abhaAddress}
                  </p>
                )}
              </div>
              {activeMember?.id === member.id && (
                <Check className="w-4 h-4 text-health-600 shrink-0" />
              )}
            </button>
          ))}

          {/* Add family member button / form */}
          <div className="border-t border-slate-100">
            {!showAdd ? (
              <button
                onClick={() => { setShowAdd(true); setAddError(""); }}
                className="w-full px-3 py-2.5 flex items-center gap-2.5 text-health-700 hover:bg-health-50 transition-all font-semibold text-xs"
              >
                <UserPlus className="w-4 h-4" />
                Link Family Member
              </button>
            ) : (
              <div className="px-3 py-3 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Link Family Member</p>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mode toggle: ABHA (new account) vs Existing user (email+password) */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { setLinkMode("abha"); setAddError(""); }}
                    className={`flex-1 py-1.5 transition-all ${
                      linkMode === "abha"
                        ? "bg-health-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    New ABHA
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLinkMode("existing"); setAddError(""); }}
                    className={`flex-1 py-1.5 transition-all ${
                      linkMode === "existing"
                        ? "bg-health-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Existing User
                  </button>
                </div>

                {linkMode === "abha" ? (
                  <input
                    type="text"
                    value={newAbhaAddress}
                    onChange={(e) => { setNewAbhaAddress(e.target.value); setAddError(""); }}
                    placeholder="ABHA address (e.g. mother.name@abdm)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-health-500 focus:border-health-400 outline-none"
                  />
                ) : (
                  <>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => { setNewMemberEmail(e.target.value); setAddError(""); }}
                      placeholder="Member's email address"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-health-500 focus:border-health-400 outline-none"
                    />
                    <input
                      type="password"
                      value={newMemberPassword}
                      onChange={(e) => { setNewMemberPassword(e.target.value); setAddError(""); }}
                      placeholder="Their password (to verify)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-health-500 focus:border-health-400 outline-none"
                    />
                  </>
                )}

                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-health-500 focus:border-health-400 outline-none text-slate-700"
                >
                  <option value="">Relation</option>
                  {relations.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <p className="text-[10px] text-slate-500">
                  {linkMode === "abha"
                    ? "Creates a secure account for them. You'll be given a password to share."
                    : "Links their existing account. You'll need their password every time you view their records."}
                </p>

                {addError && (
                  <p className="text-[10px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {addError}
                  </p>
                )}
                <button
                  onClick={handleAddMember}
                  disabled={
                    adding ||
                    !newRelation ||
                    (linkMode === "abha"
                      ? !newAbhaAddress.trim()
                      : !newMemberEmail.trim() || !newMemberPassword)
                  }
                  className="w-full py-1.5 bg-health-600 hover:bg-health-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                >
                  {adding ? (
                    <>
                      <span>Linking…</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Link Member</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
