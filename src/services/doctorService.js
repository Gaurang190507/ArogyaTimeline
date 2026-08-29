import { supabase } from './supabaseClient';

export const doctorService = {
  /**
   * Doctors are a shared directory — any signed-in user can read all of them.
   */
  async getAllDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[doctorService] getAllDoctors error:', error.message);
      return [];
    }
    return data || [];
  },

  async getDoctorById(id) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[doctorService] getDoctorById error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Optional: add a new doctor. The seed data in supabase-schema.sql
   * already populates the directory, so this is rarely needed.
   */
  async addDoctor(doctorData) {
    const { data, error } = await supabase
      .from('doctors')
      .insert([{
        name: doctorData.name,
        specialty: doctorData.specialty,
        phone: doctorData.phone,
        email: doctorData.email,
        hospital: doctorData.hospital,
        avatar_url: doctorData.avatarUrl,
        total_visits: 0,
        visit_history: [],
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Add a visit to a doctor's history. Also increments total_visits
   * and updates the last_visit date.
   */
  async addVisitToDoctor(doctorId, visitData) {
    // Fetch current doctor to append to visit_history
    const { data: doctor, error: fetchErr } = await supabase
      .from('doctors')
      .select('visit_history, total_visits')
      .eq('id', doctorId)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const newVisit = {
      id: `vis_${Date.now()}`,
      date: visitData.date || new Date().toISOString().split('T')[0],
      ...visitData,
    };

    const updatedHistory = [newVisit, ...(doctor.visit_history || [])];

    const { data, error } = await supabase
      .from('doctors')
      .update({
        visit_history: updatedHistory,
        total_visits: (doctor.total_visits || 0) + 1,
        last_visit: newVisit.date,
      })
      .eq('id', doctorId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newVisit;
  },
};