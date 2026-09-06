import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthRecordService } from '../services/healthRecordService';

const DoctorContext = createContext();

// Default realistic OPD patient roster for demo & hackathons
const INITIAL_OPD_QUEUE = [
  {
    id: 'pat-101',
    token: 'OPD-101',
    name: 'Rahul Sharma',
    age: 32,
    gender: 'Male',
    phone: '+91 98765 43210',
    abhaAddress: 'rahul.sharma@abdm',
    abhaNumber: '91-2849-5839-2049',
    mrn: 'MRN-2026-8841',
    bloodGroup: 'B+',
    department: 'General Medicine',
    chiefComplaint: 'High grade fever with productive cough x 4 days',
    triagePriority: 'Urgent', // Normal | Urgent | High Risk
    waitingTimeMinutes: 12,
    status: 'In Consultation', // Waiting | In Consultation | Completed
    vitals: {
      bpSystolic: 126,
      bpDiastolic: 82,
      pulse: 88,
      spO2: 98,
      temperature: 100.4,
      respRate: 18,
      grbs: 112,
    },
    allergies: ['Penicillin (mild rash)'],
    pastMedicalHistory: ['Mild Allergic Rhinitis'],
  },
  {
    id: 'pat-102',
    token: 'OPD-102',
    name: 'Priya Patel',
    age: 28,
    gender: 'Female',
    phone: '+91 98234 56789',
    abhaAddress: 'priya.patel@abdm',
    abhaNumber: '91-4820-1940-5820',
    mrn: 'MRN-2026-8842',
    bloodGroup: 'O+',
    department: 'General Medicine',
    chiefComplaint: 'Severe migraine headache with nausea since morning',
    triagePriority: 'Urgent',
    waitingTimeMinutes: 24,
    status: 'Waiting',
    vitals: {
      bpSystolic: 118,
      bpDiastolic: 76,
      pulse: 78,
      spO2: 99,
      temperature: 98.6,
      respRate: 16,
      grbs: 94,
    },
    allergies: ['None known'],
    pastMedicalHistory: ['Episodic Tension Headaches'],
  },
  {
    id: 'pat-103',
    token: 'OPD-103',
    name: 'Amit Verma',
    age: 54,
    gender: 'Male',
    phone: '+91 97112 34567',
    abhaAddress: 'amit.verma@abdm',
    abhaNumber: '91-3950-6821-9940',
    mrn: 'MRN-2026-8843',
    bloodGroup: 'A+',
    department: 'General Medicine',
    chiefComplaint: 'Routine Diabetic & HTN review; feeling bilateral pedal swelling',
    triagePriority: 'High Risk',
    waitingTimeMinutes: 38,
    status: 'Waiting',
    vitals: {
      bpSystolic: 152,
      bpDiastolic: 94,
      pulse: 84,
      spO2: 97,
      temperature: 98.4,
      respRate: 18,
      grbs: 186,
    },
    allergies: ['Sulfa drugs'],
    pastMedicalHistory: ['Type 2 Diabetes Mellitus (8 yrs)', 'Essential Hypertension (5 yrs)'],
  },
  {
    id: 'pat-104',
    token: 'OPD-104',
    name: 'Sunita Devi',
    age: 62,
    gender: 'Female',
    phone: '+91 96543 21098',
    abhaAddress: 'sunita.devi@abdm',
    abhaNumber: '91-1049-5829-3829',
    mrn: 'MRN-2026-8844',
    bloodGroup: 'AB+',
    department: 'General Medicine',
    chiefComplaint: 'Bilateral knee joint pain, morning stiffness > 30 mins',
    triagePriority: 'Normal',
    waitingTimeMinutes: 45,
    status: 'Waiting',
    vitals: {
      bpSystolic: 130,
      bpDiastolic: 80,
      pulse: 74,
      spO2: 98,
      temperature: 98.6,
      respRate: 16,
      grbs: 108,
    },
    allergies: ['NSAIDs (causes gastritis)'],
    pastMedicalHistory: ['Osteoarthritis both knees', 'Hypothyroidism'],
  },
];

