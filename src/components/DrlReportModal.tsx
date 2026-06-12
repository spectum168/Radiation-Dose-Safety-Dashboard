/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, AlertCircle, FileText, TrendingDown, BookOpen } from 'lucide-react';

interface DrlReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrlReportModal({ isOpen, onClose }: DrlReportModalProps) {
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = printableAreaRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>รายงานสรุปการประเมินปริมาณรังสีที่ผิวหนัง (ESAK) หน่วยงานรังสีเทคนิค โรงพยาบาลแม่ทา</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Sarabun', sans-serif;
                color: #1e293b;
                padding: 40px;
                background-color: #ffffff;
                line-height: 1.6;
              }
              h1 {
                font-size: 22px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 4px;
                text-align: center;
              }
              .subtitle {
                font-size: 13px;
                color: #475569;
                text-align: center;
                margin-bottom: 24px;
                border-bottom: 2px solid #cbd5e1;
                padding-bottom: 12px;
              }
              h2 {
                font-size: 15px;
                font-weight: 700;
                color: #0369a1;
                border-left: 4px solid #0284c7;
                padding-left: 8px;
                margin-top: 24px;
                margin-bottom: 12px;
              }
              p, li {
                font-size: 13px;
                margin-bottom: 8px;
              }
              ul {
                margin-top: 4px;
                padding-left: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 12px;
              }
              th, td {
                border: 1px solid #cbd5e1;
                padding: 10px;
                text-align: left;
              }
              th {
                background-color: #f8fafc;
                font-weight: 700;
                color: #0f172a;
              }
              .status-safe-very {
                color: #111827;
                background-color: #f0fdf4;
                font-weight: 700;
                border: 1px solid #bbf7d0;
                padding: 2px 6px;
                border-radius: 4px;
              }
              .status-safe {
                color: #111827;
                background-color: #eff6ff;
                font-weight: 700;
                border: 1px solid #bfdbfe;
                padding: 2px 6px;
                border-radius: 4px;
              }
              .status-pending {
                color: #111827;
                background-color: #fffbeb;
                font-weight: 700;
                border: 1px solid #fde68a;
                padding: 2px 6px;
                border-radius: 4px;
              }
              .footer {
                margin-top: 40px;
                border-top: 1px solid #e2e8f0;
                padding-top: 12px;
                font-size: 10px;
                color: #64748b;
                text-align: center;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-stone-200">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-800">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-wide font-sans m-0">
              รายงานประเมินปริมาณรังสีเปรียบเทียบ (ESAK vs National DRLs)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Area */}
        <div className="p-6 overflow-y-auto max-h-[75vh] bg-stone-50/50">
          <div 
            ref={printableAreaRef}
            className="p-8 md:p-12 bg-white text-slate-800 border border-stone-200/80 rounded-2xl shadow-sm text-left font-sans max-w-4xl mx-auto"
          >
            {/* Document Header Accent */}
            <div className="border-b-4 border-double border-cyan-600 pb-5 mb-8">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                รายงานสรุปการประเมินปริมาณรังสีที่ผิวหนัง (ESAK) หน่วยงานรังสีเทคนิค โรงพยาบาลแม่ทา
              </h1>
              <p className="text-xs uppercase font-mono tracking-widest text-cyan-700 font-bold mt-1.5">
                Radiation Dose Safety Audit & Compliance Report | Hospital General Practice
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-[11px] text-slate-500 font-medium">
                <p>ระดับมาตรฐานอ้างอิง: <span className="font-bold text-slate-800">National DRLs 2566 (กระทรวงสาธารณสุข)</span></p>
                <p>อ้างอิงตารางวิเคราะห์: <span className="font-bold text-slate-800">ตารางวิเคราะห์ และรายงานผล</span></p>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  บทสรุปผู้บริหาร
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-normal">
                ผลการวิเคราะห์ข้อมูลพบว่า การกำหนดค่าเทคนิคในตารางปฏิบัติงานส่วนใหญ่อยู่ในเกณฑ์ที่มีความปลอดภัยสูงมาก โดยเฉพาะการถ่ายภาพรังสีในส่วนอวัยวะหลัก เช่น ทรวงอก ช่องท้อง กระดูกสันหลัง และกะโหลกศีรษะ ซึ่งมีค่า ESAK ต่ำกว่าเกณฑ์ National DRLs อย่างมีนัยสำคัญ สำหรับการถ่ายภาพรังสีส่วนปลาย (Extremities) ได้แก่ มือและข้อมือ แม้ว่าจะมีปริมาณรังสีต่ำในเชิงคลินิก แต่ยังพบว่าสูงกว่าค่าเป้าหมายอุดมคติ (ESD) เล็กน้อย ซึ่งสามารถปรับปรุงให้ดียิ่งขึ้นได้ตามหลักการ ALARA (As Low As Reasonably Achievable) เพื่อให้เกิดความสมบูรณ์แบบในการป้องกันรังสี
              </p>
            </section>

            {/* Section 2: Parameters and calculations */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-1.5">
                <BookOpen className="w-4 h-4 text-cyan-700" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  พารามิเตอร์และเกณฑ์การคำนวณ
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                ในการคำนวณหาค่า ESAK เอกสารได้กำหนดพารามิเตอร์อ้างอิงและค่าคงที่ต่างๆ ดังนี้:
              </p>
              <ul className="space-y-2 text-xs text-slate-650 pl-5 list-disc">
                <li>
                  <strong className="text-slate-800">ค่า Yield ( Y(d) ):</strong> ใช้ค่าเฉลี่ยกลางของเครื่องคือ <span className="font-bold text-slate-800">0.1333 mGy/mAs</span> (เนื่องจากต้นฉบับไม่ได้ระบุค่า mA เฉพาะเจาะจง)
                </li>
                <li>
                  <strong className="text-slate-800">Focus to Detector Distance (FDD):</strong> กำหนดไว้ที่ <span className="font-bold text-slate-800">60 เซนติเมตร</span>
                </li>
                <li>
                  <strong className="text-slate-800">ความหนาของ Bucky ( t_b ):</strong>
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>ท่าที่มีการใช้ Bucky: <span className="font-bold text-slate-800">4 เซนติเมตร</span></li>
                    <li>ท่าที่ไม่มีการใช้ Bucky: <span className="font-bold text-slate-800">0 เซนติเมตร</span></li>
                  </ul>
                </li>
                <li>
                  <strong className="text-slate-800">Focus to Tabletop Distance (FTD):</strong>
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>การถ่ายภาพรังสีทรวงอก (Chest): <span className="font-bold text-slate-800">180 เซนติเมตร</span></li>
                    <li>ท่าถ่ายภาพอื่นๆ: <span className="font-bold text-slate-800">100 เซนติเมตร</span></li>
                  </ul>
                </li>
              </ul>
            </section>

            {/* Section 3: Evaluation Table */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3.5 border-b border-stone-100 pb-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  ตารางประเมินปริมาณรังสีแยกตามท่าถ่ายภาพ
                </h2>
              </div>
              
              <div className="overflow-x-auto border border-stone-250 rounded-xl bg-white shadow-sm">
                <table className="w-full text-left font-sans border-collapse text-xs my-0">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="p-3 font-extrabold text-slate-700">ท่าถ่ายภาพ (Body Part)</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center">ขนาด (t_p)</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center">ค่าเทคนิค (kVp / mAs)</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center bg-cyan-50/40 text-cyan-900">ESAK คำนวณ (mGy)</th>
                      <th className="p-3 font-extrabold text-slate-700 text-center">DRLs / ESD (2566)</th>
                      <th className="p-3 font-extrabold text-slate-705 text-center">สถานะความปลอดภัย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Chest Upright - PA (bucky)</td>
                      <td className="p-3 text-center text-slate-600">20 cm</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">80 kVp / 5 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">0.10</td>
                      <td className="p-3 text-center text-slate-600">~ 0.30</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ปลอดภัยมาก)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Abdomen / KUB - Supine (bucky)</td>
                      <td className="p-3 text-center text-slate-600">22 cm</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">75 kVp / 25 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">2.19</td>
                      <td className="p-3 text-center text-slate-600">~ 3.50</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ปลอดภัย)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">S-Line / L-S Spine - AP (bucky)</td>
                      <td className="p-3 text-center text-slate-600">22 cm</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">75 kVp / 25 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">2.19</td>
                      <td className="p-3 text-center text-slate-600">~ 4.50</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ปลอดภัย)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">L-S Spine - Lateral (bucky)</td>
                      <td className="p-3 text-center text-slate-600">24 cm</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">80 kVp / 32 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">2.96</td>
                      <td className="p-3 text-center text-slate-600">~ 10.00</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (รังสีต่ำกว่าเกณฑ์ 3 เท่า)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Pelvis / Hip Both - AP (bucky)</td>
                      <td className="p-3 text-center text-slate-600">22 cm</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">75 kVp / 25 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">2.19</td>
                      <td className="p-3 text-center text-slate-600">~ 3.00</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ปลอดภัย)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Skull - AP (bucky)</td>
                      <td className="p-3 text-center text-slate-600">(20 cm)</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">65 kVp / 25 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">2.08</td>
                      <td className="p-3 text-center text-slate-600">~ 2.50</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ตามมาตรฐาน)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Knee - AP, Lateral</td>
                      <td className="p-3 text-center text-slate-600">(12 cm)</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">55 kVp / 5 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">0.31</td>
                      <td className="p-3 text-center text-slate-400"> - </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">
                          ผ่าน (ปริมาณรังสีต่ำมาก)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Hand - PA, Oblique</td>
                      <td className="p-3 text-center text-slate-600">(4 cm)</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">46 kVp / 2.5 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">0.13</td>
                      <td className="p-3 text-center text-slate-600">~ 0.045</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold">
                          พิจารณาปรับปรุง
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">Wrist - PA, Lateral</td>
                      <td className="p-3 text-center text-slate-600">(4 cm)</td>
                      <td className="p-3 text-center font-mono text-slate-700 font-bold">48 kVp / 2.5 mAs</td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-700 bg-cyan-50/20">0.13</td>
                      <td className="p-3 text-center text-slate-600">~ 0.060</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold">
                          พิจารณาปรับปรุง
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Deep analysis */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-1.5">
                <AlertCircle className="w-4 h-4 text-cyan-800" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  บทวิเคราะห์เชิงลึก
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-650 leading-relaxed mb-4">
                จากการเปรียบเทียบข้อมูลในตารางเทคนิค สามารถจำแนกผลการวิเคราะห์ออกเป็น 2 กลุ่มหลัก ดังนี้:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs md:text-sm">
                  <h4 className="font-extrabold text-slate-900 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    1. กลุ่มอวัยวะหลักและส่วนลำตัว (Major Organs & Spine)
                  </h4>
                  <p className="text-slate-650 leading-relaxed text-xs m-0">
                    การตั้งค่าเทคนิคสำหรับทรวงอก ช่องท้อง กระดูกสันหลัง และกะโหลกศีรษะ เช่น การใช้ 25 mAs สำหรับช่องท้องและกระดูกสันหลังส่วนเอว (L-Spine AP) และ 32 mAs สำหรับ L-Spine Lateral ถือเป็นค่ามาตรฐานที่มีประสิทธิภาพสูง ผลการคำนวณ ESAK ในทุกท่าถ่ายภาพในกลุ่มนี้ <span className="font-bold text-emerald-700">"ผ่านเกณฑ์ความปลอดภัย"</span> และมีค่าต่ำกว่าเกณฑ์มาตรฐานระดับประเทศ (National DRLs) อย่างชัดเจน ซึ่งสะท้อนถึงการตั้งค่าที่มุ่งเน้นการปกป้องผู้ป่วยได้เป็นอย่างดี
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs md:text-sm">
                  <h4 className="font-extrabold text-slate-900 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    2. กลุ่มอวัยวะส่วนปลาย (Extremities)
                  </h4>
                  <p className="text-slate-650 leading-relaxed text-xs m-0">
                    สำหรับท่าถ่ายภาพมือ (Hand) และข้อมือ (Wrist) มีประเด็นที่ควรพิจารณาดังนี้:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-slate-650 mt-1.5 space-y-1">
                    <li><strong className="text-slate-800">ผลการวัด:</strong> ค่าเทคนิคที่ระบุไว้คือ 2.5 mAs ส่งผลให้ค่า ESAK อยู่ที่ประมาณ 0.13 mGy</li>
                    <li><strong className="text-slate-800">การประเมินทางคลินิก:</strong> ปริมาณรังสีระดับนี้ถือว่าน้อยมากและไม่มีอันตรายต่อผู้ป่วยในทางปฏิบัติ</li>
                    <li><strong className="text-slate-800">การเปรียบเทียบเกณฑ์มาตรฐาน:</strong> เมื่อเทียบกับเกณฑ์ ESD ที่มีความเข้มงวดสูง (45-60 µGy) พบว่าค่าที่ได้สูงกว่าเกณฑ์เล็กน้อย</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: ALARA Guideline recommendations */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  แนวทางการปรับปรุงตามหลัก ALARA
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-650 leading-relaxed mb-3">
                เพื่อให้การใช้รังสีเป็นไปอย่างเหมาะสมที่สุด เอกสารได้เสนอแนวทางปฏิบัติเพิ่มเติมดังนี้:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-650 space-y-1">
                <li>
                  <strong className="text-slate-800">การปรับลด mAs:</strong> หากเครื่องรับภาพ (CR/DR) ของสถานพยาบาลมีความไวแสง (Sensitivity) เพียงพอ ควรพิจารณาทดลองลดค่า mAs สำหรับท่าถ่ายภาพมือและข้อมือลงมาอยู่ที่ช่วง <span className="font-bold text-slate-900">1.2 - 1.6 mAs</span>
                </li>
                <li>
                  <strong className="text-slate-800">ผลลัพธ์ที่คาดหวัง:</strong> หากปรับลดตามคำแนะนำและภาพถ่ายรังสียังคงมีความชัดเจนเพียงพอต่อการวินิจฉัย จะช่วยให้ค่า ESAK ลดลงมาอยู่ต่ำกว่า 0.06 mGy ซึ่งสอดคล้องกับเกณฑ์ ESD อย่างสมบูรณ์
                </li>
              </ul>
            </section>

            {/* Section 6: Summary evaluation Conclusion */}
            <section className="mb-4">
              <div className="flex items-center gap-2 mb-3 border-b border-stone-100 pb-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  บทสรุปการประเมิน
                </h2>
              </div>
              <p className="text-xs md:text-sm text-slate-650 leading-relaxed m-0">
                โดยภาพรวม "ตารางวิเคราะห์ และรายงานผล" มีการกำหนดค่าทางเทคนิคที่เหมาะสมและปลอดภัยสำหรับการใช้งานในแผนกรังสีวินิจฉัย โดยเน้นการรักษามาตรฐานการป้องกันรังสีแก่ผู้ป่วยในระดับที่ดีเยี่ยม และมีจุดที่สามารถพัฒนาต่อยอดได้ในส่วนของการถ่ายภาพรังสีอวัยวะส่วนปลายเพื่อความเป็นเลิศตามมาตรฐานสากล
              </p>
            </section>

            <div className="border-t border-stone-200 pt-4 mt-8 text-[9px] text-slate-400 text-center uppercase tracking-wider font-mono">
              Medical Radiation Safety Program • Ministry of Public Health Thailand • Year 2569
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ตารางรายงาน (Print Report)</span>
          </button>
          <button
            onClick={onClose}
            className="bg-stone-200 hover:bg-stone-300 text-slate-700 border border-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
          >
            <span>ปิดหน้าต่าง</span>
          </button>
        </div>

      </div>
    </div>
  );
}
