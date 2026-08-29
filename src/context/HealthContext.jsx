import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { healthRecordService } from '../services/healthRecordService';
import { documentService } from '../services/documentService';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { reminderService } from '../services/reminderService';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    doctorVisitsCount: 0,
    documentsCount: 0,
    latestBP: '128/82 mmHg',
    latestWeight: '72.0 kg',
    latestSugar: '94 mg/dL',
    activeMedicinesCount: 3
  });
  const [loading, setLoading] = useState(true);

  // Global Add Record Modal state
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [initialRecordType, setInitialRecordType] = useState('blood_pressure');
  const [selectedDateForNewRecord, setSelectedDateForNewRecord] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    // Clear any pending timer so a new toast cancels the old one
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = setTimeout(() => {
      toastTimerRef.current = null;
      setToast(null);
    }, 4000);
  };

  const closeToast = () => setToast(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, docs, docsList, apts, rems] = await Promise.all([
        healthRecordService.getAllRecords(),
        documentService.getAllDocuments(),
        doctorService.getAllDoctors(),
        appointmentService.getAllAppointments(),
        reminderService.getAllReminders(),
      ]);
      // Compute stats from the records we just fetched — avoids a second getAllRecords() call
      const newStats = healthRecordService.getStats(recs);
      setRecords(recs);
      setDocuments(docs);
      setDoctors(docsList);
      setAppointments(apts);
      setReminders(rems);
      setStats(newStats);
    } catch (err) {
      console.error("Failed to load health data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Clear any pending toast timer on unmount to prevent state leak
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Record Actions
  const addRecord = async (recordData) => {
    const created = await healthRecordService.addRecord(recordData);
    await refreshAll();
    showToast(`Health record saved: ${created.title}`);
    return created;
  };

  const updateRecord = async (id, updates) => {
    const updated = await healthRecordService.updateRecord(id, updates);
    await refreshAll();
    showToast('Record updated successfully');
    return updated;
  };

  const deleteRecord = async (id) => {
    await healthRecordService.deleteRecord(id);
    await refreshAll();
    showToast('Record removed from health memory', 'info');
  };

  // Document Actions
  const addDocument = async (docData) => {
    const created = await documentService.addDocument(docData);
    // Also create a linked health timeline event
    await healthRecordService.addRecord({
      type: 'document',
      title: docData.title,
      description: docData.summary || `Uploaded document: ${docData.type}`,
      date: docData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        documentId: created.id,
        documentType: docData.type,
        doctorName: docData.doctor,
        facility: docData.hospital,
        fileUrl: created.fileUrl,
        extractedSummary: docData.summary
      }
    });
    await refreshAll();
    showToast(`Document uploaded & indexed: ${created.title}`);
    return created;
  };

  const deleteDocument = async (id) => {
    await documentService.deleteDocument(id);
    await refreshAll();
    showToast('Document deleted', 'info');
  };

  // Reminder Actions
  const addReminder = async (remData) => {
    const created = await reminderService.addReminder(remData);
    await refreshAll();
    showToast(`Reminder created: ${created.title}`);
    return created;
  };

  const toggleReminder = async (id) => {
    await reminderService.toggleComplete(id);
    await refreshAll();
  };

  const deleteReminder = async (id) => {
    await reminderService.deleteReminder(id);
    await refreshAll();
    showToast('Reminder deleted', 'info');
  };

  // Appointment Actions
  const addAppointment = async (aptData) => {
    const created = await appointmentService.addAppointment(aptData);
    // Add corresponding reminder automatically
    await reminderService.addReminder({
      title: `Doctor Appointment with ${aptData.doctorName}`,
      category: 'Doctor Visit',
      date: aptData.date,
      time: aptData.time,
      notes: aptData.purpose
    });
    await refreshAll();
    showToast(`Appointment booked with ${created.doctorName}`);
    return created;
  };

  const cancelAppointment = async (id) => {
    await appointmentService.cancelAppointment(id);
    await refreshAll();
    showToast('Appointment cancelled', 'info');
  };

  // Doctor Actions
  const addDoctor = async (docData) => {
    const created = await doctorService.addDoctor(docData);
    await refreshAll();
    showToast(`Doctor ${created.name} added to your care team`);
    return created;
  };

  // Modal open helpers
  const openAddRecord = (type = 'blood_pressure', date = null) => {
    setInitialRecordType(type);
    setSelectedDateForNewRecord(date);
    setIsAddRecordOpen(true);
  };

  const closeAddRecord = () => {
    setIsAddRecordOpen(false);
    setSelectedDateForNewRecord(null);
  };

  return (
    <HealthContext.Provider value={{
      records,
      documents,
      doctors,
      appointments,
      reminders,
      stats,
      loading,
      refreshAll,
      // Record methods
      addRecord,
      updateRecord,
      deleteRecord,
      // Doc methods
      addDocument,
      deleteDocument,
      // Reminder methods
      addReminder,
      toggleReminder,
      deleteReminder,
      // Appointment methods
      addAppointment,
      cancelAppointment,
      // Doctor methods
      addDoctor,
      // Global Modal
      isAddRecordOpen,
      initialRecordType,
      selectedDateForNewRecord,
      openAddRecord,
      closeAddRecord,
      // Toast
      toast,
      showToast,
      closeToast
    }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