const DEFAULT_DOCTOR = {
  id: 'doc-101',
  name: 'Dr. Rahul Sharma',
  qualifications: 'MBBS, MD (Internal Medicine)',
  specialty: 'Consultant Physician & Diabetologist',
  mciRegistrationNumber: 'MCI-2018-94821',
  stateCouncil: 'Delhi Medical Council',
  hospitalName: 'Apollo Multi-Specialty Hospital',
  facilityId: 'IN-DL-APL-0042',
  department: 'OPD Ward 4 - Clinical Medicine',
  roomNumber: 'OPD-Cabin 12',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=faces',
};

export const DoctorProvider = ({ children }) => {
  const [doctor] = useState(DEFAULT_DOCTOR);
  const [opdQueue, setOpdQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('hospital_opd_queue');
      return saved ? JSON.parse(saved) : INITIAL_OPD_QUEUE;
    } catch {
      return INITIAL_OPD_QUEUE;
    }
  });

  const [activePatient, setActivePatient] = useState(null);
  const [completedConsultations, setCompletedConsultations] = useState(() => {
    try {
      const saved = localStorage.getItem('hospital_completed_consultations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save queue changes
  useEffect(() => {
    try {
      localStorage.setItem('hospital_opd_queue', JSON.stringify(opdQueue));
    } catch (_) {}
  }, [opdQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('hospital_completed_consultations', JSON.stringify(completedConsultations));
    } catch (_) {}
  }, [completedConsultations]);

  // Select patient for consultation
  const selectPatientForConsultation = useCallback((patientId) => {
    const patient = opdQueue.find(p => p.id === patientId) || opdQueue[0];
    if (patient) {
      // Set status to In Consultation
      setOpdQueue(prev => prev.map(p => p.id === patient.id ? { ...p, status: 'In Consultation' } : p));
      setActivePatient(patient);
    }
    return patient;
  }, [opdQueue]);

  // Complete consultation and sign-off
  const completeConsultation = useCallback(async (consultationData) => {
    const { patient, soap, vitals, diagnosis, icd10, prescriptions, labOrders, advice, followUpDate } = consultationData;
    
    const signedAt = new Date().toISOString();
    const signatureHash = `SIG-NMC-${doctor.mciRegistrationNumber.replace(/[^0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;

    const completedRecord = {
      id: `enc-${Date.now()}`,
      encounterType: 'OPD Clinical Consultation',
      patientId: patient.id,
      patientName: patient.name,
      patientAbha: patient.abhaAddress,
      patientMrn: patient.mrn,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorName: doctor.name,
      doctorRegNo: doctor.mciRegistrationNumber,
      hospitalName: doctor.hospitalName,
      department: doctor.department,
      signedAt,
      signatureHash,
      provenance: 'hospital_verified',
      verificationBadge: 'Clinically Verified (Hospital Authenticated)',
      soap: soap || {},
      vitals: vitals || patient.vitals || {},
      diagnosis: diagnosis || 'Acute Consultation',
      icd10: icd10 || { code: 'Z00.0', description: 'General Medical Examination' },
      prescriptions: prescriptions || [],
      labOrders: labOrders || [],
      advice: advice || '',
      followUpDate: followUpDate || '',
    };

    // 1. Mark patient as completed in queue
    setOpdQueue(prev => prev.map(p => p.id === patient.id ? { ...p, status: 'Completed' } : p));
    
    // 2. Save in completed consultations
    setCompletedConsultations(prev => [completedRecord, ...prev]);

    // 3. Automatically push verified records to healthRecordService
    try {
      // Add doctor consultation record
      await healthRecordService.addRecord({
        type: 'doctor_visit',
        title: `OPD Consultation — ${doctor.hospitalName}`,
        date: signedAt.split('T')[0],
        time: new Date(signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: `Chief Complaints: ${patient.chiefComplaint}. Assessment: ${diagnosis}. Advice: ${advice}`,
        metadata: {
          doctorName: doctor.name,
          specialization: doctor.specialty,
          hospital: doctor.hospitalName,
          registrationNumber: doctor.mciRegistrationNumber,
          diagnosis: diagnosis,
          provenance: 'hospital_verified',
          verificationBadge: 'Clinically Verified',
          signedAt,
          signatureHash,
          soap: completedRecord.soap,
          vitals: completedRecord.vitals,
          icd10: completedRecord.icd10,
        }
      });

      // Also record verified clinical vitals
      if (vitals?.bpSystolic && vitals?.bpDiastolic) {
        await healthRecordService.addRecord({
          type: 'blood_pressure',
          title: `Triage BP — Measured at ${doctor.hospitalName}`,
          date: signedAt.split('T')[0],
          time: new Date(signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: {
            systolic: Number(vitals.bpSystolic),
            diastolic: Number(vitals.bpDiastolic),
            pulse: Number(vitals.pulse || 80),
            unit: 'mmHg',
            provenance: 'hospital_verified',
            verificationBadge: 'Clinically Verified',
            measuredBy: `Clinical Triage Nurse / ${doctor.name} (${doctor.hospitalName})`,
            category: Number(vitals.bpSystolic) > 140 ? 'Stage 2 Hypertension' : Number(vitals.bpSystolic) > 130 ? 'Stage 1 Hypertension' : 'Normal',
          }
        });
      }

      // Record verified medicines
      if (prescriptions && prescriptions.length > 0) {
        for (const rx of prescriptions) {
          await healthRecordService.addRecord({
            type: 'medicine',
            title: `${rx.name} ${rx.dosage || ''}`,
            date: signedAt.split('T')[0],
            time: new Date(signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            metadata: {
              medicineName: rx.name,
              dosage: rx.dosage,
              frequency: rx.frequency,
              duration: rx.duration,
              instructions: rx.instructions,
              provenance: 'hospital_verified',
              verificationBadge: 'Clinically Verified',
              prescribedBy: `${doctor.name} (Reg: ${doctor.mciRegistrationNumber})`,
              status: 'Active',
            }
          });
        }
      }
    } catch (err) {
      console.warn('[DoctorContext] Could not push to healthRecordService:', err.message);
    }

    return completedRecord;
  }, [doctor]);

  // Quick patient registration / intake
  const registerOpdPatient = useCallback((newPatient) => {
    const nextTokenNum = 100 + opdQueue.length + 1;
    const patientObj = {
      id: `pat-${Date.now()}`,
      token: `OPD-${nextTokenNum}`,
      name: newPatient.name,
      age: Number(newPatient.age) || 30,
      gender: newPatient.gender || 'Other',
      phone: newPatient.phone || '',
      abhaAddress: newPatient.abhaAddress || `${newPatient.name.toLowerCase().replace(/\s+/g, '.') || 'patient'}@abdm`,
      abhaNumber: newPatient.abhaNumber || `91-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`,
      mrn: `MRN-2026-${Math.floor(1000 + Math.random()*9000)}`,
      bloodGroup: newPatient.bloodGroup || 'B+',
      department: 'General Medicine',
      chiefComplaint: newPatient.chiefComplaint || 'Consultation & Health Assessment',
      triagePriority: newPatient.triagePriority || 'Normal',
      waitingTimeMinutes: 5,
      status: 'Waiting',
      vitals: newPatient.vitals || {
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 76,
        spO2: 99,
        temperature: 98.6,
        respRate: 16,
        grbs: 100,
      },
      allergies: newPatient.allergies ? [newPatient.allergies] : ['None reported'],
      pastMedicalHistory: newPatient.pastMedicalHistory ? [newPatient.pastMedicalHistory] : [],
    };

    setOpdQueue(prev => [patientObj, ...prev]);
    return patientObj;
  }, [opdQueue]);

  return (
    <DoctorContext.Provider value={{
      doctor,
      opdQueue,
      activePatient,
      setActivePatient,
      completedConsultations,
      selectPatientForConsultation,
      completeConsultation,
      registerOpdPatient,
    }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error('useDoctor must be used within DoctorProvider');
  return ctx;
};
