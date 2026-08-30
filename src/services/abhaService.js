// ABHA (Ayushman Bharat Health Account) login service.
// ─────────────────────────────────────────────────────────────
// This is a **mock** of the ABDM (Ayushman Bharat Digital Mission)
// Gateway so the ABHA login flow can be demoed without registering
// for the ABDM sandbox (which requires NHA organisation approval).
//
// The mock is deterministic: the same ABHA address always yields
// the same OTP + profile. This lets judges reproduce a login on
// any device by entering the displayed OTP.
//
// Swap this file for a real ABDM proxy (see the edge-function
// approach in the plan) when M1 compliance is approved.
// ─────────────────────────────────────────────────────────────

/** 32-bit FNV-1a hash (deterministic, works in any JS engine). */
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0; // keep unsigned 32-bit
  }
  return h;
}

/** Derive a stable 6-digit OTP from the ABHA address. */
function deriveOtp(abhaAddress) {
  return Math.abs(hash(abhaAddress)).toString().padStart(6, "0").slice(-6);
}

/** Derive a stable pseudo-ABHA-number from the address. */
function deriveAbhaNumber(abhaAddress) {
  const h = Math.abs(hash(abhaAddress));
  const a = (h % 10000).toString().padStart(4, "0");
  const b = ((h * 7) % 10000).toString().padStart(4, "0");
  return `91-${a}-${b}-1357`;
}

/** Derive a display name from the ABHA address slug. */
function deriveName(abhaAddress) {
  const slug = abhaAddress.split("@")[0];
  const parts = slug.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "ABHA User";
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/** Derive gender, year of birth, phone from the address hash. */
function deriveDemographics(abhaAddress) {
  const h = Math.abs(hash(abhaAddress));
  return {
    gender: h % 2 === 0 ? "M" : "F",
    yearOfBirth: `${1990 + (h % 25)}`,
    phone: `+91 98765 ${(h % 100000).toString().padStart(5, "0")}`,
  };
}

/** Deterministic email + password so the same ABHA address re-logs-in. */
export function credentialsFor(abhaAddress) {
  const h = Math.abs(hash(abhaAddress));
  const slug = abhaAddress.replace(/[^a-z0-9._-]/gi, "").toLowerCase();
  const email = `${slug}@mock.abdm`;
  const password = `abha-${h.toString(36)}`;
  return { email, password };
}

export const abhaService = {
  /**
   * Step 1 — begin ABHA authentication.
   *
   * In the real ABDM flow this hits `/v0.5/users/auth/init` to trigger an
   * SMS OTP. In mock mode we just derive the OTP synchronously and return
   * it so the UI can display it to the user immediately.
   *
   * @returns {Promise<{transactionId:string, otp:string, authMethods:string[]}>}
   */
  async initiateLogin(abhaAddress) {
    const abha = (abhaAddress || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]+@abdm$/.test(abha)) {
      throw new Error("Enter a valid ABHA address, e.g. yourname@abdm");
    }

    // Simulated network round-trip so the loading spinner shows briefly.
    await new Promise((r) => setTimeout(r, 600));

    return {
      transactionId: `mock-txn-${hash(abha)}`,
      otp: deriveOtp(abha),
      // ABDM auth modes (informational only in mock mode)
      authMethods: ["MOBILE_OTP"],
    };
  },

  /**
   * Step 2 — verify the OTP the user entered against the derived value.
   *
   * In the real flow this calls `/auth/confirm` + `/auth/on-confirm`.
   * In mock mode we just compare the submitted OTP with the deterministic
   * one. On success, return the verified demographics.
   *
   * @returns {Promise<object>} verified profile
   */
  async confirmLogin(abhaAddress, otp, _transactionId) {
    const abha = (abhaAddress || "").trim().toLowerCase();
    const expectedOtp = deriveOtp(abha);

    await new Promise((r) => setTimeout(r, 400));

    // Normalize OTP comparison (trim, drop non-digits)
    const submitted = (otp || "").toString().trim().replace(/[^0-9]/g, "");
    if (submitted !== expectedOtp) {
      const err = new Error(
        `Incorrect OTP. The demo OTP for ${abha} is ${expectedOtp}. Enter it again to retry.`,
      );
      err.code = "INVALID_OTP";
      throw err;
    }

    const demo = deriveDemographics(abha);

    return {
      abhaNumber: deriveAbhaNumber(abha),
      abhaAddress: abha,
      name: deriveName(abha),
      gender: demo.gender,
      yearOfBirth: demo.yearOfBirth,
      phone: demo.phone,
    };
  },

  /**
   * Convenience: whether ABHA login is available.
   * Always true in mock mode.
   */
  isConfigured() {
    return true;
  },
};
