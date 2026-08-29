import React, { useState } from 'react';
import { 
  FolderOpen, 
  UploadCloud, 
  Search, 
  Sparkles, 
  FileText, 
  Plus, 
  ShieldCheck 
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentDigitizationModal } from '../../components/documents/DocumentDigitizationModal';
import { EmptyState } from '../../components/common/EmptyState';

export const MedicalRecordsPage = () => {
  const { documents } = useHealth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDigitizeModalOpen, setIsDigitizeModalOpen] = useState(false);

  const categories = [
    'All',
    'Reports',
    'Prescriptions',
    'Scans',
    'Discharge Summaries',
    'Other Documents'
  ];

  const filteredDocuments = documents.filter((doc) => {
    if (selectedCategory !== 'All' && doc.type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title?.toLowerCase().includes(q);
      const matchDoc = doc.doctor?.toLowerCase().includes(q);
      const matchHosp = doc.hospital?.toLowerCase().includes(q);
      if (!matchTitle && !matchDoc && !matchHosp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-health-700 uppercase tracking-wider">
            <FolderOpen className="w-4 h-4" />
            <span>Document Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Medical Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload and digitize lab tests, prescriptions, scans, and discharge summaries with AI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDigitizeModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-health-600 hover:bg-health-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-health-600/20 hover:shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload & Digitize with AI</span>
        </button>
      </div>

      {/* Upload Banner / Drag Drop Trigger Area */}
      <div 
        onClick={() => setIsDigitizeModalOpen(true)}
        className="cursor-pointer bg-gradient-to-r from-health-50 via-teal-50/50 to-slate-50 border-2 border-dashed border-health-300 hover:border-health-500 rounded-3xl p-6 sm:p-8 text-center transition-all group"
      >
        <div className="w-14 h-14 rounded-2xl bg-white text-health-600 flex items-center justify-center mx-auto mb-3 shadow-soft group-hover:scale-105 transition-transform border border-health-100">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Upload New Medical Document (PDF, JPG, PNG)
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Our AI extracts clinical values, dates, medications, and doctors automatically for your health memory timeline.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-health-800 bg-white px-3.5 py-1.5 rounded-xl border border-health-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-health-600" />
          <span>Click to launch AI Digitizer</span>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, doctor, or diagnostic lab..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-health-500 focus:bg-white"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Cards Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          title="No medical documents found"
          description="Upload previous medical reports, prescriptions, or scans to keep them organized."
          actionLabel="+ Upload First Document"
          onAction={() => setIsDigitizeModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* 4-Step Digitization Modal */}
      <DocumentDigitizationModal
        isOpen={isDigitizeModalOpen}
        onClose={() => setIsDigitizeModalOpen(false)}
      />
    </div>
  );
};
