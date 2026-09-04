import { supabase } from './supabaseClient';

/**
 * Layer 1: Application-level Intent Gating
 * Determines if user query is out-of-scope (e.g. cooking recipes, code generation, general trivia)
 * before invoking models or tools.
 */
export function checkHealthIntent(query) {
  if (!query || typeof query !== 'string') {
    return { isAllowed: true };
  }

  const q = query.trim().toLowerCase();

  // Out-of-scope patterns
  const recipePatterns = [
    /\b(recipe|pasta|bake a cake|cook|ingredients for|how to make pizza|curry recipe|cocktail)\b/i,
  ];
  const codingPatterns = [
    /\b(write a python|javascript code|react component|debug this code|c\+\+|sql query to drop|git commit)\b/i,
  ];
  const triviaPatterns = [
    /\b(who won the world cup|who is the president of|capital of france|box office|movie review|write a poem about space)\b/i,
  ];

  // Specific check: cooking / recipes
  if (recipePatterns.some((pattern) => pattern.test(q)) && !/\b(diet|diabetic|nutrition|calorie|hypertension food)\b/i.test(q)) {
    return {
      isAllowed: false,
      reason: 'OUT_OF_SCOPE_RECIPE',
      refusalText: `I can help with your health records, vital sign trends, doctor visits, medications, and wellness timeline, but I cannot assist with general cooking or recipes.

If you have specific dietary questions regarding your recorded conditions (such as low-sodium foods for blood pressure or diabetic-friendly meal guidelines), feel free to ask!`,
    };
  }

  // Specific check: coding / software
  if (codingPatterns.some((pattern) => pattern.test(q))) {
    return {
      isAllowed: false,
      reason: 'OUT_OF_SCOPE_CODE',
      refusalText: `I am your personal clinical health assistant, designed to help explore and organize your medical history. I cannot assist with general programming, software development, or code generation.`,
    };
  }

  // Specific check: trivia / pop culture
  if (triviaPatterns.some((pattern) => pattern.test(q))) {
    return {
      isAllowed: false,
      reason: 'OUT_OF_SCOPE_TRIVIA',
      refusalText: `I am specialized strictly in personal health management, medical history, and clinical records. I cannot answer general entertainment, trivia, or unrelated questions.`,
    };
  }

  return { isAllowed: true };
}

/**
 * Gemini Tool Definitions (Function Declarations)
 * Schema format matching Google Gemini 2.5 / 3.7 function calling spec
 */
export const GEMINI_HEALTH_TOOLS = [
  {
    name: 'search_health_history',
    description:
      "Search the authenticated user's chronological health records, clinical documents, and past consultations by keyword and optional date range.",
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Search term or keyword (e.g. "blood pressure", "cholesterol", "fever", "Dr. Sharma")',
        },
        start_date: {
          type: 'STRING',
          description: 'Optional start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'STRING',
          description: 'Optional end date in YYYY-MM-DD format',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_health_records',
    description:
      "Retrieve the authenticated user's health timeline records, optionally filtered by record type (e.g. vitals, consultation, lab, prescription, allergy).",
    parameters: {
      type: 'OBJECT',
      properties: {
        record_type: {
          type: 'STRING',
          description: 'Filter by record type: "vitals", "consultation", "lab", "prescription", "allergy", or "all"',
        },
        limit: {
          type: 'NUMBER',
          description: 'Maximum records to retrieve (default 10, max 30)',
        },
      },
    },
  },
  {
    name: 'get_measurement_history',
    description:
      "Retrieve numerical vital measurements (such as blood pressure, blood sugar/glucose, weight, or heart rate) for the user over a specified period to assess trends.",
    parameters: {
      type: 'OBJECT',
      properties: {
        type: {
          type: 'STRING',
          description: 'Type of measurement: "blood_pressure", "blood_glucose", "weight", "heart_rate", "spo2", or "all"',
        },
        period: {
          type: 'STRING',
          description: 'Time window to compare: "1_month", "3_months", "6_months", "1_year", or "all". Default is "3_months".',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'get_medications',
    description:
      "Retrieve the authenticated user's active prescription medications, dosages, and medication history recorded in their health profile.",
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'get_doctor_visits',
    description:
      "Retrieve the authenticated user's past clinical doctor visits, consultation notes, and upcoming scheduled appointments.",
    parameters: {
      type: 'OBJECT',
      properties: {
        status: {
          type: 'STRING',
          description: '"past", "upcoming", or "all". Default is "all".',
        },
      },
    },
  },
  {
    name: 'create_reminder',
    description:
      "Create a health reminder (for medications, daily BP/vitals measurement, or doctor visit) on the authenticated user's health schedule.",
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Title of the reminder (e.g. "Take Metformin 500mg", "Check morning blood pressure")',
        },
        date: {
          type: 'STRING',
          description: 'Date in YYYY-MM-DD format',
        },
        time: {
          type: 'STRING',
          description: 'Time in HH:MM format (e.g. "09:00", "20:30")',
        },
        category: {
          type: 'STRING',
          description: 'Category: "Medication", "Measurement", "Appointment", or "General"',
        },
      },
      required: ['title'],
    },
  },
];

