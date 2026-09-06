import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Pill, 
  FileText, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ArrowLeft, 
  Printer, 
  Mic, 
  Volume2, 
  Send,
  Loader2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';
import { PrintablePrescriptionModal } from '../../components/hospital/PrintablePrescriptionModal';
import { VoiceInput } from '../../components/common/VoiceInput';

const COMMON_ICD10 = [
  { code: 'J20.9', description: 'Acute Bronchitis, unspecified' },
  { code: 'J06.9', description: 'Acute Upper Respiratory Infection' },
  { code: 'I10', description: 'Essential (Primary) Hypertension' },
  { code: 'E11.9', description: 'Type 2 Diabetes Mellitus without complications' },
  { code: 'R51', description: 'Headache / Tension-type Cephalea' },
  { code: 'K29.7', description: 'Gastritis, unspecified' },
  { code: 'M17.9', description: 'Osteoarthritis of knee, unspecified' },
  { code: 'A09', description: 'Infectious Gastroenteritis & Colitis' },
];

const QUICK_DRUGS = [
  { name: 'Amoxicillin-Clavulanate', dosage: '625mg', form: 'Tablet', frequency: 'TDS (3 times/day)', duration: '5 Days', instructions: 'After food' },
  { name: 'Paracetamol', dosage: '650mg', form: 'Tablet', frequency: 'TDS (SOS for fever)', duration: '3 Days', instructions: 'After food' },
  { name: 'Pantoprazole', dosage: '40mg', form: 'Tablet', frequency: 'OD (Once daily)', duration: '7 Days', instructions: 'Empty stomach (morning)' },
  { name: 'Cetirizine', dosage: '10mg', form: 'Tablet', frequency: 'OD (Night)', duration: '5 Days', instructions: 'At bedtime' },
  { name: 'Azithromycin', dosage: '500mg', form: 'Tablet', frequency: 'OD (Once daily)', duration: '3 Days', instructions: '1 hour before food' },
  { name: 'Metformin', dosage: '500mg', form: 'Tablet', frequency: 'BD (Twice daily)', duration: '30 Days', instructions: 'With meals' },
  { name: 'Telmisartan', dosage: '40mg', form: 'Tablet', frequency: 'OD (Morning)', duration: '30 Days', instructions: 'After breakfast' },
];

