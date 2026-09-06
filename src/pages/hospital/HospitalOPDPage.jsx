import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  ChevronRight, 
  Stethoscope, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Filter,
  FileText,
  Printer
} from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';
import { PrintablePrescriptionModal } from '../../components/hospital/PrintablePrescriptionModal';

export const HospitalOPDPage = () => {
  const navigate = useNavigate();
  const { doctor, opdQueue, selectPatientForConsultation, completedConsultations, registerOpdPatient } = useDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEncounterForView, setSelectedEncounterForView] = useState(null);

  // New patient form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAbha, setNewPatientAbha] = useState('');
  const [newPatientComplaint, setNewPatientComplaint] = useState('');
  const [newPatientPriority, setNewPatientPriority] = useState('Normal');
  const [newBpSys, setNewBpSys] = useState('120');
  const [newBpDia, setNewBpDia] = useState('80');
  const [newPulse, setNewPulse] = useState('76');
  const [newTemp, setNewTemp] = useState('98.6');

  // Filtered queue
  const filteredQueue = opdQueue.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abhaAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesPriority = priorityFilter === 'ALL' || p.triagePriority.toUpperCase() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const waitingCount = opdQueue.filter(p => p.status === 'Waiting').length;
  const inConsultCount = opdQueue.filter(p => p.status === 'In Consultation').length;
  const completedCount = completedConsultations.length;

  const handleStartConsultation = (patientId) => {
    selectPatientForConsultation(patientId);
    navigate(`/hospital/case-taking/${patientId}`);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    registerOpdPatient({
      name: newPatientName,
      age: newPatientAge,
      gender: newPatientGender,
      phone: newPatientPhone,
      abhaAddress: newPatientAbha || `${newPatientName.toLowerCase().replace(/\s+/g, '.')}@abdm`,
      chiefComplaint: newPatientComplaint || 'General OPD Examination',
      triagePriority: newPatientPriority,
      vitals: {
        bpSystolic: Number(newBpSys) || 120,
        bpDiastolic: Number(newBpDia) || 80,
        pulse: Number(newPulse) || 76,
        spO2: 98,
        temperature: Number(newTemp) || 98.6,
        respRate: 16,
        grbs: 104,
      }
    });

    // Reset & close
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientPhone('');
    setNewPatientAbha('');
    setNewPatientComplaint('');
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hospital & Attending Physician Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Building2 className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-[11px] tracking-wide border border-emerald-400/30">
                  HOSPITAL OPD CLINICAL DESK
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono">
                  Facility ID: {doctor.facilityId}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ABDM Verified HIP
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {doctor.hospitalName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Attending: <strong className="text-white">{doctor.name}</strong> ({doctor.qualifications}) • NMC Reg: <span className="font-mono text-emerald-300">{doctor.mciRegistrationNumber}</span> • {doctor.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Intake Walk-in Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital OPD Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total OPD Today</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{opdQueue.length + completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Waiting in OPD</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{waitingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active In Consult</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{inConsultCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Signed & Verified</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Triage Queue & Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {/* Table Filter & Search Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Live OPD Patient Queue & Triage Desk
            </h3>
            <p className="text-xs text-slate-500">
              Verified clinician intake roster • Select a patient to begin clinical case-taking
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search token, ABHA, MRN, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 w-56 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {['ALL', 'HIGH RISK', 'URGENT', 'NORMAL'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    priorityFilter === p
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="divide-y divide-slate-100">
          {filteredQueue.map((patient) => {
            const isHighRisk = patient.triagePriority === 'High Risk';
            const isUrgent = patient.triagePriority === 'Urgent';
            const isCompleted = patient.status === 'Completed';

            return (
              <div 
                key={patient.id}
                className="p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Token, Demographics & Chief Complaints */}
                <div className="flex items-start gap-4">
                  <div className={`px-3 py-2 rounded-2xl font-mono font-black text-sm flex flex-col items-center justify-center shrink-0 border ${
                    isHighRisk
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isUrgent
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <span>{patient.token}</span>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400">Token</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {patient.name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {patient.age}y / {patient.gender} • Blood: <strong className="text-slate-700">{patient.bloodGroup}</strong>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        isHighRisk
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : isUrgent
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {patient.triagePriority}
                      </span>
                      {patient.status === 'In Consultation' && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold animate-pulse">
                          In Consult
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          Completed ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Complaint:</span>
                      <span>{patient.chiefComplaint}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                      <span>MRN: {patient.mrn}</span>
                      <span>•</span>
                      <span>ABHA: {patient.abhaAddress}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-sans text-slate-500">
                        <Clock className="w-3 h-3" />
                        Wait: {patient.waitingTimeMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Clinical Triage Vitals snapshot */}
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 text-xs shrink-0">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">Triage BP</span>
                    <span className={`font-bold text-xs ${patient.vitals.bpSystolic > 140 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">Pulse</span>
                    <span className="font-bold text-xs text-slate-800">{patient.vitals.pulse} bpm</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">SpO2</span>
                    <span className="font-bold text-xs text-emerald-700">{patient.vitals.spO2}%</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">Temp</span>
                    <span className={`font-bold text-xs ${patient.vitals.temperature > 99.5 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {patient.vitals.temperature}°F
                    </span>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleStartConsultation(patient.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{patient.status === 'In Consultation' ? 'Resume Consult' : 'Start Consult'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const rec = completedConsultations.find(c => c.patientId === patient.id) || {
                          patientName: patient.name,
                          patientAge: patient.age,
                          patientGender: patient.gender,
                          patientAbha: patient.abhaAddress,
                          patientMrn: patient.mrn,
                          doctorName: doctor.name,
                          doctorRegNo: doctor.mciRegistrationNumber,
                          hospitalName: doctor.hospitalName,
                          department: doctor.department,
                          diagnosis: 'Acute Bronchitis',
                          signedAt: new Date().toISOString(),
                          vitals: patient.vitals,
                        };
                        setSelectedEncounterForView(rec);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Signed Rx</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredQueue.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No patients in queue</h4>
              <p className="text-xs text-slate-500 mt-1">
                Use the "Intake Walk-in Patient" button to add a new patient to the OPD roster.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Intake Walk-In Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">OPD Patient Triage & Intake</h3>
                <p className="text-xs text-slate-500">Register walk-in patient with triage measurements</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age & Gender</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      placeholder="Age"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                    <select
                      value={newPatientGender}
                      onChange={(e) => setNewPatientGender(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ABHA Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="name@abdm"
                    value={newPatientAbha}
                    onChange={(e) => setNewPatientAbha(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fever with chills, throat irritation since 2 days"
                  value={newPatientComplaint}
                  onChange={(e) => setNewPatientComplaint(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Triage Priority Level</label>
                <select
                  value={newPatientPriority}
                  onChange={(e) => setNewPatientPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Normal">Normal (Routine OPD Review)</option>
                  <option value="Urgent">Urgent (Severe Symptoms / High Fever)</option>
                  <option value="High Risk">High Risk (Chest Discomfort / Hypertensive Urgency)</option>
                </select>
              </div>

              {/* Triage Vitals Input */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800 mb-2">Hospital Triage Vitals</p>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">BP Sys</label>
                    <input
                      type="number"
                      value={newBpSys}
                      onChange={(e) => setNewBpSys(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">BP Dia</label>
                    <input
                      type="number"
                      value={newBpDia}
                      onChange={(e) => setNewBpDia(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={newPulse}
                      onChange={(e) => setNewPulse(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Temp (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newTemp}
                      onChange={(e) => setNewTemp(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Issue OPD Token & Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Signed Prescription Modal */}
      {selectedEncounterForView && (
        <PrintablePrescriptionModal
          isOpen={Boolean(selectedEncounterForView)}
          onClose={() => setSelectedEncounterForView(null)}
          consultation={selectedEncounterForView}
        />
      )}
    </div>
  );
};
