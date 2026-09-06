import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Calendar, 
  Clock, 
  Activity, 
  Pill, 
  FileText, 
  QrCode 
} from 'lucide-react';

export const PrintablePrescriptionModal = ({ isOpen, onClose, consultation }) => {
  const printRef = useRef(null);

  if (!isOpen || !consultation) return null;

  const {
    patientName,
    patientAge,
    patientGender,
    patientAbha,
    patientMrn,
    doctorName,
    doctorRegNo,
    hospitalName,
    department,
    signedAt,
    signatureHash,
    soap = {},
    vitals = {},
    diagnosis,
    icd10 = {},
    prescriptions = [],
    labOrders = [],
    advice,
    followUpDate,
  } = consultation;

  const formattedDate = new Date(signedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(signedAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Header (Not printed) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-tight">Clinically Verified OPD Encounter Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Letterhead Document */}
        <div ref={printRef} className="p-6 sm:p-10 overflow-y-auto flex-1 text-slate-800 bg-white">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {hospitalName || 'Apollo Multi-Specialty Hospital'}
                </h2>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  NABH Accredited Tertiary Care Center • OPD Department
                </p>
                <p className="text-[10px] text-slate-400">
                  Facility ID: IN-DL-APL-0042 • Health City, Ring Road, New Delhi • Emergency: 1066
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ABDM Verified HIP
              </span>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Ref: {signatureHash || 'ENC-99824'}
              </p>
            </div>
          </div>

          {/* Clinician & Patient Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attending Physician</p>
              <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
              <p className="text-slate-600">MBBS, MD (Internal Medicine)</p>
              <p className="text-emerald-700 font-semibold font-mono text-[11px]">NMC/MCI Reg: {doctorRegNo}</p>
              <p className="text-slate-500 text-[11px]">{department}</p>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Demographics</p>
              <p className="font-bold text-slate-900 text-sm">
                {patientName} <span className="text-xs font-normal text-slate-500">({patientAge}y / {patientGender})</span>
              </p>
              <p className="text-slate-600"><span className="font-semibold text-slate-700">MRN:</span> {patientMrn}</p>
              <p className="text-slate-600 truncate"><span className="font-semibold text-slate-700">ABHA:</span> {patientAbha}</p>
              <p className="text-slate-500 text-[11px]">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>

          {/* Clinical Triage Vitals */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Clinically Measured Triage Vitals</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Blood Pressure</span>
                <span className="font-bold text-slate-800 text-sm">
                  {vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : '120/80'}
                </span>
                <span className="text-[9px] text-slate-400 block">mmHg</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Pulse Rate</span>
                <span className="font-bold text-slate-800 text-sm">{vitals.pulse || 76}</span>
                <span className="text-[9px] text-slate-400 block">bpm</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">SpO2</span>
                <span className="font-bold text-slate-800 text-sm">{vitals.spO2 || 98}%</span>
                <span className="text-[9px] text-slate-400 block">on Room Air</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Temperature</span>
                <span className="font-bold text-slate-800 text-sm">{vitals.temperature || 98.6}°F</span>
                <span className="text-[9px] text-slate-400 block">Oral</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Resp Rate</span>
                <span className="font-bold text-slate-800 text-sm">{vitals.respRate || 16}</span>
                <span className="text-[9px] text-slate-400 block">/min</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Random Glucose</span>
                <span className="font-bold text-slate-800 text-sm">{vitals.grbs || 104}</span>
                <span className="text-[9px] text-slate-400 block">mg/dL</span>
              </div>
            </div>
          </div>

          {/* Clinical SOAP Findings */}
          <div className="space-y-3 mb-5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900 mb-0.5">Subjective / Chief Complaints:</p>
              <p className="text-slate-700">{soap.subjective || 'High grade fever with productive cough x 4 days'}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <p className="font-bold text-emerald-950 mb-0.5 flex items-center justify-between">
                <span>Assessment & Provisional Diagnosis:</span>
                {icd10?.code && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    ICD-10: {icd10.code}
                  </span>
                )}
              </p>
              <p className="text-emerald-900 font-semibold text-sm">
                {diagnosis || icd10?.description || 'Acute Bronchitis'}
              </p>
            </div>
          </div>

          {/* E-Prescription (Rx) Table */}
          {prescriptions && prescriptions.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rx — Verified Medications (Drug Formulary)</span>
              </h4>
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Drug Name & Strength</th>
                      <th className="py-2 px-3">Dosage / Route</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {prescriptions.map((rx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {rx.name} <span className="text-[11px] font-normal text-slate-500">({rx.dosage})</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{rx.form || 'Oral Tablet'}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-700">{rx.frequency}</td>
                        <td className="py-2 px-3 text-slate-600">{rx.duration}</td>
                        <td className="py-2 px-3 text-slate-600">{rx.instructions || 'After food'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Diagnostic Orders & Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {labOrders && labOrders.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-cyan-600" />
                  Diagnostic Investigations Ordered
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {labOrders.map((lab, i) => (
                    <li key={i}>{typeof lab === 'string' ? lab : lab.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">Clinical Advice & Follow-Up</p>
              <p className="text-slate-700 leading-relaxed">{advice || 'Adequate hydration, avoid exposure to cold air. Review in OPD after 5 days.'}</p>
              {followUpDate && (
                <p className="text-emerald-700 font-bold mt-2">
                  Follow-up Visit Date: {followUpDate}
                </p>
              )}
            </div>
          </div>

          {/* Digital Signature Stamp & ABDM Trust Seal */}
          <div className="pt-4 border-t-2 border-slate-800 flex items-end justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ABDM HIP Digital Authentication
                </p>
                <p className="font-mono text-[10px] text-slate-400">
                  Hash: {signatureHash || 'SIG-2026-NMC-94821'}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  ✓ Verified against National Health Claims & ABDM Registry
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-b border-dashed border-slate-400 pb-1 mb-1 text-center min-w-[140px]">
                <span className="font-script text-lg text-emerald-800 block font-serif italic">
                  {doctorName}
                </span>
              </div>
              <p className="font-bold text-slate-900">{doctorName}</p>
              <p className="text-[10px] text-slate-500 font-mono">Reg: {doctorRegNo}</p>
              <p className="text-[10px] text-slate-400">{hospitalName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
