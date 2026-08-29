import { supabase } from './supabaseClient';

export const healthRecordService = {
  async _getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    return session.user.id;
  },

  /**
   * Fetch all health records for the currently signed-in user,
   * ordered by date and time (newest first).
   */
  // Map the frontend record shape to the actual DB columns.
  // The DB table `health_records` uses: record_type, notes, recorded_at.
  _toDbRow(record) {
    const dbRow = {
      user_id: record.userId,
      record_type: record.type,
      title: record.title,
      notes: record.description || record.notes || null,
      metadata: record.metadata || {},
    };

    // Combine date + time into a single ISO timestamp for recorded_at.
    // Only set recorded_at when the caller provides date/time (handles
    // partial updates that might not include either field).
    if (record.date) {
      const when = composeTimestampUTC(record.date, record.time);
      if (when) dbRow.recorded_at = when.toISOString();
    }

    return dbRow;
  },

  // Convert a DB row back to the frontend record shape
  _fromDbRow(row) {
    return {
      id: row.id,
      type: row.record_type,
      title: row.title || '',
      description: row.notes || '',
      notes: row.notes || '',
      date: row.recorded_at ? row.recorded_at.split('T')[0] : '',
      time: row.recorded_at
        ? new Date(row.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
      metadata: row.metadata || {},
      createdAt: row.recorded_at || row.created_at,
    };
  },

  async getAllRecords() {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('[healthRecordService] getAllRecords error:', error.message);
      return [];
    }
    return (data || []).map((r) => this._fromDbRow(r));
  },

  async getRecordById(id) {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[healthRecordService] getRecordById error:', error.message);
      return null;
    }
    return this._fromDbRow(data);
  },

  /**
   * Insert a new health record. The user_id is taken from the current
   * Supabase session so users can never insert rows for someone else.
   */
  async addRecord(newRecordData) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');

    const row = this._toDbRow({ ...newRecordData, userId: session.user.id });

    const { data, error } = await supabase
      .from('health_records')
      .insert([row])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._fromDbRow(data);
  },

  async updateRecord(id, updates) {
    const userId = await this._getUserId();
    // Map frontend keys → DB column names
    const dbUpdates = this._toDbRow(updates);
    delete dbUpdates.user_id; // never update the owner

    const { data, error } = await supabase
      .from('health_records')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._fromDbRow(data);
  },

  async deleteRecord(id) {
    const userId = await this._getUserId();
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  },

  async getRecordsByDate(dateString) {
    const userId = await this._getUserId();
    // recorded_at is an ISO timestamp; match on date portion
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', `${dateString}T00:00:00`)
      .lte('recorded_at', `${dateString}T23:59:59`)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('[healthRecordService] getRecordsByDate error:', error.message);
      return [];
    }
    return (data || []).map((r) => this._fromDbRow(r));
  },

  async getRecordsByType(type) {
    if (!type || type === 'all') return this.getAllRecords();

    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .eq('record_type', type)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('[healthRecordService] getRecordsByType error:', error.message);
      return [];
    }
    return (data || []).map((r) => this._fromDbRow(r));
  },

  /**
   * Aggregate stats used on the Home page.
   * Reads the user's records and returns a summary in the same shape
   * the frontend was getting from the mock service.
   */
  async getStats(recordsParam) {
    // Accept pre-fetched records to avoid a redundant getAllRecords() call
    const records = recordsParam || await this.getAllRecords();

    const bpRecords = records.filter(r => r.type === 'blood_pressure');
    const weightRecords = records.filter(r => r.type === 'weight');
    const sugarRecords = records.filter(r => r.type === 'blood_sugar');
    const doctorVisits = records.filter(r => r.type === 'doctor_visit');
    const documents = records.filter(r => r.type === 'document');

    const latestBP = bpRecords[0];
    const latestWeight = weightRecords[0];
    const latestSugar = sugarRecords[0];

    return {
      totalRecords: records.length,
      doctorVisitsCount: doctorVisits.length,
      documentsCount: documents.length,
      latestBP: latestBP
        ? `${latestBP.metadata?.systolic}/${latestBP.metadata?.diastolic} mmHg`
        : '—',
      latestWeight: latestWeight
        ? `${latestWeight.metadata?.value} kg`
        : '—',
      latestSugar: latestSugar
        ? `${latestSugar.metadata?.value} mg/dL`
        : '—',
      activeMedicinesCount: records.filter((r) => r.type === 'medicine').length,
    };
  },
};

/**
 * Parse a date string ("YYYY-MM-DD") and optional time string
 * ("10:30 AM", "14:30", "10:30") into a UTC-safe Date object.
 *
 * Uses UTC date components to avoid local-timezone shifts that
 * occur when combining a local date with toISOString() (which
 * formats in UTC — e.g. IST +5:30 would shift "2026-09-10" into
 * "2026-09-09T18:30:00Z").
 */
function composeTimestampUTC(dateStr, timeStr) {
  if (!dateStr) return null;

  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10); // 1-12
  const d = parseInt(parts[2], 10);

  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const ts = String(timeStr);
    const isPM = /\bpm\b/i.test(ts);

    // Match "HH:MM", "HH:MM AM/PM", "HH:MM" (24hr) cleanly
    const match = ts.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0; // midnight
    } else {
      // Handle "1 AM" or "10 PM" without minutes
      const matchNoMin = ts.match(/(\d{1,2})/);
      if (matchNoMin) {
        hours = parseInt(matchNoMin[1], 10);
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      }
    }
  }

  return new Date(Date.UTC(y, m - 1, d, hours, minutes, 0, 0));
}