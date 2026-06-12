/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Database, 
  Sparkles, 
  Lock, 
  HeartHandshake,
  FileText
} from 'lucide-react';

import { DoseRecord, RadiographerPosition } from './types';
import { 
  EXAM_PRESETS, 
  calculateEsd, 
  calculateEffectiveDose, 
  calculateOrganDoses, 
  evaluateSafetyStatus, 
  optimizeAlara 
} from './utils/doseCalculator';

import Gauge from './components/Gauge';
import AlaraOptimizer from './components/AlaraOptimizer';
import PatientForm, { RadiologicalParameters } from './components/PatientForm';
import DoseHistory from './components/DoseHistory';
import AdminAudit from './components/AdminAudit';
import ReportModal from './components/ReportModal';
import DrlReportModal from './components/DrlReportModal';

// Dummy initial clinical records for realistic dashboard loading
const DUMMY_RECORDS: DoseRecord[] = [
  {
    id: 'rec_1',
    hn: 'HN-49219',
    patientName: 'นาย สมเกียรติ ยิ่งดี',
    gender: 'male',
    thickness: 21,
    examType: 'Chest PA',
    kv: 110,
    mAs: 3.2,
    ssd: 180,
    esd: 0.158,
    effectiveDose: 0.024,
    organDoses: {
      lung: 0.055,
      thyroid: 0.011,
      brain: 0.0001,
      gonads: 0.0001,
      boneMarrow: 0.035
    },
    rtName: 'กวินธิดา มงคลรักษ์',
    position: 'RT',
    isAlaraApplied: false,
    timestamp: '2026-05-31T02:40:00.000Z',
    notes: 'ไม่มีการระบายฝุ่นแป้งบริเวณปอด ตรวจสอบภาพฟิล์มแรกสมบูรณ์ดี',
    safetyStatus: 'safe'
  },
  {
    id: 'rec_2',
    hn: 'HN-83921',
    patientName: 'นาง พรทิพย์ สุขสง่า',
    gender: 'female',
    thickness: 23,
    examType: 'Abdomen AP',
    kv: 75,
    mAs: 20.0,
    ssd: 100,
    esd: 4.885,
    effectiveDose: 0.635,
    organDoses: {
      lung: 0.488,
      thyroid: 0.049,
      brain: 0.0001,
      gonads: 1.954,
      boneMarrow: 1.074
    },
    rtName: 'พงศกร เลิศเกียรติวงศ์',
    position: 'RT',
    isAlaraApplied: false,
    timestamp: '2026-05-31T03:15:00.000Z',
    notes: 'สตรีสรีระทับซ้อน การตอบสนองของความสว่างภาพเหมาะสม',
    safetyStatus: 'safe'
  },
  {
    id: 'rec_3',
    hn: 'HN-23910',
    patientName: 'เด็กชาย อนุชา ศิริเจริญ',
    gender: 'male',
    thickness: 15,
    examType: 'Skull AP',
    kv: 75,
    mAs: 16.0,
    ssd: 100,
    esd: 2.378,
    effectiveDose: 0.068,
    organDoses: {
      lung: 0.002,
      thyroid: 0.285,
      brain: 1.307,
      gonads: 0.0001,
      boneMarrow: 0.078
    },
    rtName: 'ศิริชัย แสงนุ่ม',
    position: 'R_ASSISTANT',
    isAlaraApplied: false,
    timestamp: '2026-05-30T04:20:00.000Z',
    notes: 'มีความร่วมมือดี มีการใช้อุปกรณ์บีบลำรังสี (Collimator) คลุมบริเวณดวงตา',
    safetyStatus: 'safe'
  },
  {
    id: 'rec_4',
    hn: 'HN-91283',
    patientName: 'นาย กิตติพงษ์ ใจเย็น',
    gender: 'male',
    thickness: 24,
    examType: 'Lumbar Spine AP',
    kv: 80,
    mAs: 45.0, // High mAs
    ssd: 100,
    esd: 11.455, // Critical ESD (DRL is 6.0)
    effectiveDose: 2.291,
    organDoses: {
      lung: 1.375,
      thyroid: 0.229,
      brain: 0.0001,
      gonads: 4.009,
      boneMarrow: 1.134
    },
    rtName: 'กวินธิดา มงคลรักษ์',
    position: 'RT',
    isAlaraApplied: false,
    timestamp: '2026-05-30T06:45:00.000Z',
    notes: 'น้ำหนักตัวคนไข้หนาพิเศษ (Obese Patient Over 100kg) ต้องเบิ้ลประจุไฟฟ้าเพื่อรักษาระดับการทะลุผ่านของลำรังสี',
    safetyStatus: 'critical'
  }
];

