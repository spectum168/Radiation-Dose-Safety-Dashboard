/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Calendar, FileText, Trash2, ShieldCheck, ShieldAlert, ShieldX, Filter } from 'lucide-react';
import { DoseRecord } from '../types';

interface DoseHistoryProps {
  records: DoseRecord[];
  onDeleteRecord: (id: string) => void;
  onViewReport: (record: DoseRecord) => void;
}

export default function DoseHistory({
  records,
  onDeleteRecord,
  onViewReport
}: DoseHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deletingRecord, setDeletingRecord] = useState<DoseRecord | null>(null);

  // Group records by day
  const groupRecordsByDay = (filteredList: DoseRecord[]) => {
    const groups: Record<string, DoseRecord[]> = {};
    filteredList.forEach(rec => {
      // Extract YYYY-MM-DD from timestamp
      const dateKey = rec.timestamp.substring(0, 10);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(rec);
    });
    return groups;
  };

  // Filter records based on search and filters
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.hn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.rtName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDate = selectedDate ? rec.timestamp.startsWith(selectedDate) : true;
    
    const matchesStatus = selectedStatus !== 'all' ? rec.safetyStatus === selectedStatus : true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const grouped = groupRecordsByDay(filteredRecords);

  // Sorting days in descending order
  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const statusIcons = {
    safe: <ShieldCheck className="w-4 h-4 text-cyan-600" />,
    warning: <ShieldAlert className="w-4 h-4 text-amber-650" />,
    critical: <ShieldX className="w-4 h-4 text-rose-500" />
  };

  const statusText = {
    safe: 'ปลอดภัย (Safe)',
    warning: 'เฝ้าระวัง (Warning)',
    critical: 'เกินเกณฑ์ DRL (Critical)'
  };

  const statusColors = {
    safe: 'text-cyan-750 bg-cyan-50 border-cyan-150',
    warning: 'text-amber-800 bg-amber-50 border-amber-150',
    critical: 'text-rose-700 bg-rose-50 border-rose-150'
  };

  return (
    <div className="border border-stone-200 rounded-xl bg-white p-6 shadow-sm space-y-6 text-left">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-wide font-sans">
            ฐานข้อมูลเวชระเบียนรังสีรายวัน (Daily Patient Scan Records)
          </h3>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            สืบค้นข้อมูล ตรวจสอบเอกสารรายงาน และดาวน์โหลดใบรับรองโดสคนไข้ในสาลารังสี
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Text Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, HN, นักรังสี..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white w-44 md:w-56 transition-all"
            />
          </div>

          {/* Date Picker */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white cursor-pointer transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-9 pr-6 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-cyan-500 focus:bg-white cursor-pointer appearance-none transition-all"
            >
              <option value="all">ทุกระดับโดส</option>
              <option value="safe">ปลอดภัย (Safe)</option>
              <option value="warning">แจ้งเตือน (Warning)</option>
              <option value="critical">อันตราย (Critical)</option>
            </select>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
          <p className="text-slate-500 font-sans text-xs font-semibold">ยังไม่มีบันทึกข้อมูลการสแกนรังสีในเครื่องนี้</p>
          <p className="text-[10px] text-slate-400 font-sans mt-1">กรอกฟอร์มเครื่องสแกนด้านบนเพื่อลงบันทึกการดำเนินการคนไข้รายแรก</p>
        </div>
      ) : sortedDays.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 font-sans text-xs">ไม่พบผลการสืบค้นตามตัวกรองที่เลือก</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => {
            const dayRecords = grouped[day];
            // Format nice full Thai Date
            const dateObj = new Date(day);
            const formattedDayStr = dateObj.toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={day} className="border border-stone-200/60 rounded-xl bg-stone-50/30 overflow-hidden">
                {/* Daily Subheader */}
                <div className="bg-stone-50/80 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-700 font-sans">
                      {formattedDayStr}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                    ทั้งหมด {dayRecords.length} รายการ
                  </span>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50/50 text-slate-400 font-bold border-b border-stone-200">
                        <th className="py-2.5 px-4 font-mono text-[10px] uppercase">HN / ข้อมูลผู้ป่วย</th>
                        <th className="py-2.5 px-4 font-mono text-[10px] uppercase">หัตถการ (EXAM)</th>
                        <th className="py-2.5 px-3 font-mono text-[10px] text-center uppercase">ปรังปรุง kV / mAs</th>
                        <th className="py-2.5 px-3 font-mono text-[10px] text-right text-cyan-600 uppercase">ESD (mGy)</th>
                        <th className="py-2.5 px-3 font-mono text-[10px] text-right text-indigo-600 uppercase">Effective (mSv)</th>
                        <th className="py-2.5 px-4 font-mono text-[10px] uppercase">สถานะความปลอดภัย</th>
                        <th className="py-2.5 px-4 text-center font-mono text-[10px] uppercase">ผู้ปฎิบัติหน้าเครื่อง</th>
                        <th className="py-2.5 px-4 text-center font-mono text-[10px] uppercase">รายงาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {dayRecords.map((rec) => {
                        return (
                          <tr key={rec.id} className="hover:bg-[#FAF9F5]/40 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{rec.patientName}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">HN: {rec.hn} ({rec.gender === 'male' ? 'ชาย' : 'หญิง'})</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {rec.examType}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-mono text-slate-650">{rec.kv}kV / {rec.mAs}mAs</span>
                              {rec.isAlaraApplied && (
                                <span className="block text-[8px] text-teal-600 font-mono font-bold mt-0.5 uppercase">ALARA Applied</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold font-mono text-cyan-600">
                              {rec.esd.toFixed(3)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold font-mono text-indigo-705">
                              {rec.effectiveDose.toFixed(3)}
                            </td>
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-semibold ${statusColors[rec.safetyStatus]}`}>
                                {statusIcons[rec.safetyStatus]}
                                <span>{statusText[rec.safetyStatus]}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500">
                              <p className="font-semibold text-slate-800">{rec.rtName}</p>
                              <p className="text-[9px] text-slate-450 mt-0.5">
                                {rec.position === 'RT' ? 'นักรังสีเทคนิค' : 'เจ้าพนักงานรังสีฯ'}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => onViewReport(rec)}
                                  className="p-1 px-1.5 rounded bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-705 cursor-pointer active:scale-95 transition-all text-[11px] font-bold flex items-center gap-1"
                                  title="ดูรายงานผล PDF"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Report</span>
                                </button>
                                <button
                                  onClick={() => setDeletingRecord(rec)}
                                  className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 cursor-pointer active:scale-95 transition-all"
                                  title="ลบข้อมูลชั่วคราว"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom elegant delete confirmation dialog */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="border border-stone-200 bg-white max-w-md w-full p-6 relative rounded-xl shadow-xl text-left">
            {/* Corner markings for Geometric Balance theme */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-rose-500/40" />
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-rose-500/40" />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-rose-500/40" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-rose-500/40" />
            
            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Confirm Record Deletion</span>
            </h4>
            
            <p className="text-xs text-slate-650 leading-relaxed font-sans mb-5 mt-3">
              คุณกำลังจะทำการลบข้อมูลรายงานปริมาณรังสีของคนไข้ <strong className="text-slate-800 font-semibold">{deletingRecord.patientName} (HN: {deletingRecord.hn})</strong> ออกจากฐานข้อมูลส่วนท้องถิ่น ระบบไม่แนะนำให้ลบหากไม่ได้รับอนุมัติจากหัวหน้าแผนกวิทยาศาสตร์รังสี ยืนยันการดำเนินการลบหรือไม่?
            </p>
            
            <div className="flex items-center justify-end gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-3.5 py-2 bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-200 cursor-pointer transition-colors uppercase rounded-lg"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(deletingRecord.id);
                  setDeletingRecord(null);
                }}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold cursor-pointer transition-all uppercase rounded-lg"
              >
                ยืนยันการลบ (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
