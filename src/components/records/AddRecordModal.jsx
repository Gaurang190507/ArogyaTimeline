import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHealth } from '../../context/HealthContext';
import { useLanguage } from '../../context/LanguageContext';
import { recordTypeConfig, recordTypesList } from './RecordTypeIcon';
import { VoiceInput } from '../common/VoiceInput';
import { 
  Activity, 
  Droplet, 
  Scale, 
  Thermometer, 
  Pill, 
  AlertCircle, 
  Stethoscope, 
  FileText, 
  StickyNote, 
  Clock, 
  Mic, 
  Sparkles,
  UploadCloud,
  Check
} from 'lucide-react';

export const AddRecordModal = () => {
  const { isAddRecordOpen, closeAddRecord, initialRecordType, selectedDateForNewRecord, addRecord, addDocument, addReminder } = useHealth();
  const { t } = useLanguage();

  const [activeType, setActiveType] = useState('blood_pressure');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  // Store a notes value per record type so switching types doesn't lose data or leak stale text
  const [notesByType, setNotesByType] = useState({});
  const notes = notesByType[activeType] || '';
  const setNotes = (val) =>
    setNotesByType((prev) => ({ ...prev, [activeType]: typeof val === 'function' ? val(prev[activeType] || '') : val }));
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [spokenLanguage, setSpokenLanguage] = useState('en');

  // Specific form states
  // BP
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');

  // Sugar
  const [sugarValue, setSugarValue] = useState('95');
  const [sugarContext, setSugarContext] = useState('Fasting (Morning)');

  // Weight
  const [weightValue, setWeightValue] = useState('72');

  // Temperature
  const [tempValue, setTempValue] = useState('98.6');

  // Symptom
  const [symptomName, setSymptomName] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [symptomLocation, setSymptomLocation] = useState('');
  const [symptomTriggers, setSymptomTriggers] = useState('');

  // Medicine
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medFrequency, setMedFrequency] = useState('Once daily');

  // Doctor Visit
  const [doctorName, setDoctorName] = useState('Dr. Sharma');
  const [hospital, setHospital] = useState('ABC Hospital');
  const [visitDiagnosis, setVisitDiagnosis] = useState('');
  const [visitPrescriptions, setVisitPrescriptions] = useState('');

  // Note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Document
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Reports');
  const [docDoctor, setDocDoctor] = useState('Dr. Sharma');

  // Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState('Medicine');
  const [remRepeat, setRemRepeat] = useState('Daily');

  useEffect(() => {
    if (initialRecordType) {
      setActiveType(initialRecordType);
    }
    if (selectedDateForNewRecord) {
      setDate(selectedDateForNewRecord);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSpokenLanguage('en');
  }, [initialRecordType, selectedDateForNewRecord, isAddRecordOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
    switch (activeType) {
      case 'blood_pressure':
        await addRecord({
          type: 'blood_pressure',
          title: `Blood Pressure ${systolic}/${diastolic} mmHg`,
          description: notes || 'Blood pressure reading logged.',
          date,
          time,
          metadata: {
            systolic: parseInt(systolic, 10),
            diastolic: parseInt(diastolic, 10),
            pulse: pulse ? parseInt(pulse, 10) : 72,
            unit: 'mmHg',
            category: parseInt(systolic, 10) > 130 ? 'Elevated' : 'Normal',
            notes
          }
        });
        break;

      case 'blood_sugar':
        await addRecord({
          type: 'blood_sugar',
          title: `Blood Sugar ${sugarValue} mg/dL (${sugarContext})`,
          description: notes || 'Blood glucose level recorded.',
          date,
          time,
          metadata: {
            value: parseFloat(sugarValue),
            unit: 'mg/dL',
            context: sugarContext,
            notes
          }
        });
        break;

      case 'weight':
        await addRecord({
          type: 'weight',
          title: `Weight ${weightValue} kg`,
          description: notes || 'Weight measurement logged.',
          date,
          time,
          metadata: {
            value: parseFloat(weightValue),
            unit: 'kg',
            bmi: +(parseFloat(weightValue) / ((1.72) ** 2)).toFixed(1),
            notes
          }
        });
        break;

      case 'temperature':
        await addRecord({
          type: 'temperature',
          title: `Temperature ${tempValue} °F`,
          description: notes || 'Body temperature logged.',
          date,
          time,
          metadata: {
            value: parseFloat(tempValue),
            unit: '°F',
            category: parseFloat(tempValue) > 99.5 ? 'Fever' : 'Normal',
            notes
          }
        });
        break;

      case 'symptom':
        await addRecord({
          type: 'symptom',
          title: symptomName || 'Symptom Observation',
          description: notes || `Severity ${symptomSeverity}/10 - ${symptomLocation}`,
          date,
          time,
          metadata: {
            symptomName: symptomName || 'Symptom',
            severity: symptomSeverity,
            location: symptomLocation,
            triggers: symptomTriggers,
            notes
          }
        });
        break;

      case 'medicine':
        await addRecord({
          type: 'medicine',
          title: `Medicine: ${medName || 'Dose Logged'}`,
          description: `${medDosage} • ${medFrequency}`,
          date,
          time,
          metadata: {
            medicineName: medName,
            dosage: medDosage,
            frequency: medFrequency,
            status: 'Taken',
            notes
          }
        });
        break;

      case 'doctor_visit':
        await addRecord({
          type: 'doctor_visit',
          title: `Consultation with ${doctorName}`,
          description: notes || `Hospital: ${hospital}. Diagnosis: ${visitDiagnosis || 'General review'}`,
          date,
          time,
          metadata: {
            doctorName,
            hospital,
            diagnosis: visitDiagnosis,
            prescriptions: visitPrescriptions ? [visitPrescriptions] : [],
            notes
          }
        });
        break;

      case 'note':
        await addRecord({
          type: 'note',
          title: noteTitle || 'Personal Health Note',
          description: noteContent || notes,
          date,
          time,
          metadata: { notes }
        });
        break;

      case 'document':
        await addDocument({
          title: docTitle || 'Medical Document',
          type: docType,
          date,
          doctor: docDoctor,
          hospital,
          summary: notes || 'Medical document archived.'
        });
        break;

      case 'reminder':
        await addReminder({
          title: remTitle || 'Health Reminder',
          category: remCategory,
          date,
          time,
          repeat: remRepeat,
          notes
        });
        break;

      default:
        await addRecord({
          type: 'note',
          title: noteTitle || 'Health Event',
          description: notes,
          date,
          time,
          metadata: { notes }
        });
    }

    // Reset the form so a fresh open starts clean (especially notesByType)
    setNotesByType({});

    closeAddRecord();
  } catch (err) {
    console.error('[AddRecordModal] Save failed:', err.message);
    setSubmitError(err.message || 'Failed to save record. Please try again.');
    setLoading(false);
  }
  };

  // recordTypesList is imported from RecordTypeIcon.jsx to avoid duplication

  return (
    <Modal
      isOpen={isAddRecordOpen}
      onClose={closeAddRecord}
      title="Add to Health Memory"
      maxWidth="max-w-2xl"
    >
      {/* Type Selector Pills */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Select Record Type
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {recordTypesList.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setActiveType(item.type)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeType === item.type
                  ? 'bg-health-600 text-white border-health-600 shadow-md shadow-health-600/20 scale-105'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-health-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 08:30 AM"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-health-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Dynamic Fields per Record Type */}

        {/* 1. Blood Pressure */}
        {activeType === 'blood_pressure' && (
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
            <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Blood Pressure & Pulse
            </h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Systolic (mmHg)</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  required
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Diastolic (mmHg)</label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  required
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="72"
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Blood Sugar */}
        {activeType === 'blood_sugar' && (
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3">
            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5" /> Blood Glucose Level
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={sugarValue}
                  onChange={(e) => setSugarValue(e.target.value)}
                  placeholder="95"
                  required
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Context</label>
                <select
                  value={sugarContext}
                  onChange={(e) => setSugarContext(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Fasting (Morning)">Fasting (Morning)</option>
                  <option value="Before Meal">Before Meal (Pre-prandial)</option>
                  <option value="After Meal (2 hrs)">After Meal (2 hrs Post-prandial)</option>
                  <option value="Random">Random / Bedtime</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. Weight */}
        {activeType === 'weight' && (
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Body Weight
            </h5>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder="72.0"
                required
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        )}

        {/* 4. Temperature */}
        {activeType === 'temperature' && (
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-3">
            <h5 className="text-xs font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" /> Body Temperature
            </h5>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder="98.6"
                required
                className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>
        )}

        {/* 5. Symptom */}
        {activeType === 'symptom' && (
          <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
            <h5 className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Symptom Observation
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Symptom Name</label>
                <input
                  type="text"
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  placeholder="e.g. Frontal Headache, Acidity"
                  required
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Body Location</label>
                <input
                  type="text"
                  value={symptomLocation}
                  onChange={(e) => setSymptomLocation(e.target.value)}
                  placeholder="e.g. Upper abdomen, Forehead"
                  className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Severity (1 to 10)</label>
                <span className="text-xs font-bold text-orange-700">{symptomSeverity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={symptomSeverity}
                onChange={(e) => setSymptomSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 6. Medicine */}
        {activeType === 'medicine' && (
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
            <h5 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" /> Medicine Dose
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Pantoprazole 40mg"
                  required
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Dosage</label>
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="1 tablet"
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                <input
                  type="text"
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  placeholder="Once daily"
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. Doctor Visit */}
        {activeType === 'doctor_visit' && (
          <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 space-y-3">
            <h5 className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Doctor Consultation Details
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Sharma"
                  required
                  className="w-full px-3 py-2 bg-white border border-cyan-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hospital / Clinic</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="ABC Hospital"
                  className="w-full px-3 py-2 bg-white border border-cyan-200 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Diagnosis by Doctor</label>
              <input
                type="text"
                value={visitDiagnosis}
                onChange={(e) => setVisitDiagnosis(e.target.value)}
                placeholder="e.g. Mild Gastritis, Seasonal Allergy"
                className="w-full px-3 py-2 bg-white border border-cyan-200 rounded-xl text-sm font-medium"
              />
            </div>
          </div>
        )}

        {/* 8. Personal Note */}
        {activeType === 'note' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Personal Note
            </h5>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Sleep quality, Diet reflection"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows="3"
                placeholder="Write your personal health observation..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>
          </div>
        )}

        {/* 9. Document */}
        {activeType === 'document' && (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
            <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Medical Document Upload (Mock)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Blood Test Report, Lipid Profile"
                  required
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-medium"
                >
                  <option value="Reports">Reports</option>
                  <option value="Prescriptions">Prescriptions</option>
                  <option value="Scans">Scans</option>
                  <option value="Discharge Summaries">Discharge Summaries</option>
                  <option value="Other Documents">Other Documents</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 10. Reminder */}
        {activeType === 'reminder' && (
          <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 space-y-3">
            <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Reminder Schedule
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reminder Title</label>
                <input
                  type="text"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="e.g. Evening BP Check, Take Vitamin"
                  required
                  className="w-full px-3 py-2 bg-white border border-yellow-200 rounded-xl text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={remCategory}
                  onChange={(e) => setRemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-yellow-200 rounded-xl text-sm font-medium"
                >
                  <option value="Medicine">Medicine</option>
                  <option value="Doctor Visit">Doctor Visit</option>
                  <option value="Measurement">Measurement</option>
                  <option value="Test">Test</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Voice Input Assist for Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-600">
              Personal Notes / Voice Input
            </label>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="Add extra context (e.g. 'taken before breakfast after 10 mins walk')..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-health-500 focus:bg-white"
            />
          </div>
          <div className="mt-3 p-3 bg-white/70 border border-health-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-slate-500">
                Speak in
              </label>
              <select
                value={spokenLanguage}
                onChange={(e) => setSpokenLanguage(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-health-500"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
            <VoiceInput
              onResult={(speechText) => {
                // Replace notes with transcript (don't append stale text)
                if (speechText.startsWith('[Transcription error')) return;
                setNotes(speechText);
              }}
              compact={false}
              spokenLanguage={spokenLanguage}
            />
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {submitError}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAddRecord}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
            disabled={loading}
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-health-600 hover:bg-health-700 rounded-2xl shadow-md shadow-health-600/20 hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{loading ? 'Saving...' : t.common.save}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
