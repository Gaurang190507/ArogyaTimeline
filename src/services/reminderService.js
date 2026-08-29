import { supabase } from './supabaseClient';

export const reminderService = {
  async _getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    return session.user.id;
  },

  async getAllReminders() {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('[reminderService] getAllReminders error:', error.message);
      return [];
    }
    return data || [];
  },

  async addReminder(reminderData) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Build due_date from date + time if provided
    let due_date = reminderData.due_date;
    if (!due_date && reminderData.date) {
      const t = reminderData.time || '09:00';
      due_date = `${reminderData.date}T${t}:00`;
    }

    const row = {
      user_id: session.user.id,
      title: reminderData.title,
      description: reminderData.description || reminderData.notes || '',
      category: reminderData.category || 'General',
      date: reminderData.date,
      time: reminderData.time,
      due_date,
      completed: false,
      repeat: reminderData.repeat || 'Once',
    };

    const { data, error } = await supabase
      .from('reminders')
      .insert([row])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async toggleComplete(id) {
    const userId = await this._getUserId();
    // First fetch current state
    const { data: existing, error: fetchErr } = await supabase
      .from('reminders')
      .select('completed, repeat, due_date')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const { data, error } = await supabase
      .from('reminders')
      .update({ completed: !existing.completed })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If it was just completed and it repeats, spawn the next instance
    if (data.completed && existing.repeat && existing.repeat !== 'Once' && existing.due_date) {
      const next = computeNextOccurrence(existing.due_date, existing.repeat);
      if (next) {
        await this.addReminder({
          title: data.title,
          description: data.description,
          category: data.category,
          date: next.date,
          time: next.time,
          due_date: next.due_date,
          repeat: existing.repeat,
        });
      }
    }

    return data;
  },

  async deleteReminder(id) {
    const userId = await this._getUserId();
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  },
};

// Helper: compute the next due_date for a repeating reminder
function computeNextOccurrence(currentDue, repeat) {
  const d = new Date(currentDue);
  if (Number.isNaN(d.getTime())) return null;

  if (repeat === 'Daily') d.setDate(d.getDate() + 1);
  else if (repeat === 'Weekly') d.setDate(d.getDate() + 7);
  else if (repeat === 'Monthly') d.setMonth(d.getMonth() + 1);
  else return null;

  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().slice(0, 5);
  return { date, time, due_date: d.toISOString() };
}