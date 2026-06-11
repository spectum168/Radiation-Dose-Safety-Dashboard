/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Clipboard, BadgeCheck } from 'lucide-react';
import { ExamPreset, RadiographerPosition } from '../types';

interface PatientFormProps {
  hn: string;
  setHn: (v: string) => void;
  patientName: string;
  setPatientName: (v: string) => void;
  gender: 'male' | 'female' | 'other';
  setGender: (v: 'male' | 'female' | 'other') => void;
  rtName: string;
  setRtName: (v: string) => void;
  position: RadiographerPosition;
  setPosition: (p: RadiographerPosition) => void;
  notes: string;
  setNotes: (v: string) => void;
  onSaveRecord: () => void;
  isSaving: boolean;
}

// 1. HORIZONTAL CLINICAL REGISTRATION FORM (DEFAULT EXPORT)
export default function PatientForm({
  hn,
  setHn,
  patientName,
  setPatientName,
  gender,
  setGender,
  rtName,
  setRtName,
  position,
  setPosition,
  notes,
  setNotes,
  onSaveRecord,
  isSaving
}: PatientFormProps) {
  return (
    <div className="bg-white border border-stone-200/80 p-5 shadow-sm relative rounded-xl hover:shadow-md transition-shadow duration-300">
      {/* Soft warm corner markings representing clinical precision */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/50" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/50" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/50" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/50" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2 pl-2 border-l-2 border-cyan-600">
          <User className="w-4.5 h-4.5 text-cyan-600" />
          <h3 className="text-xs font-bold text-slate-800 tracking-wide font-sans mb-0">
            Clinical Registration (ลงทะเบียนคนไข้เข้ารับบริการรังสีวินิจฉัย)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-150">
          On-desk Operator Mode
        </span>
      </div>

      {/* 2-row Responsive horizontal input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-4 items-end">
        {/* HN */}
        <div className="xl:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            เลขเวชระเบียน (HN) *
          </label>
          <input
            type="text"
            required
            placeholder="เช่น HN-49219"
            value={hn}
            onChange={(e) => setHn(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2 font-mono focus:bg-white focus:border-cyan-500 focus:outline-none rounded-md transition-all"
          />
        </div>

        {/* Patient Name */}
        <div className="xl:col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            ชื่อ-นามสกุล คนไข้ (Patient Name) *
          </label>
          <input
            type="text"
            required
            placeholder="ชื่อ - นามสกุล ผู้รับแสง"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2 font-sans focus:bg-white focus:border-cyan-500 focus:outline-none rounded-md transition-all"
          />
        </div>

        {/* Biological Sex */}
        <div className="xl:col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            เพศทางสรีรวิทยากำเนิด (Sex)
          </label>
          <div className="flex gap-1 bg-slate-100/80 p-0.5 rounded-md">
            {[
              { key: 'male', label: 'ชาย' },
              { key: 'female', label: 'หญิง' },
              { key: 'other', label: 'อื่นๆ' }
            ].map((g) => {
              const isActive = gender === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGender(g.key as any)}
                  className={`flex-1 py-1.5 px-2 text-center text-xs font-medium cursor-pointer rounded transition-all ${
                    isActive 
                      ? 'bg-cyan-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Radiographer operator name */}
        <div className="xl:col-span-4">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            ชื่อเจ้าหน้าที่รับผิดชอบร่วมประเมิน (Operator) *
          </label>
          <input
            type="text"
            required
            placeholder="ชื่อผู้ปฎิบัติงานรังสีการแพทย์"
            value={rtName}
            onChange={(e) => setRtName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2 font-sans focus:bg-white focus:border-cyan-500 focus:outline-none rounded-md transition-all"
          />
        </div>

        {/* Operator Position title selection */}
        <div className="xl:col-span-4 text-left">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            ตำแหน่งผู้รับผิดชอบเครื่องฉาย
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPosition('RT')}
              className={`flex-1 py-1.5 px-3 border text-xs font-semibold rounded-md flex flex-col items-center justify-center cursor-pointer transition-all ${
                position === 'RT' 
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm' 
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">นักรังสีเทคนิค</span>
              <span className="text-[8px] opacity-70">RT License</span>
            </button>
            <button
              type="button"
              onClick={() => setPosition('R_ASSISTANT')}
              className={`flex-1 py-1.5 px-3 border text-xs font-semibold rounded-md flex flex-col items-center justify-center cursor-pointer transition-all ${
                position === 'R_ASSISTANT' 
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm' 
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">เจ้าพนักงานรังสีฯ</span>
              <span className="text-[8px] opacity-70">Radiologist Assistant</span>
            </button>
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="xl:col-span-5">
          <label className="block text-[10px] font-bold text-slate-500 font-sans mb-1 uppercase tracking-wider">
            ข้อมูลอาการทางคลินิกเพิ่มเติม (Clinical Comments / ประวัติสแกน)
          </label>
          <input
            type="text"
            placeholder="ระบุข้อควรระวังพิเศษ หรืองานซ่อมภาพเพิ่มเติม..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2 font-sans focus:bg-white focus:border-cyan-500 focus:outline-none rounded-md transition-all"
          />
        </div>

        {/* Trigger saving & generating the clinical record */}
        <div className="xl:col-span-3">
          <button
            type="button"
            onClick={onSaveRecord}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 font-bold py-2.5 px-4 rounded-md shadow-sm text-white cursor-pointer active:scale-[0.98] transition-all text-xs font-sans tracking-wide border border-cyan-700/30"
          >
            <BadgeCheck className="w-4 h-4" />
            <span>{isSaving ? 'กำลังประมวล...' : 'บันทึกโดส & ออกรายงาน'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. MODULAR RADIOLOGICAL PARAMETERS ADJUSTER (NAMED EXPORT)
interface RadiologicalParametersProps {
  presets: ExamPreset[];
  selectedPreset: ExamPreset;
  setSelectedPreset: (p: ExamPreset) => void;
  kv: number;
  setKv: (v: number) => void;
  mas: number;
  setMas: (v: number) => void;
  ssd: number;
  setSsd: (v: number) => void;
  thickness: number;
  setThickness: (v: number) => void;
}

export function RadiologicalParameters({
  presets,
  selectedPreset,
  setSelectedPreset,
  kv,
  setKv,
  mas,
  setMas,
  ssd,
  setSsd,
  thickness,
  setThickness
}: RadiologicalParametersProps) {
  const ssdPresets = [50, 100, 120, 170, 180];

  return (
    <div className="border border-stone-200 bg-white p-5 shadow-sm relative rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      {/* Delicate details representing physical machinery dials */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/50" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/50" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/50" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/50" />

      <div>
        {/* Title display */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-left">
          <div className="flex items-center gap-2 pl-2 border-l-2 border-cyan-600">
            <Clipboard className="w-4.5 h-4.5 text-cyan-600" />
            <h4 className="text-xs font-bold text-slate-800 tracking-wide font-sans mb-0">
              Radiological Parameters (ค่าสรีรวิทยาหลอดรังสีเอ็กซ์เรย์)
            </h4>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
            Parameters Live
          </span>
        </div>

        {/* Exam preset selects */}
        <div className="mb-5 text-left">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
            Examination Preset / รูปแบบจุดสแกนคนไข้
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isActive = preset.id === selectedPreset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setKv(preset.defaultKv);
                    setMas(preset.defaultMAs);
                    setSsd(preset.defaultSsd);
                  }}
                  className={`text-left p-2.5 border transition-all duration-200 cursor-pointer rounded-lg ${
                    isActive 
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-sm' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{preset.nameTh}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">{preset.nameEn}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live sliders dials */}
        <div className="space-y-4">
          {/* kV Slider */}
          <div className="text-left">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-slate-600 font-sans flex items-center gap-1 uppercase tracking-wider">
                <span>Tube Voltage (แรงดันไฟฟ้าหลอดฉาย)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={kv}
                  onChange={(e) => setKv(Math.max(40, Math.min(150, parseFloat(e.target.value) || 40)))}
                  className="w-14 bg-slate-50 border border-slate-200 text-cyan-800 text-xs text-center font-bold font-mono py-0.5 rounded-md focus:bg-white focus:border-cyan-550 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">kVp</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-400 w-5">40</span>
              <input
                type="range"
                min="40"
                max="150"
                step="1"
                value={kv}
                onChange={(e) => setKv(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">150</span>
            </div>
          </div>

          {/* mAs Slider */}
          <div className="text-left">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-slate-600 font-sans flex items-center gap-1 uppercase tracking-wider">
                <span>Tube Charge (อัตรากระแสไฟรวมเวลา)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0.1"
                  max="200"
                  step="0.1"
                  value={mas}
                  onChange={(e) => setMas(Math.max(0.1, Math.min(200, parseFloat(e.target.value) || 0.1)))}
                  className="w-14 bg-slate-50 border border-slate-200 text-cyan-800 text-xs text-center font-bold font-mono py-0.5 rounded-md focus:bg-white focus:border-cyan-550 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">mAs</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-400 w-5">0.1</span>
              <input
                type="range"
                min="0.1"
                max="120"
                step="0.1"
                value={mas}
                onChange={(e) => setMas(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">120</span>
            </div>
          </div>

          {/* Source-to-Skin Distance (SSD) Slider */}
          <div className="text-left">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-slate-600 font-sans flex items-center gap-1 uppercase tracking-wider">
                <span>Source-to-Skin Distance (ระยะหลอดถึงผิวหนัง)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={ssd}
                  onChange={(e) => setSsd(Math.max(10, Math.min(300, parseInt(e.target.value) || 100)))}
                  className="w-14 bg-slate-50 border border-slate-200 text-cyan-800 text-xs text-center font-bold font-mono py-0.5 rounded-md focus:bg-white focus:border-cyan-550 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">cm</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-400 w-5">30</span>
              <input
                type="range"
                min="30"
                max="250"
                value={ssd}
                onChange={(e) => setSsd(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">250</span>
            </div>

            {/* Quick SSD selects */}
            <div className="flex items-center gap-1.5 mt-2 pt-0.5 flex-wrap">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">SSD Presets:</span>
              <div className="flex gap-1">
                {ssdPresets.map((presetVal) => {
                  const isSelected = ssd === presetVal;
                  return (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => setSsd(presetVal)}
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 border cursor-pointer rounded transition-all ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {presetVal}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Patient Thickness Slider */}
          <div className="text-left">
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-bold text-slate-600 font-sans flex items-center gap-1 uppercase tracking-wider">
                <span>Patient Thickness (ระดับความหนาสรีระ)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={thickness}
                  onChange={(e) => setThickness(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
                  className="w-14 bg-slate-50 border border-slate-200 text-cyan-800 text-xs text-center font-bold font-mono py-0.5 rounded-md focus:bg-white focus:border-cyan-550 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">cm</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-slate-400 w-5">5</span>
              <input
                type="range"
                min="5"
                max="45"
                step="0.5"
                value={thickness}
                onChange={(e) => setThickness(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">45</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 mt-5 pt-3 text-left text-[9px] text-slate-400 font-mono uppercase flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        <span>PACS Spectra: Computed and updated live using run-time equations</span>
      </div>
    </div>
  );
}