/**
 * Execute a health tool against Supabase strictly for the authenticated user.
 * RLS and user_id enforcement guarantee User A cannot see User B's data.
 */
export async function executeHealthTool(toolName, args = {}, userId, client = supabase) {
  if (!userId) {
    throw new Error('Unauthorized tool execution: missing authenticated user ID.');
  }

  switch (toolName) {
    case 'search_health_history': {
      const { query: searchQ, start_date, end_date } = args;
      let dbQuery = client
        .from('health_records')
        .select('id, record_type, title, notes, recorded_at, metadata')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

      if (start_date) {
        dbQuery = dbQuery.gte('recorded_at', `${start_date}T00:00:00.000Z`);
      }
      if (end_date) {
        dbQuery = dbQuery.lte('recorded_at', `${end_date}T23:59:59.999Z`);
      }

      const { data: records, error } = await dbQuery.limit(20);
      if (error) throw error;

      // Filter in-memory for keywords across title, notes, metadata
      const lower = (searchQ || '').toLowerCase();
      const filtered = (records || []).filter((r) => {
        const text = `${r.title || ''} ${r.notes || ''} ${JSON.stringify(r.metadata || {})}`.toLowerCase();
        return text.includes(lower);
      });

      // Also search documents table for reports matching the query
      const { data: docs } = await client
        .from('documents')
        .select('id, title, type, doctor, hospital, report_date, ai_summary')
        .eq('user_id', userId)
        .limit(10);

      const matchingDocs = (docs || []).filter((d) => {
        const text = `${d.title || ''} ${d.doctor || ''} ${d.hospital || ''} ${d.ai_summary || ''}`.toLowerCase();
        return text.includes(lower);
      });

      return {
        query: searchQ,
        totalFound: filtered.length + matchingDocs.length,
        records: filtered.slice(0, 10).map((r) => ({
          id: r.id,
          type: r.record_type,
          title: r.title,
          notes: r.notes,
          date: r.recorded_at?.split('T')[0],
          metadata: r.metadata,
        })),
        documents: matchingDocs.slice(0, 5),
      };
    }

    case 'get_health_records': {
      const { record_type, limit = 10 } = args;
      let dbQuery = client
        .from('health_records')
        .select('id, record_type, title, notes, recorded_at, metadata')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(Math.min(limit, 30));

      if (record_type && record_type !== 'all') {
        dbQuery = dbQuery.eq('record_type', record_type);
      }

      const { data, error } = await dbQuery;
      if (error) throw error;

      return {
        count: (data || []).length,
        records: (data || []).map((r) => ({
          id: r.id,
          type: r.record_type,
          title: r.title,
          notes: r.notes,
          date: r.recorded_at?.split('T')[0],
          metadata: r.metadata,
        })),
      };
    }

    case 'get_measurement_history': {
      const { type = 'blood_pressure', period = '3_months' } = args;

      // Calculate start date boundary based on period
      const now = new Date();
      let startDate = new Date();
      if (period === '1_month') startDate.setMonth(now.getMonth() - 1);
      else if (period === '3_months') startDate.setMonth(now.getMonth() - 3);
      else if (period === '6_months') startDate.setMonth(now.getMonth() - 6);
      else if (period === '1_year') startDate.setFullYear(now.getFullYear() - 1);
      else startDate = new Date(0); // all

      const { data, error } = await client
        .from('health_records')
        .select('id, record_type, title, notes, recorded_at, metadata')
        .eq('user_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // Filter records relevant to measurement type
      const relevant = (data || []).filter((r) => {
        const titleAndNotes = `${r.title || ''} ${r.notes || ''}`.toLowerCase();
        if (type === 'blood_pressure') {
          return r.record_type === 'vitals' || /bp|blood pressure|\d{2,3}\/\d{2,3}/i.test(titleAndNotes);
        }
        if (type === 'blood_glucose' || type === 'blood_sugar') {
          return /sugar|glucose|fasting|hba1c/i.test(titleAndNotes);
        }
        if (type === 'weight') {
          return /weight|kg|lbs/i.test(titleAndNotes);
        }
        if (type === 'heart_rate') {
          return /pulse|heart rate|bpm/i.test(titleAndNotes);
        }
        return true;
      });

      return {
        measurementType: type,
        periodRequested: period,
        totalReadings: relevant.length,
        readings: relevant.map((r) => ({
          id: r.id,
          title: r.title,
          notes: r.notes,
          date: r.recorded_at?.split('T')[0],
          metadata: r.metadata,
        })),
      };
    }

    case 'get_medications': {
      // 1. Get from user profile
      const { data: profile } = await client
        .from('profiles')
        .select('current_medications, medical_background')
        .eq('id', userId)
        .single();

      // 2. Get prescription records from health_records
      const { data: rxRecords } = await client
        .from('health_records')
        .select('id, title, notes, recorded_at, metadata')
        .eq('user_id', userId)
        .eq('record_type', 'prescription')
        .order('recorded_at', { ascending: false })
        .limit(10);

      const normalizeList = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'nil') return [];
          if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
            try {
              return normalizeList(JSON.parse(trimmed));
            } catch (_) {}
          }
          return trimmed.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        }
        if (typeof val === 'object') return Object.values(val);
        return [val];
      };

      return {
        profileMedications: normalizeList(profile?.current_medications),
        knownAllergies: normalizeList(profile?.medical_background?.allergies),
        prescriptionsRecorded: (rxRecords || []).map((r) => ({
          id: r.id,
          title: r.title,
          notes: r.notes,
          date: r.recorded_at?.split('T')[0],
          metadata: r.metadata,
        })),
      };
    }

    case 'get_doctor_visits': {
      const { status = 'all' } = args;
      const nowIso = new Date().toISOString();

      let aptQuery = client
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (status === 'past') {
        aptQuery = aptQuery.lt('date', nowIso.split('T')[0]);
      } else if (status === 'upcoming') {
        aptQuery = aptQuery.gte('date', nowIso.split('T')[0]);
      }

      const { data: appointments } = await aptQuery.limit(15);

      // Also get consultation health records
      const { data: consultations } = await client
        .from('health_records')
        .select('id, title, notes, recorded_at, metadata')
        .eq('user_id', userId)
        .eq('record_type', 'consultation')
        .order('recorded_at', { ascending: false })
        .limit(10);

      return {
        scheduledAppointments: appointments || [],
        recordedConsultations: consultations || [],
      };
    }

    case 'create_reminder': {
      const { title, date, time, category = 'General' } = args;
      const dueDate = date && time ? new Date(`${date}T${time}:00Z`).toISOString() : null;

      const newReminder = {
        user_id: userId,
        title: title || 'Health Reminder',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '09:00',
        due_date: dueDate,
        category: category,
        completed: false,
        repeat: 'Once',
      };

      const { data, error } = await client
        .from('reminders')
        .insert([newReminder])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Reminder created: "${title}" on ${date || 'today'} at ${time || 'scheduled time'}.`,
        reminder: data,
      };
    }

    default:
      throw new Error(`Unknown health assistant tool: ${toolName}`);
  }
}
