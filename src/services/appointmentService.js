import { supabase } from './supabaseClient';

export const appointmentService = {
  async _getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    return session.user.id;
  },

  /**
   * Fetch all appointments for the signed-in user, newest first.
   * Sorted client-side so AM/PM times order correctly regardless of
   * their string representation.
   */
  async getAllAppointments() {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[appointmentService] getAllAppointments error:', error.message);
      return [];
    }
    return (data || []).sort((a, b) => {
      const ats = composeTimestamp(a.date, a.time);
      const bts = composeTimestamp(b.date, b.time);
      return bts - ats; // newest first
    });
  },

  async addAppointment(aptData) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const row = {
      user_id: session.user.id,
      doctor_id: aptData.doctorId || null,
      doctor_name: aptData.doctorName,
      date: aptData.date,
      time: aptData.time,
      status: 'Upcoming',
      room: aptData.room || 'Consultation Suite',
      purpose: aptData.purpose || '',
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([row])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateAppointment(id, updates) {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async cancelAppointment(id) {
    return this.updateAppointment(id, { status: 'Cancelled' });
  },
};

/**
 * Convert a date string (YYYY-MM-DD) and optional time string
 * ("10:30 AM", "14:30", "10:30") into a single numeric timestamp
 * that sorts correctly regardless of format.
 */
function composeTimestamp(dateStr, timeStr) {
  if (!dateStr) return 0;
  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const ts = String(timeStr);
    const isPM = /\bpm\b/i.test(ts);
    const match = ts.match(/(\d{1,2}):?(\d{0,2})/);
    if (match) {
      hours = parseInt(match[1], 10) || 0;
      minutes = parseInt(match[2], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0; // midnight
    }
  }

  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}