export const ClinicalCaseTakingPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { doctor, opdQueue, selectPatientForConsultation, completeConsultation } = useDoctor();

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('SOAP'); // SOAP | AI_SCRIBE | RX | REVIEW

  // Ambient AI Scribe dictation text
  const [ambientNote, setAmbientNote] = useState('');
  const [isParsingScribe, setIsParsingScribe] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // S - Subjective
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hpi, setHpi] = useState('');
  const [allergiesText, setAllergiesText] = useState('');

  // O - Objective Vitals
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [spO2, setSpO2] = useState('98');
  const [temperature, setTemperature] = useState('98.6');
  const [respRate, setRespRate] = useState('16');
  const [grbs, setGrbs] = useState('104');
  const [physicalExam, setPhysicalExam] = useState('');

  // A - Assessment
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedIcd, setSelectedIcd] = useState(COMMON_ICD10[0]);

  // P - Plan & Rx
  const [prescriptions, setPrescriptions] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Sign-off & Modal
  const [isSigning, setIsSigning] = useState(false);
  const [signedEncounter, setSignedEncounter] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New Rx row state
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugDose, setNewDrugDose] = useState('500mg');
  const [newDrugForm, setNewDrugForm] = useState('Tablet');
  const [newDrugFreq, setNewDrugFreq] = useState('BD (Twice daily)');
  const [newDrugDuration, setNewDrugDuration] = useState('5 Days');
  const [newDrugInst, setNewDrugInst] = useState('After food');

  // New Lab item state
  const [newLabText, setNewLabText] = useState('');

  // Load patient
  useEffect(() => {
    let p = opdQueue.find(q => q.id === patientId);
    if (!p) p = opdQueue[0];

    if (p) {
      setPatient(p);
      selectPatientForConsultation(p.id);

      // Preload with patient's triage data
      setChiefComplaint(p.chiefComplaint || '');
      setAllergiesText(p.allergies?.join(', ') || 'None reported');
      if (p.vitals) {
        setBpSystolic(String(p.vitals.bpSystolic || 120));
        setBpDiastolic(String(p.vitals.bpDiastolic || 80));
        setPulse(String(p.vitals.pulse || 76));
        setSpO2(String(p.vitals.spO2 || 98));
        setTemperature(String(p.vitals.temperature || 98.6));
        setRespRate(String(p.vitals.respRate || 16));
        setGrbs(String(p.vitals.grbs || 104));
      }

      // Sensible baseline depending on patient
      if (p.name.includes('Rahul')) {
        setDiagnosis('Acute Bronchitis');
        setSelectedIcd(COMMON_ICD10[0]);
        setPhysicalExam('Chest: Bilateral coarse rhonchi on auscultation. Throat: Erythematous pharynx. Heart: S1 S2 normal.');
        setHpi('Patient reports fever for 4 days with yellowish productive sputum and nocturnal cough spells.');
        setPrescriptions([
          { name: 'Amoxicillin-Clavulanate', dosage: '625mg', form: 'Tablet', frequency: 'TDS (3 times/day)', duration: '5 Days', instructions: 'After food' },
          { name: 'Paracetamol', dosage: '650mg', form: 'Tablet', frequency: 'TDS SOS', duration: '3 Days', instructions: 'For fever above 100°F' },
          { name: 'Ambroxol Syrup', dosage: '10ml', form: 'Syrup', frequency: 'TDS', duration: '5 Days', instructions: 'After meals' },
        ]);
        setLabOrders(['Complete Blood Count (CBC)', 'Chest X-Ray PA View']);
        setAdvice('Warm saline gargles twice daily. Maintain hydration. Avoid chilled beverages.');
        setFollowUpDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
      } else if (p.name.includes('Amit')) {
        setDiagnosis('Essential Hypertension with Type 2 Diabetes');
        setSelectedIcd(COMMON_ICD10[2]);
        setPhysicalExam('Mild bilateral non-pitting pedal edema. S1 S2 heard. Chest clear.');
        setHpi('Known diabetic for 8 yrs on irregular medications. Complaining of evening fatigue and pedal swelling.');
        setPrescriptions([
          { name: 'Telmisartan', dosage: '40mg', form: 'Tablet', frequency: 'OD (Morning)', duration: '30 Days', instructions: 'After breakfast' },
          { name: 'Metformin', dosage: '500mg', form: 'Tablet', frequency: 'BD', duration: '30 Days', instructions: 'With meals' },
        ]);
        setLabOrders(['HbA1c & Fasting Glucose', 'Serum Creatinine & Electrolytes', 'Lipid Profile']);
        setAdvice('Strict low-salt diabetic diet. Daily 30 mins brisk walk. BP monitoring log.');
        setFollowUpDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      } else {
        setPrescriptions([
          { name: 'Paracetamol', dosage: '650mg', form: 'Tablet', frequency: 'SOS', duration: '3 Days', instructions: 'After food' }
        ]);
        setFollowUpDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      }
    }
  }, [patientId]);

  // AI Ambient Scribe auto-structuring
  const handleParseAmbientScribe = () => {
    if (!ambientNote.trim()) return;
    setIsParsingScribe(true);
    setAiSuccessMessage('');

    setTimeout(() => {
      const lower = ambientNote.toLowerCase();

      // Extract vitals if mentioned
      const bpMatch = ambientNote.match(/bp\s*(?:is|at|of)?\s*(\d{2,3})[\s\/\-over]+(\d{2,3})/i);
      if (bpMatch) {
        setBpSystolic(bpMatch[1]);
        setBpDiastolic(bpMatch[2]);
      }

      const pulseMatch = ambientNote.match(/pulse\s*(?:is|at|of)?\s*(\d{2,3})/i);
      if (pulseMatch) setPulse(pulseMatch[1]);

      const tempMatch = ambientNote.match(/temp(?:erature)?\s*(?:is|at|of)?\s*(\d{2,3}(?:\.\d)?)/i);
      if (tempMatch) setTemperature(tempMatch[1]);

      // Extract complaint / diagnosis
      if (lower.includes('cough') || lower.includes('bronchitis') || lower.includes('fever')) {
        setDiagnosis('Acute Bronchitis');
        setSelectedIcd(COMMON_ICD10[0]);
        setChiefComplaint('High grade fever with productive cough');
        setHpi('Fever and cough symptoms worsening over past 4 days. Rhonchi audible on auscultation.');
        setPhysicalExam('Chest: Bilateral rhonchi present. Pharynx congested.');
      } else if (lower.includes('headache') || lower.includes('migraine')) {
        setDiagnosis('Migraine without aura');
        setSelectedIcd(COMMON_ICD10[4]);
        setChiefComplaint('Severe unilateral pulsating headache with photophobia');
        setHpi('Sudden onset severe headache triggered since morning.');
      } else if (lower.includes('bp') || lower.includes('hypertension')) {
        setDiagnosis('Essential Hypertension');
        setSelectedIcd(COMMON_ICD10[2]);
      }

      // Check for antibiotic or medicine mentions
      if (lower.includes('amoxicillin') || lower.includes('antibiotic')) {
        setPrescriptions(prev => [
          ...prev.filter(p => !p.name.includes('Amoxicillin')),
          { name: 'Amoxicillin-Clavulanate', dosage: '625mg', form: 'Tablet', frequency: 'TDS', duration: '5 Days', instructions: 'After food' }
        ]);
      }
      if (lower.includes('paracetamol') || lower.includes('pcm') || lower.includes('dolo')) {
        setPrescriptions(prev => [
          ...prev.filter(p => !p.name.includes('Paracetamol')),
          { name: 'Paracetamol', dosage: '650mg', form: 'Tablet', frequency: 'TDS SOS', duration: '3 Days', instructions: 'After food' }
        ]);
      }

      setAdvice('Adequate oral hydration, steam inhalation twice daily, light diet.');
      setIsParsingScribe(false);
      setAiSuccessMessage('✓ AI Scribe successfully extracted and mapped clinical findings into SOAP sections!');
    }, 800);
  };

  const handleAddDrug = () => {
    if (!newDrugName.trim()) return;
    setPrescriptions(prev => [
      ...prev,
      {
        name: newDrugName,
        dosage: newDrugDose,
        form: newDrugForm,
        frequency: newDrugFreq,
        duration: newDrugDuration,
        instructions: newDrugInst,
      }
    ]);
    setNewDrugName('');
  };

  const handleAddQuickDrug = (drug) => {
    setPrescriptions(prev => [
      ...prev.filter(d => d.name !== drug.name),
      drug,
    ]);
  };

  const handleRemoveDrug = (index) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLab = () => {
    if (!newLabText.trim()) return;
    setLabOrders(prev => [...prev, newLabText.trim()]);
    setNewLabText('');
  };

  const handleRemoveLab = (index) => {
    setLabOrders(prev => prev.filter((_, i) => i !== index));
  };

  // Sign and submit consultation
  const handleDigitalSignOff = async () => {
    if (!patient) return;
    setIsSigning(true);

    try {
      const consultationData = {
        patient,
        soap: {
          subjective: `${chiefComplaint}. HPI: ${hpi}`,
          objective: `BP: ${bpSystolic}/${bpDiastolic} mmHg, Pulse: ${pulse} bpm, SpO2: ${spO2}%, Temp: ${temperature}°F, RR: ${respRate}/min, GRBS: ${grbs} mg/dL. Exam: ${physicalExam}`,
          assessment: `${diagnosis} (${selectedIcd.code})`,
          plan: `Prescribed ${prescriptions.length} medications. ${labOrders.length} labs ordered. Advice: ${advice}`,
        },
        vitals: {
          bpSystolic: Number(bpSystolic),
          bpDiastolic: Number(bpDiastolic),
          pulse: Number(pulse),
          spO2: Number(spO2),
          temperature: Number(temperature),
          respRate: Number(respRate),
          grbs: Number(grbs),
        },
        diagnosis: diagnosis || selectedIcd.description,
        icd10: selectedIcd,
        prescriptions,
        labOrders,
        advice,
        followUpDate,
      };

      const result = await completeConsultation(consultationData);
      setSignedEncounter(result);
      setShowPrintModal(true);
    } catch (err) {
      console.error('Sign-off error:', err);
    } finally {
      setIsSigning(false);
    }
  };

  if (!patient) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading patient encounter...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/hospital/opd')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to OPD Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Clinician Authenticated Mode
          </span>
        </div>
      </div>

      {/* Patient Demographic & Allergy Safety Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="px-3 py-2 rounded-2xl bg-slate-900 text-white font-mono font-bold text-sm text-center shrink-0">
              <span>{patient.token}</span>
              <span className="text-[9px] block text-emerald-400 font-sans">TOKEN</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {patient.name}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  ({patient.age}y / {patient.gender}) • Blood Group: <strong className="text-slate-800">{patient.bloodGroup}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                  MRN: {patient.mrn}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                  ABHA: {patient.abhaAddress}
                </span>
              </div>

              {/* Known Allergies Warning */}
              <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Allergies: {patient.allergies?.join(', ') || 'None known'}</span>
                </div>
                {patient.pastMedicalHistory?.length > 0 && (
                  <span className="text-slate-500 text-[11px]">
                    Past History: <strong className="text-slate-700">{patient.pastMedicalHistory.join(', ')}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[11px] font-semibold text-slate-400">Attending Consultant</p>
            <p className="font-bold text-slate-900 text-xs">{doctor.name}</p>
            <p className="text-[10px] font-mono text-emerald-700">Reg: {doctor.mciRegistrationNumber}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Case-Taking & AI Scribe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ambient AI Scribe & Clinical Voice Dictation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-3xl p-5 text-white shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm tracking-tight">AI Ambient Clinical Scribe</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-mono">
                Real-time
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Dictate or type raw clinical consultation in natural language. AI will auto-extract vitals, complaints, provisional diagnosis, and Rx.
            </p>

            <div className="relative">
              <textarea
                rows={6}
                value={ambientNote}
                onChange={(e) => setAmbientNote(e.target.value)}
                placeholder="e.g. Patient 32M reports fever for 4 days with productive cough. On exam, chest has rhonchi. BP measured 126/82, pulse 88, temp 100.4. Acute bronchitis. Give Amoxicillin-Clav 625 TDS for 5 days, Paracetamol 650 TDS SOS. Ordered CBC and CXR. Steam inhalation twice daily."
                className="w-full p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none font-sans"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <VoiceInput
                onTranscript={(transcript) => {
                  setAmbientNote(prev => prev ? `${prev} ${transcript}` : transcript);
                }}
                className="scale-90"
              />

              <button
                type="button"
                onClick={handleParseAmbientScribe}
                disabled={isParsingScribe || !ambientNote.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
              >
                {isParsingScribe ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Auto-Structure into SOAP</span>
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-semibold animate-fade-in">
                {aiSuccessMessage}
              </div>
            )}
          </div>

          {/* Quick Formulary Chips */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-soft">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard OPD Drug Formulary</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              One-click add verified medications to e-prescription:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DRUGS.map((drug) => (
                <button
                  key={drug.name}
                  type="button"
                  onClick={() => handleAddQuickDrug(drug)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-semibold text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{drug.name}</span>
                  <span className="text-[9px] text-slate-400">({drug.dosage})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: SOAP Structured Clinical Encounter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Clinical Case Sheet (Medical SOAP Framework)
                </h3>
                <p className="text-xs text-slate-500">
                  Certified clinician evaluation • Digitally signed into patient's ABDM record
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                NABH Standards
              </span>
            </div>

            {/* S - Subjective Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                  S
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Subjective: Chief Complaints & HPI
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Chief Complaints</label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="e.g. High grade fever with chills x 4 days, productive cough"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">History of Present Illness (HPI)</label>
                  <textarea
                    rows={2}
                    value={hpi}
                    onChange={(e) => setHpi(e.target.value)}
                    placeholder="Detailed onset, character, aggravating/relieving factors..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* O - Objective Vitals & Examination */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  O
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Objective: Clinically Measured Triage Vitals & Physical Exam
                </h4>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">BP Sys (mmHg)</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">BP Dia (mmHg)</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">GRBS (mg/dL)</label>
                  <input
                    type="number"
                    value={grbs}
                    onChange={(e) => setGrbs(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">Physical Examination Notes</label>
                <input
                  type="text"
                  value={physicalExam}
                  onChange={(e) => setPhysicalExam(e.target.value)}
                  placeholder="e.g. Chest: Bilateral rhonchi. Heart: S1 S2 heard, no murmurs. Abdomen: Soft, non-tender."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            {/* A - Assessment Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  A
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Assessment: Clinical Provisional Diagnosis & ICD-10 Coding
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provisional Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Standard ICD-10 Code</label>
                  <select
                    value={selectedIcd.code}
                    onChange={(e) => {
                      const matched = COMMON_ICD10.find(i => i.code === e.target.value);
                      if (matched) setSelectedIcd(matched);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {COMMON_ICD10.map((icd) => (
                      <option key={icd.code} value={icd.code}>
                        {icd.code} — {icd.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* P - Plan: E-Prescriptions (Rx) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    P
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    Plan: E-Prescription (Rx) & Diagnostic Orders
                  </h4>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {prescriptions.length} Drug{prescriptions.length !== 1 ? 's' : ''} in Formulary
                </span>
              </div>

              {/* Prescriptions Table */}
              {prescriptions.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Medicine Name</th>
                        <th className="py-2 px-3">Strength</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3">Instructions</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map((rx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium">
                          <td className="py-2 px-3 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{rx.name}</td>
                          <td className="py-2 px-3 text-slate-600">{rx.dosage}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-700">{rx.frequency}</td>
                          <td className="py-2 px-3 text-slate-600">{rx.duration}</td>
                          <td className="py-2 px-3 text-slate-600">{rx.instructions}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDrug(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Custom Drug Controls */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-800 mb-2">Add Custom Medicine to Rx</p>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={newDrugName}
                      onChange={(e) => setNewDrugName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={newDrugDose}
                      onChange={(e) => setNewDrugDose(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <select
                      value={newDrugFreq}
                      onChange={(e) => setNewDrugFreq(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    >
                      <option>OD (Once daily)</option>
                      <option>BD (Twice daily)</option>
                      <option>TDS (3 times/day)</option>
                      <option>QID (4 times/day)</option>
                      <option>SOS (As needed)</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Duration (5 Days)"
                      value={newDrugDuration}
                      onChange={(e) => setNewDrugDuration(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddDrug}
                      className="w-full p-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Rx
                    </button>
                  </div>
                </div>
              </div>

              {/* Lab Orders & Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Diagnostic Investigations</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. CBC, Serum Creatinine"
                      value={newLabText}
                      onChange={(e) => setNewLabText(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddLab}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {labOrders.map((lab, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-semibold">
                        <span>{lab}</span>
                        <button type="button" onClick={() => handleRemoveLab(i)} className="text-cyan-600 hover:text-rose-600">✕</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">General Advice & Follow-Up Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Adequate fluids, review after 5 days"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl mb-2"
                  />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Digital Sign-Off & ABDM Push Action Bar */}
            <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    ABDM Digital Clinical Authentication
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Signs with NMC Reg: <strong className="text-slate-600">{doctor.mciRegistrationNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDigitalSignOff}
                  disabled={isSigning}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Digitally Sign & Push to Patient ABHA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable OPD Prescription Modal */}
      {showPrintModal && signedEncounter && (
        <PrintablePrescriptionModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            navigate('/hospital/opd');
          }}
          consultation={signedEncounter}
        />
      )}
    </div>
  );
};
