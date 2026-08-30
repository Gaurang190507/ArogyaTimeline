import { supabase } from "./supabaseClient";

/**
 * familyLinkService — read-only CRUD for the public.family_links table.
 *
 * Each linked family member is a real Supabase auth user. The
 * `family_links` row maps (attendant → family member) so the attendant
 * can discover which family members they manage. To actually view
 * the family member's data, the attendant must re-authenticate as
 * that family member (via AuthContext.switchToMember) — that is the
 * password-gated step.
 */
export const familyLinkService = {
  /**
   * List the family members the currently signed-in user has linked
   * (as attendant). Returns an array of:
   *   { linkId, id (auth user id), name, email, relation,
   *     abhaAddress, abhaNumber }
   */
  async getLinkedMembers() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const { data, error } = await supabase
      .from("family_links")
      .select(
        `
        id, relation, status, created_at, invitee_id,
        invitee:invitee_id (
          id, name, email,
          abha_address, abha_number,
          date_of_birth, sex
        )
      `,
      )
      .eq("inviter_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[familyLinkService.getLinkedMembers]", error.message);
      return [];
    }

    return (data || []).map((row) => ({
      linkId: row.id,
      id: row.invitee?.id,
      name: row.invitee?.name || "Family Member",
      email: row.invitee?.email,
      relation: row.relation || "Family",
      abhaAddress: row.invitee?.abha_address,
      abhaNumber: row.invitee?.abha_number,
    }));
  },

  /**
   * Create a family link. The invitee must already exist as a
   * Supabase auth user. RLS enforces that inviter_id = auth.uid().
   */
  async createLink({ inviteeId, relation }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("family_links")
      .insert({
        inviter_id: session.user.id,
        invitee_id: inviteeId,
        relation: relation || "Family",
        status: "accepted",
      })
      .select()
      .single();

    if (error) {
      if (error.message?.toLowerCase().includes("duplicate")) {
        // Already linked — idempotent
        return { alreadyLinked: true };
      }
      throw new Error(error.message);
    }
    return data;
  },

  /**
   * Remove a family link by its link-row id. RLS allows the inviter
   * (or the invitee) to delete.
   */
  async removeLink(linkId) {
    const { error } = await supabase
      .from("family_links")
      .delete()
      .eq("id", linkId);
    if (error) throw new Error(error.message);
    return true;
  },
};