export default function App() {
  // Tabs: 'calculator' | 'history' | 'admin'
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'admin'>('calculator');

  // Load Initial Records
  const [records, setRecords] = useState<DoseRecord[]>(() => {
    const local = localStorage.getItem('radiation_dose_records');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parsing local records, fallback to dummy dataset', e);
      }
    }
    // Set default dummy registers if empty
    localStorage.setItem('radiation_dose_records', JSON.stringify(DUMMY_RECORDS));
    return DUMMY_RECORDS;
  });

  // active exam preset selector
  const [selectedPreset, setSelectedPreset] = useState(EXAM_PRESETS[0]);

  // Technique Parameter Values State
  const [kv, setKv] = useState<number>(selectedPreset.defaultKv);
  const [mas, setMas] = useState<number>(selectedPreset.defaultMAs);
  const [ssd, setSsd] = useState<number>(selectedPreset.defaultSsd);
  const [thickness, setThickness] = useState<number>(22); // baseline patient thickness in cm

  // Clerk / Patient Registration Information
  const [hn, setHn] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [rtName, setRtName] = useState<string>('');
  const [position, setPosition] = useState<RadiographerPosition>('RT');
  const [notes, setNotes] = useState<string>('');
  const [isAlaraApplied, setIsAlaraApplied] = useState<boolean>(false);

  // Computed Realtime Dosimetry Variables
  const [esd, setEsd] = useState<number>(0);
  const [effectiveDose, setEffectiveDose] = useState<number>(0);
  const [organDoses, setOrganDoses] = useState({ lung: 0, thyroid: 0, brain: 0, gonads: 0, boneMarrow: 0 });
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'critical'>('safe');
  
  // ALARA Optimized Techniques Projection
  const [alaraKv, setAlaraKv] = useState<number>(0);
  const [alaraMas, setAlaraMas] = useState<number>(0);
  const [alaraEsd, setAlaraEsd] = useState<number>(0);

  // States for previewing/downloading specific records
  const [selectedReportRecord, setSelectedReportRecord] = useState<DoseRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrlReportOpen, setIsDrlReportOpen] = useState<boolean>(false);

  // Track Real-time changes and run medical formulas live (No infinite loops)
  useEffect(() => {
    const computedEsd = calculateEsd(kv, mas, ssd, thickness, selectedPreset.id);
    const computedEffective = calculateEffectiveDose(computedEsd, selectedPreset.id, thickness);
    const computedOrgans = calculateOrganDoses(computedEsd, selectedPreset, thickness);
    const computedStatus = evaluateSafetyStatus(computedEsd, selectedPreset.drlEsd);

    setEsd(computedEsd);
    setEffectiveDose(computedEffective);
    setOrganDoses(computedOrgans);
    setSafetyStatus(computedStatus);

    // Compute potential ALARA optimization results
    const optObj = optimizeAlara(kv, mas);
    const computedAlaraEsd = calculateEsd(optObj.kv, optObj.mas, ssd, thickness, selectedPreset.id);

    setAlaraKv(optObj.kv);
    setAlaraMas(optObj.mas);
    setAlaraEsd(computedAlaraEsd);
  }, [kv, mas, ssd, thickness, selectedPreset.id]);

  // Apply the optimized ALARA values to the active sliders automatically
  const handleApplyAlara = () => {
    setKv(alaraKv);
    setMas(alaraMas);
    setIsAlaraApplied(true);
    
    // Quick user alert notifier element (replaces ugly browser popups)
    const notifier = document.getElementById('alara-applied-notification');
    if (notifier) {
      notifier.classList.remove('opacity-0');
      notifier.classList.add('opacity-100');
      setTimeout(() => {
        notifier.classList.remove('opacity-100');
        notifier.classList.add('opacity-0');
      }, 3500);
    }
  };

  // Reset fields on successful record log
  const handleSaveRecord = () => {
    if (!hn.trim() || !patientName.trim() || !rtName.trim()) {
      alert('กรุณากรอกข้อมูลเวชระเบียน HN, ชื่อผู้ป่วย และชื่อนักรังสีแพทย์ให้ครบถ้วนก่อนบันทึก');
      return;
    }

    setIsSaving(true);
    
    setTimeout(() => {
      const newRecord: DoseRecord = {
        id: `rec_${Date.now()}`,
        hn: hn.trim(),
        patientName: patientName.trim(),
        gender,
        thickness,
        examType: selectedPreset.nameTh,
        kv,
        mAs: mas,
        ssd,
        esd,
        effectiveDose,
        organDoses,
        rtName: rtName.trim(),
        position,
        isAlaraApplied,
        timestamp: new Date().toISOString(),
        notes: notes.trim(),
        safetyStatus
      };

      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      localStorage.setItem('radiation_dose_records', JSON.stringify(updatedRecords));

      // Reset patient registration inputs while keeping operator details for workflow speed
      setHn('');
      setPatientName('');
      setNotes('');
      setIsAlaraApplied(false);
      setIsSaving(false);

      // Open the report viewer directly
      setSelectedReportRecord(newRecord);
    }, 400); // realistic UI latency
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('radiation_dose_records', JSON.stringify(updated));
  };

  const handleUpdateRecord = (updatedRecord: DoseRecord) => {
    const updatedList = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedList);
    localStorage.setItem('radiation_dose_records', JSON.stringify(updatedList));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* 1. PACS CONSOLE HEADING HEADER */}
      <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm text-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-center shadow-inner">
                <Activity className="w-5.5 h-5.5 text-cyan-600 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            </div>

            <div className="text-left">
              <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-sans leading-none">
                DoseGuard Pro
              </h1>
              <p className="text-[9px] text-cyan-700 font-mono font-bold mt-1 tracking-widest uppercase">
                MEDICAL GENERAL DOSIMETRY & RADIATION SAFETY DESK
              </p>
            </div>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60 shadow-inner">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-white text-cyan-800 shadow-sm border border-stone-200/55'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เครื่องคำนวณและลดรังสี (Dosimeters)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-cyan-800 shadow-sm border border-stone-200/55'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>เวชระเบียนรายงานรายวัน</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-cyan-800 shadow-sm border border-stone-200/55'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Lock className="w-3 h-3.5" />
              <span>แผงควบคุมตรวจสอบ (Auditor)</span>
            </button>

            <button
              onClick={() => setIsDrlReportOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-300 flex items-center gap-1.5 text-cyan-750 bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200/50 shadow-sm hover:text-cyan-800"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              <span>ตารางประเมินรังสี (ESAK vs DRLs)</span>
            </button>
          </nav>

          {/* Environmental Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[9px] text-slate-400 border-l border-stone-200 pl-4 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PACS MAIN-STATION ONLINE</span>
          </div>
        </div>
      </header>

      {/* 2. ALARA NOTIFIER TOAST */}
      <div 
        id="alara-applied-notification" 
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-teal-650 to-cyan-600 text-white font-bold px-4 py-2.5 text-xs rounded-full shadow-xl border border-teal-500/20 opacity-0 pointer-events-none transition-all duration-500 ease-out flex items-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>ปรับปรุงพารามิเตอร์รังสี (Apply ALARA Technique 15%) เรียบร้อยแล้ว! ปริมาณรังสีผิวสัมผัสลดลง ~37%</span>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: RAD-CALCULATOR WORKSPACE */}
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              
              {/* Box 1. Clinical Registration (ลงทะเบียนคนไข้) - Horizontal Layout Spanning Full Width at Very Top */}
              <PatientForm
                hn={hn}
                setHn={setHn}
                patientName={patientName}
                setPatientName={setPatientName}
                gender={gender}
                setGender={setGender}
                rtName={rtName}
                setRtName={setRtName}
                position={position}
                setPosition={setPosition}
                notes={notes}
                setNotes={setNotes}
                onSaveRecord={handleSaveRecord}
                isSaving={isSaving}
              />

              {/* Box 2. Side-by-Side: Symmetrical Parameters Panel vs. Combined Dose Assessment (reduced area by half) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Left Column: radiological parameters sliders */}
                <RadiologicalParameters
                  presets={EXAM_PRESETS}
                  selectedPreset={selectedPreset}
                  setSelectedPreset={setSelectedPreset}
                  kv={kv}
                  setKv={setKv}
                  mas={mas}
                  setMas={setMas}
                  ssd={ssd}
                  setSsd={setSsd}
                  thickness={thickness}
                  setThickness={setThickness}
                />

                {/* Right Column: combined dose assessment score (Entrance Skin Dose + Effective Dose) */}
                <Gauge
                  esdValue={esd}
                  esdThreshold={selectedPreset.drlEsd}
                  effectiveValue={effectiveDose}
                  effectiveThreshold={selectedPreset.drlEffective}
                  safetyStatus={safetyStatus}
                />
              </div>

              {/* Box 3. ALARA 15% OPTIMIZER BOARD */}
              <AlaraOptimizer
                currentKv={kv}
                currentMAs={mas}
                optimizedKv={alaraKv}
                optimizedMAs={alaraMas}
                currentEsd={esd}
                optimizedEsd={alaraEsd}
                drlThreshold={selectedPreset.drlEsd}
                onApply={handleApplyAlara}
              />

            </motion.div>
          )}

          {/* TAB 2: DOSIMETRY HISTORY RECORDS DB */}
          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <DoseHistory
                records={records}
                onDeleteRecord={handleDeleteRecord}
                onViewReport={(rec) => setSelectedReportRecord(rec)}
              />
            </motion.div>
          )}

          {/* TAB 3: ADMIN INSTRUMENT AUDIT WORKSTATION */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminAudit
                records={records}
                onUpdateRecord={handleUpdateRecord}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 4. CLINICAL DOSE ASSESSMENT PDF/PRINT PREVIEW MODAL */}
      {selectedReportRecord && (
        <ReportModal
          record={selectedReportRecord}
          onClose={() => setSelectedReportRecord(null)}
        />
      )}

      {/* DRL COMPARISON EVALUATION REPORT MODAL */}
      <DrlReportModal
        isOpen={isDrlReportOpen}
        onClose={() => setIsDrlReportOpen(false)}
      />

      {/* 5. GENTLE HUMAN FOOTER INFORMATION */}
      <footer className="border-t border-stone-200 mt-16 bg-white px-4 py-8 text-center text-[10px] text-slate-400 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans font-semibold">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-cyan-600" />
            <span>คำนวณสอดคล้องตามมาตรฐานทบวงพลังงานปรมาณูระหว่างประเทศ (IAEA) และข้อกำหนดควบคุมรังสีความปลอดภัยแห่งประเทศไทย</span>
          </div>
          <p className="font-mono">
            DoseGuard AI • Local PACS Deployment Version 2.4.1 (Stable LTS)
          </p>
        </div>
      </footer>
    </div>
  );
}
