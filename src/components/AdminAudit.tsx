/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, TrendingDown, Users, AlertTriangle, CheckSquare, ClipboardPlus } from 'lucide-react';
import { DoseRecord } from '../types';

interface AdminAuditProps {
  records: DoseRecord[];
  onUpdateRecord: (updated: DoseRecord) => void;
}

export default function AdminAudit({ records, onUpdateRecord }: AdminAuditProps) {
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Compute Core Stats
  const totalExams = records.length;
  
  const avgEsd = totalExams > 0 
    ? parseFloat((records.reduce((acc, rec) => acc + rec.esd, 0) / totalExams).toFixed(3))
    : 0;
    
  const avgEffective = totalExams > 0
    ? parseFloat((records.reduce((acc, rec) => acc + rec.effectiveDose, 0) / totalExams).toFixed(3))
    : 0;

  // Collective cumulative dose (sum in person-mSv)
  const cumulativeCollective = totalExams > 0
    ? parseFloat(records.reduce((acc, rec) => acc + rec.effectiveDose, 0).toFixed(2))
    : 0;

  // Compliance (records that are NOT 'critical')
  const compliantCount = records.filter(rec => rec.safetyStatus !== 'critical').length;
  const complianceRate = totalExams > 0
    ? Math.round((compliantCount / totalExams) * 100)
    : 100; // default 100% if empty

  // Count by status
  const safeCount = records.filter(rec => rec.safetyStatus === 'safe').length;
  const warningCount = records.filter(rec => rec.safetyStatus === 'warning').length;
  const criticalCount = records.filter(rec => rec.safetyStatus === 'critical').length;

  // Critical Alerts list for safety panel
  const alertsList = records.filter(rec => rec.safetyStatus === 'critical');

  // Compute DRL vs Actual averages for the custom bar chart
  // Group averages by preset exam type (Chest PA, Abdomen, Lumbar, Skull, Pelvis, Extremity)
  const examIds = ['chest_pa', 'abdomen_ap', 'lumbar_ap', 'skull_ap', 'pelvis_ap', 'extremity'];
  const examLabels: Record<string, string> = {
    chest_pa: 'Chest PA',
    abdomen_ap: 'Abdomen',
    lumbar_ap: 'L-Spine',
    skull_ap: 'Skull AP',
    pelvis_ap: 'Pelvis AP',
    extremity: 'Extremity'
  };
  const examDrls: Record<string, number> = {
    chest_pa: 0.35,
    abdomen_ap: 5.0,
    lumbar_ap: 6.0,
    skull_ap: 3.0,
    pelvis_ap: 4.5,
    extremity: 0.5
  };

  const organAverages = examIds.map(id => {
    // Find matching records
    const matching = records.filter(rec => {
      const typeLower = rec.examType.toLowerCase();
      if (id === 'chest_pa' && typeLower.includes('chest')) return true;
      if (id === 'abdomen_ap' && typeLower.includes('abdomen')) return true;
      if (id === 'lumbar_ap' && typeLower.includes('lumbar')) return true;
      if (id === 'skull_ap' && typeLower.includes('skull')) return true;
      if (id === 'pelvis_ap' && typeLower.includes('pelvis')) return true;
      if (id === 'extremity' && typeLower.includes('extremity')) return true;
      return false;
    });

    const average = matching.length > 0
      ? matching.reduce((acc, rec) => acc + rec.esd, 0) / matching.length
      : 0;

    return {
      id,
      label: examLabels[id],
      drl: examDrls[id],
      actual: parseFloat(average.toFixed(3)),
    };
  });

  // Calculate maximum value for chart scaling
  const maxChartVal = Math.max(...organAverages.map(item => Math.max(item.drl, item.actual)), 1);

  // Handle saving audit comments
  const handleSaveAuditComment = (id: string) => {
    const orig = records.find(r => r.id === id);
    if (orig) {
      const comment = reviewNotes[id] || '';
      const updated: DoseRecord = {
        ...orig,
        notes: orig.notes 
          ? `${orig.notes}\n[AUDITED NOTE: ${comment}]` 
          : `[AUDITED NOTE: ${comment}]`
      };
      onUpdateRecord(updated);
      setActiveReviewId(null);
      alert('บันทึกเอกสารทบทวนความปลอดภัยเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
        {/* Total exams card */}
        <div className="p-5 border border-stone-200 bg-white relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/45" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/45" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">หัตถการสะสม</span>
              <span className="text-3xl font-bold text-cyan-600 font-mono mt-1 w-full block">{totalExams}</span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">DAILY SYSTEM CHECKS</span>
            </div>
            <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-center rotate-45 shrink-0">
              <Users className="w-5 h-5 text-cyan-600 -rotate-45" />
            </div>
          </div>
        </div>

        {/* Average skin dose */}
        <div className="p-5 border border-stone-200 bg-white relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/45" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/45" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">ค่าเฉลี่ยโดสที่ผิว (ESD)</span>
              <span className="text-3xl font-bold text-amber-600 font-mono mt-1 w-full block">
                {avgEsd} <span className="text-xs font-normal text-slate-400">mGy</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">DIRECT SKIN EXPOSURE</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center rotate-45 shrink-0">
              <TrendingDown className="w-5 h-5 text-amber-655 -rotate-45" />
            </div>
          </div>
        </div>

        {/* Collective effective dose */}
        <div className="p-5 border border-stone-200 bg-white relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/45" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/45" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">ผลรังสีประสิทธิผลรวม</span>
              <span className="text-3xl font-bold text-indigo-600 font-mono mt-1 w-full block">
                {cumulativeCollective} <span className="text-xs font-normal text-slate-400">mSv</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">COLLECTIVE DOSE</span>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center rotate-45 shrink-0">
              <ClipboardPlus className="w-5 h-5 text-indigo-600 -rotate-45" />
            </div>
          </div>
        </div>

        {/* Compliance index */}
        <div className="p-5 border border-stone-200 bg-white relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/45" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/45" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">อัตราผ่านการตรวจสอบ</span>
              <span className="text-3xl font-bold text-emerald-600 font-mono mt-1 w-full block">{complianceRate}%</span>
              <span className="text-[9px] font-mono text-emerald-600 mt-1 block flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 inline-block animate-pulse rounded-full" />
                <span>ALARA COMPLIANT</span>
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center rotate-45 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600 -rotate-45" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* A: Compliance Rate SVG-Pie (4 cols) */}
        <div className="lg:col-span-4 border border-stone-200 bg-white p-6 flex flex-col justify-between relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/40" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/40" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-wide font-mono uppercase mb-1">
              Compliance Ratio (เกณฑ์ความปลอดภัยรังสี)
            </h3>
            <p className="text-[9px] text-slate-500 font-mono mb-4">
              ตามสัดส่วนเนื้อเยื่อเทียบระเบียนรายงาน DRL
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            {totalExams === 0 ? (
              <div className="w-32 h-32 border border-stone-100 flex items-center justify-center text-slate-400 font-mono text-xs text-center p-3 rounded-xl bg-stone-50">
                ยังไม่มีข้อมูลคนไข้ในระบบขณะนี้
              </div>
            ) : (
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Custom SVG Pie/Donut Chart */}
                <svg className="w-full h-full transform -rotate-90 animate-fadeIn" viewBox="0 0 100 100">
                  {/* Safe Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-cyan-500"
                    strokeWidth="10"
                    strokeDasharray={`${Math.round((safeCount / totalExams) * 238.7)} 238.7`}
                    strokeDashoffset="0"
                    fill="transparent"
                  />
                  {/* Warning Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-amber-400"
                    strokeWidth="10"
                    strokeDasharray={`${Math.round((warningCount / totalExams) * 238.7)} 238.7`}
                    strokeDashoffset={`-${Math.round((safeCount / totalExams) * 238.7)}`}
                    fill="transparent"
                  />
                  {/* Critical Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-rose-500"
                    strokeWidth="10"
                    strokeDasharray={`${Math.round((criticalCount / totalExams) * 238.7)} 238.7`}
                    strokeDashoffset={`-${Math.round(((safeCount + warningCount) / totalExams) * 238.7)}`}
                    fill="transparent"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute text-center">
                  <p className="text-2xl font-bold text-slate-800 font-mono tracking-tighter">
                    {complianceRate}%
                  </p>
                  <p className="text-[9px] font-mono text-cyan-600 font-bold uppercase tracking-widest mt-0.5">
                    EST. RATE
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Indicator Info */}
          <div className="space-y-2 border-t border-stone-100 pt-3 text-[10px] font-mono mt-4">
            <div className="flex justify-between items-center text-cyan-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>ปลอดภัยทั่วไป (Safe):</span>
              </span>
              <span className="font-bold">{safeCount} เคส ({totalExams > 0 ? Math.round((safeCount/totalExams)*100) : 0}%)</span>
            </div>
            
            <div className="flex justify-between items-center text-amber-650">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>เตือนสอดส่อง (Warning):</span>
              </span>
              <span className="font-bold">{warningCount} เคส ({totalExams > 0 ? Math.round((warningCount/totalExams)*100) : 0}%)</span>
            </div>

            <div className="flex justify-between items-center text-rose-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>อันตรายเร่งทบทวน (Critical):</span>
              </span>
              <span className="font-bold">{criticalCount} เคส ({totalExams > 0 ? Math.round((criticalCount/totalExams)*100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* B: Organ-Specific Bar Chart actual vs DRL (8 cols) */}
        <div className="lg:col-span-8 border border-stone-200 bg-white p-6 flex flex-col justify-between relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/40" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/40" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-wide font-mono uppercase mb-1">
              DRL vs. Clinical Exposure Averages (เปรียบเทียบค่ารังสีจริงกับเกณฑ์อ้างอิง)
            </h3>
            <p className="text-[9px] text-slate-500 font-mono mb-4">
              อ้างอิงสถาบันรังสีวินิจฉัยและมาตรฐานขีดจำกัดอ้างอิงรังสีแห่งชาติ (National Diagnostic Reference Levels - DRL)
            </p>
          </div>

          {/* Graphical Bars */}
          <div className="space-y-4 my-2">
            {organAverages.map((item) => {
              // Convert actual and drl to percentage width
              const actualWidth = (item.actual / maxChartVal) * 100;
              const drlWidth = (item.drl / maxChartVal) * 100;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                  {/* Label */}
                  <div className="col-span-3 text-left">
                    <span className="text-xs font-bold text-slate-700 font-sans">{item.label}</span>
                  </div>

                  {/* Progressive visual bar representation */}
                  <div className="col-span-7 space-y-1">
                    {/* DRL baseline reference indicator */}
                    <div className="relative">
                      {/* DRL grey scale line */}
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-400 h-full transition-all duration-300"
                          style={{ width: `${drlWidth}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono font-semibold tracking-tighter absolute right-0 -top-4">
                        DRL Ref: {item.drl} mGy
                      </span>
                    </div>

                    {/* Actual patient average exposure */}
                    <div className="relative">
                      <div className="w-full h-1.5 bg-slate-150 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            item.actual > item.drl 
                              ? 'bg-rose-500' 
                              : item.actual > item.drl * 0.85 
                                ? 'bg-amber-400'
                                : 'bg-cyan-600'
                          }`}
                          style={{ width: `${actualWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Value Summary */}
                  <div className="col-span-2 text-right">
                    <span className={`text-xs font-mono font-bold ${
                      item.actual > item.drl ? 'text-rose-600' : 'text-slate-800'
                    }`}>
                      {item.actual > 0 ? `${item.actual.toFixed(2)}` : '0.00'} 
                    </span>
                    <span className="text-[9px] text-slate-400 ml-0.5 font-mono">mGy</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Legend */}
          <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>* Normalized with patient profile median equivalent of 180mm depth</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-stone-400 inline-block rounded-full" />
                <span>DRL LIMIT</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-cyan-600 inline-block rounded-full" />
                <span>CLINICAL AVG</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXPOSURE SAFETY ALERT REGISTRY */}
      <div className="border border-stone-200 bg-white p-6 relative rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/40" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/40" />
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4 animate-fadeIn">
          <div className="flex items-center gap-2 pl-3 border-l-2 border-rose-500">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse animate-bounce" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide font-mono uppercase">
              Exposure Safety Alert Registry (แผนกติดตามรังสีเกิดพิกัด)
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded">
            CRITICAL CASES: {alertsList.length}
          </span>
        </div>

        {alertsList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-sans">
            <ShieldCheck className="w-8 h-8 text-cyan-600 mx-auto mb-1 animate-pulse" />
            <span>ไม่มีค่าฉายรังสีเกินพิกัดมาตรฐานระดับชาติในรายงานปัจจุบัน</span>
          </div>
        ) : (
          <div className="space-y-3">
            {alertsList.map((alert) => {
              const isNotesAudited = alert.notes && alert.notes.includes('[AUDITED NOTE:');
              return (
                <div 
                  key={alert.id}
                  className={`p-4 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all rounded-lg ${
                    isNotesAudited 
                      ? 'border-emerald-250 bg-emerald-50/20' 
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-sans">{alert.patientName}</span>
                      <span className="text-[9px] bg-stone-100 text-rose-700 font-mono px-2 py-0.5 border border-stone-200 rounded">
                        HN: {alert.hn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans">
                      หัตถการ: <span className="font-bold text-slate-700">{alert.examType}</span> | พารามิเตอร์รังสี: <span className="font-mono text-cyan-700 font-bold">{alert.kv}kV, {alert.mAs}mAs, SSD {alert.ssd}cm</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ESD บังเกิด: <span className="text-rose-600 font-bold">{alert.esd} mGy</span> (มาตรฐาน DRL กำหนด: {alertDrlLimit(alert.examType)} mGy) | สัญญาณวันเวลา {alert.timestamp.substring(0, 16).replace('T', ' ')}
                    </p>
                    
                    {alert.notes && (
                      <div className="p-2.5 border border-stone-150 bg-stone-50 rounded-lg mt-2 text-[10px] text-slate-650 leading-relaxed max-w-2xl whitespace-pre-line font-mono">
                        {alert.notes}
                      </div>
                    )}
                  </div>

                  {/* Review Trigger Button */}
                  <div className="shrink-0">
                    {activeReviewId === alert.id ? (
                      <div className="space-y-2 text-right">
                        <textarea
                          placeholder="ระบุข้อทบทวน เช่น ลำแสงบีบเพื่อจำกัดรอยโรคแบบเจาะจง หรือ ผู้ป่วยสรีระโครงกระดูกหนาพิเศษ..."
                          value={reviewNotes[alert.id] || ''}
                          onChange={(e) => setReviewNotes({ ...reviewNotes, [alert.id]: e.target.value })}
                          rows={2}
                          className="w-64 bg-stone-50 text-[11px] border border-stone-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 resize-none font-sans"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveReviewId(null)}
                            className="bg-stone-105 border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-200 font-bold py-1 px-2.5 rounded-md text-[10px] cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAuditComment(alert.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2.5 rounded-md text-[10px] cursor-pointer"
                          >
                            เซฟลายเซ็นวิเคราะห์
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReviewId(alert.id);
                          setReviewNotes({ ...reviewNotes, [alert.id]: '' });
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${
                          isNotesAudited 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{isNotesAudited ? 'ทบทวนใบอนุมัติแล้ว' : 'ทบทวนการทำงานทางคลินิก (Sign Off Audit)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Quick helper to show correct standard limit in log
function alertDrlLimit(examType: string): number {
  const lowered = examType.toLowerCase();
  if (lowered.includes('chest')) return 0.35;
  if (lowered.includes('abdomen')) return 5.0;
  if (lowered.includes('lumbar') || lowered.includes('spine')) return 6.0;
  if (lowered.includes('skull')) return 3.0;
  if (lowered.includes('pelvis')) return 4.5;
  return 0.5;
}
