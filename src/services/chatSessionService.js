import { supabase } from './supabaseClient';

const LOCAL_SESSIONS_KEY = 'aarogya_local_chat_sessions';
const LOCAL_MESSAGES_KEY = 'aarogya_local_chat_messages';

export const chatSessionService = {
  async _getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  },

  /**
   * List all chat sessions for the current authenticated user
   */
  async listSessions() {
    const userId = await this._getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
      console.warn('[chatSessionService] Error fetching remote sessions, falling back to local:', error?.message);
    }

    // Local storage fallback
    try {
      const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  },

  /**
   * Create a new chat session
   */
  async createSession(title = 'Health Consultation') {
    const userId = await this._getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: userId, title }])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      console.warn('[chatSessionService] Error creating remote session:', error?.message);
    }

    // Local fallback
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId || 'local_user',
      title,
      created_at: new Date().toISOString(),
    };

    try {
      const list = await this.listSessions();
      list.unshift(newSession);
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(list));
    } catch (_) {}

    return newSession;
  },

  /**
   * Fetch all messages for a specific session
   */
  async getSessionMessages(sessionId) {
    if (!sessionId) return [];

    const userId = await this._getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data;
      }
      console.warn('[chatSessionService] Error fetching remote messages:', error?.message);
    }

    // Local fallback
    try {
      const allMsgs = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
      return allMsgs[sessionId] || [];
    } catch (_) {
      return [];
    }
  },

  /**
   * Add a message to a session
   */
  async addMessage(sessionId, role, content, metadata = {}) {
    if (!sessionId || !content) return null;

    const userId = await this._getUserId();

    if (userId) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            user_id: userId,
            role,
            content,
            metadata,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      console.warn('[chatSessionService] Error saving message to Supabase:', error?.message);
    }

    // Local fallback
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      session_id: sessionId,
      user_id: userId || 'local_user',
      role,
      content,
      metadata,
      created_at: new Date().toISOString(),
    };

    try {
      const allMsgs = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
      if (!allMsgs[sessionId]) allMsgs[sessionId] = [];
      allMsgs[sessionId].push(newMsg);
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(allMsgs));
    } catch (_) {}

    return newMsg;
  },

  /**
   * Delete a session and its associated messages
   */
  async deleteSession(sessionId) {
    if (!sessionId) return false;

    const userId = await this._getUserId();

    if (userId) {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (!error) return true;
    }

    // Local cleanup
    try {
      const sessions = (await this.listSessions()).filter((s) => s.id !== sessionId);
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));

      const allMsgs = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
      delete allMsgs[sessionId];
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(allMsgs));
      return true;
    } catch (_) {
      return false;
    }
  },
};
