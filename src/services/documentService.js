import { supabase, STORAGE_BUCKET } from './supabaseClient';

export const documentService = {
  async _getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('Not authenticated');
    return session.user.id;
  },

  /**
   * Get all documents for the signed-in user.
   */
  async getAllDocuments() {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[documentService] getAllDocuments error:', error.message);
      return [];
    }
    return data || [];
  },

  async getDocumentById(id) {
    const userId = await this._getUserId();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[documentService] getDocumentById error:', error.message);
      return null;
    }
    return data;
  },

  /**
   * "OCR" extraction. For the prototype we still use the deterministic
   * mock generator — the file name is enough hint to make the demo feel
   * smart. The full OCR pipeline (Tesseract + pdf.js) is planned for
   * Phase 2D, after AI is working.
   */
  async simulateOcrExtraction(fileName, docType) {
    await new Promise(r => setTimeout(r, 600));

    if (fileName.toLowerCase().includes('blood') || fileName.toLowerCase().includes('cbc')) {
      return {
        title: fileName.replace(/\.[^/.]+$/, ''),
        reportDate: new Date().toISOString().split('T')[0],
        patientName: '—',
        hemoglobin: '13.6 g/dL (Normal)',
        wbcCount: '6,800 /mcL (Normal)',
        plateletCount: '2.35 Lakhs/mcL (Normal)',
        doctor: 'Dr. Sharma',
        hospital: 'Metropolis Healthcare',
        aiSummary: 'All hemogram parameters within reference ranges. No signs of infection or anemia.',
      };
    } else if (fileName.toLowerCase().includes('rx') || fileName.toLowerCase().includes('prescrip')) {
      return {
        title: 'Prescription — Follow-up',
        reportDate: new Date().toISOString().split('T')[0],
        medicines: ['Pantoprazole 40mg (OD before food x 14d)', 'Vitamin D3 60K (Weekly)'],
        diagnosis: 'Gastritis & Acid Reflux',
        doctor: 'Dr. Sharma',
        hospital: 'ABC Hospital',
        aiSummary: 'Prescription for acid reflux and maintenance vitamin D supplementation.',
      };
    } else {
      return {
        title: fileName.replace(/\.[^/.]+$/, '') || 'Uploaded Medical Document',
        reportDate: new Date().toISOString().split('T')[0],
        patientName: '—',
        findings: 'Test completed. All biological reference parameters reviewed.',
        doctor: 'Dr. Sharma',
        hospital: 'ABC Hospital / City Diagnostics',
        aiSummary: 'Document scanned and indexed into health memory timeline.',
      };
    }
  },

  /**
   * Upload a file to Supabase Storage and persist a documents row.
   * `newDoc` should already contain: { title, type, doctor, hospital, file, extracted, ... }
   * `newDoc.file` is the actual File object (from <input type="file">).
   */
  async addDocument(newDoc) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    let fileUrl = null;
    let fileSize = null;
    let fileFormat = null;

    // 1. Upload the actual file to Storage (if provided)
    if (newDoc.file) {
      const file = newDoc.file;
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/${Date.now()}_${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        console.error('[documentService] upload error:', uploadErr.message);
        throw new Error(`Upload failed: ${uploadErr.message}`);
      }

      const { data: publicUrl } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

      fileUrl = publicUrl.publicUrl;
      fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      fileFormat = ext.toUpperCase();
    }

    // 2. Insert the documents row
    const row = {
      user_id: session.user.id,
      title: newDoc.title,
      type: newDoc.type || 'Reports',
      file_url: fileUrl,
      file_format: fileFormat,
      file_size: fileSize,
      thumbnail: newDoc.thumbnail || 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=300&auto=format&fit=crop&q=80',
      doctor: newDoc.doctor,
      hospital: newDoc.hospital,
      report_date: newDoc.reportDate || new Date().toISOString().split('T')[0],
      ai_summary: newDoc.aiSummary || newDoc.summary,
      extracted_metadata: newDoc.extracted || {},
    };

    const { data, error } = await supabase
      .from('documents')
      .insert([row])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteDocument(id) {
    const userId = await this._getUserId();
    // Fetch the doc by ID AND user_id (so users can't probe/delete others' docs)
    const { data: doc, error: fetchErr } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    // Delete the file from Storage FIRST. If this fails, we don't delete
    // the DB row — so no orphaned files. The row is only removed after
    // the file is confirmed gone (or has no file URL).
    if (doc?.file_url) {
      const path = doc.file_url.split(`${STORAGE_BUCKET}/`)[1];
      if (path) {
        const { error: rmErr } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        if (rmErr) throw new Error(`Storage deletion failed: ${rmErr.message}`);
      }
    }

    // Safe to remove the DB row now
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return true;
  },
};