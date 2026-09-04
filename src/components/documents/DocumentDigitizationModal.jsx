import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useHealth } from '../../context/HealthContext';
import { documentService } from '../../services/documentService';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Edit3, 
  ArrowRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const DocumentDigitizationModal = ({ isOpen, onClose }) => {
  const { addDocument } = useHealth();

  const [step, setStep] = useState(1); // 1: Select/Upload, 2: Reading, 3: Extracting, 4: Review
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [docCategory, setDocCategory] = useState('Reports');
  const [extractedData, setExtractedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable review fields
  const [title, setTitle] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [hemoglobin, setHemoglobin] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      startDigitizationWorkflow(file.name);
    }
  };

  const handleSampleSelect = (sampleName, category) => {
    setSelectedFileObj(null);
    setDocCategory(category);
    startDigitizationWorkflow(sampleName);
  };

  const startDigitizationWorkflow = async (fileName) => {
    setSelectedFile(fileName);
    setStep(1);

    // Step 1: Uploading
    setTimeout(() => {
      setStep(2); // Reading document

      setTimeout(async () => {
        setStep(3); // AI Extracting

        const data = await documentService.simulateOcrExtraction(fileName, docCategory);
        setExtractedData(data);
        setTitle(data.title);
        setReportDate(data.reportDate);
        setDoctor(data.doctor);
        setHospital(data.hospital);
        setHemoglobin(data.hemoglobin || '13.6 g/dL (Normal)');
        setAiSummary(data.aiSummary);

        setTimeout(() => {
          setStep(4); // Review
        }, 800);
      }, 1000);
    }, 900);
  };

  const handleConfirmAndSave = async () => {
    await addDocument({
      title,
      type: docCategory,
      date: reportDate,
      doctor,
      hospital,
      summary: aiSummary,
      file: selectedFileObj,
      extractedData: {
        reportDate,
        doctor,
        hospital,
        hemoglobin,
        aiSummary
      }
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedFile(null);
    setSelectedFileObj(null);
    setExtractedData(null);
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Medical Document Digitization"
      maxWidth="max-w-2xl"
    >
      {/* 4-Step Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Upload" },
            { num: 2, label: "Reading" },
            { num: 3, label: "AI Extraction" },
            { num: 4, label: "Verify & Save" }
          ].map((item, idx) => (
            <div key={item.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > item.num
                  ? 'bg-emerald-600 text-white'
                  : step === item.num
                  ? 'bg-health-600 text-white shadow-md shadow-health-600/30 ring-4 ring-health-100'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > item.num ? <Check className="w-4 h-4" /> : item.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${
                step >= item.num ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
              {idx < 3 && <div className={`w-6 sm:w-12 h-0.5 ${step > item.num ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Initial Upload Dropzone */}
      {step === 1 && !selectedFile && (
        <div className="space-y-6">
          <label className="block p-8 border-2 border-dashed border-health-300 hover:border-health-500 rounded-3xl bg-health-50/40 hover:bg-health-50/80 transition-all text-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-white text-health-600 flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              Drag & drop medical report or <span className="text-health-700 underline">browse file</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supported: PDF, JPG, PNG (Simulated OCR Digitization)
            </p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
          </label>

          {/* Quick Demo Pre-selected Upload Options */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Or Try A Demo Document
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSampleSelect('Blood_Test_Report_CBC.pdf', 'Reports')}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-health-50 hover:border-health-300 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-health-800 truncate">Blood Test (CBC) Report</p>
                  <p className="text-[11px] text-slate-400">PDF • 1.4 MB</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSampleSelect('Prescription_Followup.jpg', 'Prescriptions')}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-health-50 hover:border-health-300 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-health-800 truncate">Prescription Slip</p>
                  <p className="text-[11px] text-slate-400">JPG • 850 KB</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps 1, 2, 3 Animated Ingestion States */}
      {(step === 1 || step === 2 || step === 3) && selectedFile && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-health-50 text-health-600 flex items-center justify-center border border-health-200 shadow-glow">
              {step === 1 && <UploadCloud className="w-10 h-10 animate-bounce" />}
              {step === 2 && <FileText className="w-10 h-10 animate-pulse" />}
              {step === 3 && <Sparkles className="w-10 h-10 text-teal-600 animate-spin" />}
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-800">
              {step === 1 && "Uploading document..."}
              {step === 2 && "Reading document structure & text..."}
              {step === 3 && "AI extracting clinical values & observations..."}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Digitizing {selectedFile} and converting medical parameters into structured health timeline entries.
            </p>
          </div>

          <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-health-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${step === 1 ? '30%' : step === 2 ? '65%' : '90%'}` }}
            />
          </div>
        </div>
      )}

      {/* Step 4: Verification Screen */}
      {step === 4 && (
        <div className="space-y-5 animate-slide-up">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                AI Extracted Information
              </h5>
              <p className="text-xs text-emerald-700 mt-0.5">
                AI extracted this information from your document. Please verify the details below before saving.
              </p>
            </div>
          </div>

          {/* Form Fields for Verification / Editing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document Details
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-health-700 hover:text-health-800"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Done Editing" : "Edit Fields"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  disabled={!isEditing}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${
                    isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Report Date</label>
                <input
                  type="date"
                  value={reportDate}
                  disabled={!isEditing}
                  onChange={(e) => setReportDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${
                    isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor</label>
                <input
                  type="text"
                  value={doctor}
                  disabled={!isEditing}
                  onChange={(e) => setDoctor(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm ${
                    isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital / Lab</label>
                <input
                  type="text"
                  value={hospital}
                  disabled={!isEditing}
                  onChange={(e) => setHospital(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm ${
                    isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Extracted Biomarker / Clinical snippet */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Key Observation / Biomarker</label>
              <input
                type="text"
                value={hemoglobin}
                disabled={!isEditing}
                onChange={(e) => setHemoglobin(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${
                  isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">AI Clinical Summary</label>
              <textarea
                value={aiSummary}
                disabled={!isEditing}
                onChange={(e) => setAiSummary(e.target.value)}
                rows="2"
                className={`w-full px-3 py-2 rounded-xl text-sm ${
                  isEditing ? 'bg-white border border-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-health-600 hover:bg-health-700 rounded-2xl shadow-md shadow-health-600/20 hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save to Timeline</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
