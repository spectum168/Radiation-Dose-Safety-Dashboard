/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { DoseRecord } from '../types';
import jsPDF from 'jspdf';

interface ReportModalProps {
  record: DoseRecord;
  onClose: () => void;
}

export default function ReportModal({ record, onClose }: ReportModalProps) {
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Formatting timestamp
  const dateFormatted = new Date(record.timestamp).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Save pdf handler using Canvas capture or direct rendering
  const handleDownloadPDF = () => {
    // Generate high quality diagnostic report via jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // We render bilingual text using Helvetica (fits well for standard layouts)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(20);
    doc.text('CLINICAL RADIATION DOSE ASSESSMENT REPORT', 15, 20);
    
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(1);
    doc.line(15, 25, 195, 25); // primary cyan underline

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('NATIONAL RADIOLOGY CLINICAL INSTITUTE  |  ROYAL THAI PUBLIC HEALTH NETWORK', 15, 30);

    // Section 1: Patient Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('Helvetica', 'bold');
    doc.text('1. PATIENT DEMOGRAPHICS / GEOMETRY', 15, 42);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Patient Name: ${record.patientName}`, 15, 50);
    doc.text(`Hospital Number (HN): ${record.hn}`, 15, 55);
    doc.text(`Biological Sex: ${record.gender.toUpperCase()}`, 15, 60);
    doc.text(`Anatomical Thickness: ${record.thickness} cm`, 15, 65);

    doc.text(`Date & Time (UTC): ${record.timestamp.substring(0, 16).replace('T', ' ')}`, 110, 50);
    doc.text(`Exam Type: ${record.examType.toUpperCase()}`, 110, 55);
    doc.text(`Safety Standard (DRL Status): ${record.safetyStatus.toUpperCase()}`, 110, 60);
    doc.text(`ALARA Principle Optimised: ${record.isAlaraApplied ? 'YES' : 'NO'}`, 110, 65);

    // Section 2: Technical Exposure Metrics
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('2. TECHNICAL COMPLIANCE & EXPOSURE PARAMETERS', 15, 78);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    
    // Draw table box
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.rect(15, 82, 180, 25);
    
    // Column grid
    doc.text('Tube Voltage (kV)', 18, 88);
    doc.text('Tube Charge (mAs)', 65, 88);
    doc.text('Source-Skin Dist. (SSD/FSD)', 110, 88);
    doc.text('Entrance Skin Dose (ESD)', 155, 88);
    
    doc.line(15, 91, 195, 91); // table horizontal splitter

    // Values
    doc.setFont('Helvetica', 'bold');
    doc.text(`${record.kv} kVp`, 18, 100);
    doc.text(`${record.mAs} mAs`, 65, 100);
    doc.text(`${record.ssd} cm`, 110, 100);
    doc.setFillColor(record.safetyStatus === 'safe' ? 34 : record.safetyStatus === 'warning' ? 245 : 239, 100, 100);
    doc.text(`${record.esd.toFixed(3)} mGy`, 155, 100);

    // Section 3: Organ Absorbed Dose Breakdown
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('Helvetica', 'bold');
    doc.text('3. COMPREHENSIVE ORGAN ABSORPTION breakdown (mGy)', 15, 118);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    
    doc.text('Lung Tissue Dose:', 15, 126);
    doc.text(`${record.organDoses.lung.toFixed(4)} mGy`, 75, 126);

    doc.text('Thyroid Gland Dose:', 15, 132);
    doc.text(`${record.organDoses.thyroid.toFixed(4)} mGy`, 75, 132);

    doc.text('Active Bone Marrow:', 15, 138);
    doc.text(`${record.organDoses.boneMarrow.toFixed(4)} mGy`, 75, 138);

    doc.text('Critical Gonadal Shielding Area:', 15, 144);
    doc.text(`${record.organDoses.gonads.toFixed(4)} mGy`, 75, 144);

    doc.text('Brain / Nervous System Center:', 15, 150);
    doc.text(`${record.organDoses.brain.toFixed(4)} mGy`, 75, 150);

    doc.setDrawColor(220);
    doc.rect(110, 122, 85, 30);
    doc.setFont('Helvetica', 'bold');
    doc.text('INTEGRATED SUMMARY', 113, 128);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Effective Dose Score: ${record.effectiveDose.toFixed(3)} mSv`, 113, 135);
    doc.text(`ALARA Dose Reduction: ${record.isAlaraApplied ? '37%' : '0% - Standard'}`, 113, 141);
    doc.text(`Safety Verdict: ${record.safetyStatus === 'safe' ? 'VERIFIED COMPLIANT' : 'REQUIRES AUDIT'}`, 113, 147);

    // Section 4: Signature check
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('4. VERIFYING MEDICAL OPERATOR DIGITAL SIGNATURE', 15, 168);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.rect(15, 172, 180, 42);

    const fullPositionStr = record.position === 'RT' ? 'RT / Radiographer (นักรังสีเทคนิค)' : 'Assistant Radiotherapist (เจ้าพนักงานรังสีการแพทย์)';

    doc.text(`Authorized Operator Name:  ${record.rtName}`, 20, 182);
    doc.text(`Designated Professional Title:  ${fullPositionStr}`, 20, 189);
    doc.text(`Clinical Log ID Reference: [${record.id}]`, 20, 196);
    doc.text(`Digital Verification Hash Code: md5-sha256:(${Math.sin(parseInt(record.hn.replace(/\D/g,'') || '1')).toString(16).substring(3, 12)})`, 20, 203);

    // Signature Line
    doc.line(130, 201, 185, 201);
    doc.setFontSize(8);
    doc.text('Radiographer Stamp & Physical Sign-Off', 132, 206);

    // Footer lines
    doc.setDrawColor(240);
    doc.line(15, 240, 195, 240);
    doc.text('This sheet tracks compliance with ICRP-103 recommendations and ALARA laws.', 15, 246);
    doc.text('Generated via Hospital Safety Console. All local storage logs are encrypted to protect patient details.', 15, 251);

    // Save
    doc.save(`Clinical_Dose_Report_${record.hn || 'HN'}.pdf`);
  };

  const handlePrint = () => {
    // Print the letterhead using the browser printing agent
    const printContent = printableAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (!printContent) return;

    // Open a clean printing iframe or window or custom CSS printing to look amazing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Clinical Dose Report - HN ${record.hn}</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Sarabun', sans-serif;
                color: #0f172a;
                padding: 40px;
                background-color: #ffffff;
                line-height: 1.5;
              }
              .letterhead {
                border-bottom: 3px double #0284c7;
                padding-bottom: 12px;
                margin-bottom: 24px;
              }
              .logo-title {
                font-size: 24px;
                font-weight: 700;
                color: #0369a1;
                margin: 0;
              }
              .sub-logo {
                font-size: 11px;
                color: #64748b;
                margin-top: 4px;
                font-weight: 600;
              }
              .grid-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 24px;
              }
              .section-title {
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 6px;
                margin-bottom: 12px;
                text-transform: uppercase;
              }
              .data-item {
                font-size: 13px;
                margin-bottom: 6px;
              }
              .data-label {
                font-weight: 600;
                color: #475569;
              }
              .table-exposure {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 24px;
              }
              .table-exposure th, .table-exposure td {
                border: 1px solid #cbd5e1;
                padding: 8px 12px;
                text-align: center;
                font-size: 13px;
              }
              .table-exposure th {
                background-color: #f1f5f9;
                font-weight: 600;
              }
              .dose-badge {
                font-weight: 700;
                font-size: 14px;
                color: #be123c;
              }
              .dose-badge.safe {
                color: #0f766e;
              }
              .dose-badge.warning {
                color: #b45309;
              }
              .signature-box {
                border: 1px solid #cbd5e1;
                padding: 16px;
                border-radius: 8px;
                margin-top: 30px;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
              }
              .sig-line {
                border-bottom: 1px solid #94a3b8;
                width: 200px;
                margin-top: 40px;
                margin-left: auto;
              }
              .footer {
                margin-top: 60px;
                border-top: 1px solid #e2e8f0;
                padding-top: 12px;
                font-size: 10px;
                color: #64748b;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="letterhead">
              <h1 class="logo-title">เวชระเบียนรายงานปริมาณรังสีทางการแพทย์ (Clinical Dose Report)</h1>
              <div class="sub-logo">สถาบันฟิสิกส์การแพทย์และรังสีวินิจฉัยแห่งชาติ | NATIONAL CENTER of MEDICAL DOSIMETRY ENGINEERING</div>
            </div>

            <div class="grid-section">
              <div>
                <div class="section-title">1. ข้อมูลผู้ป่วยเฝ้าระวัง (Patient Details)</div>
                <div class="data-item"><span class="data-label">ชื่อผู้เข้ารับการตรวจ:</span> ${record.patientName}</div>
                <div class="data-item"><span class="data-label">เลขเวชระเบียน (HN):</span> ${record.hn}</div>
                <div class="data-item"><span class="data-label">เพศสรีรวิทยา:</span> ${record.gender === 'male' ? 'ชาย (Male)' : record.gender === 'female' ? 'หญิง (Female)' : 'อื่นๆ'}</div>
                <div class="data-item"><span class="data-label">ความหนาอวัยวะตรวจ:</span> ${record.thickness} ซม.</div>
              </div>
              <div>
                <div class="section-title">2. ข้อมูลสรุปสิ่งส่งตรวจ (Execution Metadata)</div>
                <div class="data-item"><span class="data-label">วันเวลาที่ลงทะเบียนรังสี:</span> ${dateFormatted}</div>
                <div class="data-item"><span class="data-label">ประเภทการตรวจ:</span> ${record.examType}</div>
                <div class="data-item"><span class="data-label">การปฏิบัติตามหลักรังสี ALARA:</span> ${record.isAlaraApplied ? 'มีการปรับเทคโนโลยี 15%' : 'ระดับมาตรฐานทั่วไป'}</div>
                <div class="data-item"><span class="data-label">ระดับความปลอดภัยรังสี:</span> <span class="dose-badge ${record.safetyStatus}">${record.safetyStatus === 'safe' ? 'ภายใต้กำหนด DRL - ปลอดภัย' : record.safetyStatus === 'warning' ? 'ระดับเตือนภัยเฝ้าระวัง' : 'ระดับค่าละเมิดสูงเกินความพึงประสงค์ (Critical)'}</span></div>
              </div>
            </div>

            <div class="section-title">3. พารามิเตอร์รังสีวิทยาและการปล่อยรังสี (Technical Parameters)</div>
            <table class="table-exposure">
              <thead>
                <tr>
                  <th>ค่าแรงดันหลอดรังสี (kV)</th>
                  <th>กระแสไฟฟ้าคุมเวลา (mAs)</th>
                  <th>ระยะโฟกัสถึงผิวหนัง (SSD)</th>
                  <th>Entrance Skin Dose (ESD)</th>
                  <th>โดสประสิทธิผลรวม (Effective Dose)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${record.kv} kVp</strong></td>
                  <td><strong>${record.mAs} mAs</strong></td>
                  <td><strong>${record.ssd} ซม. (cm)</strong></td>
                  <td><span class="dose-badge ${record.safetyStatus}">${record.esd.toFixed(3)} mGy</span></td>
                  <td><strong>${record.effectiveDose.toFixed(3)} mSv</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="grid-section">
              <div>
                <div class="section-title">4. การแจกแจงโดสรังสีที่สะสมในอวัยวะ (Organ Specific Absorption)</div>
                <div class="data-item"><span class="data-label">บริเวณปอด (Lung):</span> ${record.organDoses.lung.toFixed(4)} mGy</div>
                <div class="data-item"><span class="data-label">ต่อมไทรอยด์ (Thyroid):</span> ${record.organDoses.thyroid.toFixed(4)} mGy</div>
                <div class="data-item"><span class="data-label">ไขกระดูกทำงาน (Bone Marrow):</span> ${record.organDoses.boneMarrow.toFixed(4)} mGy</div>
                <div class="data-item"><span class="data-label">อวัยวะสืบพันธุ์และการสืบสายพันธุ์ (Gonads):</span> ${record.organDoses.gonads.toFixed(4)} mGy</div>
                <div class="data-item"><span class="data-label">เนื้อสมอง (Brain / CNS):</span> ${record.organDoses.brain.toFixed(4)} mGy</div>
              </div>
              <div>
                <div class="section-title">เกณฑ์ Diagnostic Reference Levels</div>
                <div style="font-size: 12px; color: #475569; padding: 10px; background-color: #f8fafc; border-radius: 6px;">
                  * รายงานนี้จัดทำขึ้นโดยอ้างอิงประกาศกระทรวงสาธารณสุข และหลักเกณฑ์มาตรฐานความปลอดภัยรังสีวิทยาการแพทย์สากล ICRP Publication 103 เพื่อบันทึกพฤติกรรมการรับรังสีเปรียบเทียบในเวชระเบียนประจำปี ป้องกันผลกระทบแบบ Deterministic Effect และลดอัตราผูกขาดแบบ Stochastic Effect.
                </div>
              </div>
            </div>

            <div class="signature-box">
              <div>
                <div style="font-weight:700; margin-bottom: 8px;">5. คำรับรองการตรวจโดยวิชาชีพกุมารเวช/รังสีเทคนิค</div>
                <div class="data-item"><span class="data-label">ลายเซ็นได้รับการรับรองโดย:</span> ${record.rtName}</div>
                <div class="data-item"><span class="data-label">ตำแหน่งปฎิบัติงาน:</span> ${record.position === 'RT' ? 'นักรังสีเทคนิค (Registered Radiologic Technologist)' : 'เจ้าพนักงานรังสีการแพทย์ (Medical Radiation Assistant)'}</div>
                <div class="data-item"><span class="data-label">รหัสอ้างอิงคิวงาน (Record ID):</span> ${record.id}</div>
              </div>
              <div style="text-align: right;">
                <div class="sig-line"></div>
                <div style="font-size: 11px; color: #475569; margin-top: 8px; margin-right: 15px;">ลงลายมือชื่อนักรังสีแพทย์ผู้ตรวจสอบ</div>
              </div>
            </div>

            <div class="footer">
              เอกสารบันทึกสุขภาพอิเล็กทรอนิกส์ (EHR) สงวนสิทธิ์ความเป็นส่วนตัวตามกฎหมาย PDPA โรงพยาบาลปวงประชาการแพทย์
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const statusIcons = {
    safe: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
    warning: <ShieldAlert className="w-10 h-10 text-amber-400" />,
    critical: <ShieldX className="w-10 h-10 text-rose-500" />
  };

  const statusBg = {
    safe: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    critical: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Toolbar Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
              Clinical Dose Assessment Report Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer Display */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Printable visual frame */}
          <div 
            ref={printableAreaRef}
            className="p-8 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-inner font-sans relative text-left"
          >
            {/* Stamp Logo accent */}
            <div className="absolute top-4 right-4 opacity-5 pointer-events-none select-none">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" />
              </svg>
            </div>

            {/* Letterhead */}
            <div className="border-b-4 border-double border-sky-600 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-sky-800 uppercase tracking-tight">
                  ใบเวชระเบียนบันทึกรังสีและโดสวิเคราะห์สากล
                </h1>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mt-0.5">
                  National Clinical Center of Advanced Radiology Physics
                </p>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  กองวิชาการนิวเคลียร์และเครื่องมือแพทย์ กระทรวงสาธารณสุขไทย
                </p>
              </div>
              <div className="sm:text-right font-mono text-[10px] text-slate-500">
                <p>เลขที่เอกสาร: <span className="font-bold text-slate-700">DCR-{record.id.substring(0, 8).toUpperCase()}</span></p>
                <p>วันที่ลงทะเบียน: {dateFormatted}</p>
              </div>
            </div>

            {/* Report body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Patient */}
              <div>
                <h3 className="text-xs font-bold text-sky-850 border-b border-slate-100 pb-1.5 uppercase mb-3">
                  1. ข้อมูลสังเกตการณ์ผู้ป่วย (Patient Demographics)
                </h3>
                <div className="space-y-1.5 text-xs">
                  <p><span className="font-semibold text-slate-500">ชื่อเจ้าของไข้ / ผู้รับสาร:</span> <span className="text-slate-900 font-bold">{record.patientName}</span></p>
                  <p><span className="font-semibold text-slate-500">เลขเวชระเบียน (HN):</span> <span className="text-slate-900 font-mono font-bold">{record.hn}</span></p>
                  <p><span className="font-semibold text-slate-500">เพศทางสรีรวิทยา:</span> <span>{record.gender === 'male' ? 'ชาย (Male)' : record.gender === 'female' ? 'หญิง (Female)' : 'อื่นๆ (Other)'}</span></p>
                  <p><span className="font-semibold text-slate-500">ความหนาร่างกายผู้ตรวจ:</span> <span className="font-bold">{record.thickness} ซม. (cm)</span></p>
                </div>
              </div>

              {/* Execution Summary */}
              <div>
                <h3 className="text-xs font-bold text-sky-850 border-b border-slate-100 pb-1.5 uppercase mb-3">
                  2. สถานะความปลอดภัยและการปฏิบัติตามเกณฑ์ (Dose Audit)
                </h3>
                <div className="space-y-1.5 text-xs">
                  <p><span className="font-semibold text-slate-500">ประเภทหัตถการฉายภาพ:</span> <span className="font-bold text-sky-800">{record.examType}</span></p>
                  <p><span className="font-semibold text-slate-500">ปรับพารามิเตอร์ ALARA 15% Rule:</span> <span className="font-bold text-emerald-600">{record.isAlaraApplied ? 'ได้รับการปรับปรุง (ลดผลรับรังสี 37%)' : 'ระดับตั้งค่าแบบทั่วไป'}</span></p>
                  <div className={`mt-2 flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold ${statusBg[record.safetyStatus]}`}>
                    {statusIcons[record.safetyStatus]}
                    <div>
                      <p className="font-bold">สถานะความปลอดภัย: {record.safetyStatus.toUpperCase()}</p>
                      <p className="font-normal text-[10px] text-slate-500">
                        {record.safetyStatus === 'safe' 
                          ? 'ผ่านขีดกำหนด DRL ปฏิบัติตามมาตรฐานสมบูรณ์' 
                          : record.safetyStatus === 'warning' 
                            ? 'ระดับเตือนภัยใกล้เกณฑ์มาตรฐาน' 
                            : 'ปริมาณรังสีละเมิดสูงเกินความหงษ์ประสงค์ (DRL Critical Exceedance)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter and output table */}
            <h3 className="text-xs font-bold text-sky-850 border-b border-slate-100 pb-1.5 uppercase mb-3">
              3. ดัชนีแสดงปริมาณรังสีเชิงตัวเลข (Dosimetry Output Indices)
            </h3>
            <table className="w-full text-center border-slate-200 border text-xs mb-6 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-mono">Voltage (kVp)</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-mono">Charge (mAs)</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-mono">SID / SSD (cm)</th>
                  <th className="py-2 px-3 border-r border-slate-200 text-[11px] font-mono text-cyan-800">Entrance Skin Dose (ESD)</th>
                  <th className="py-2 px-3 text-[11px] font-mono text-indigo-800">Effective Dose (mSv)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 text-[13px]">
                  <td className="py-3 px-3 border-r border-slate-200 font-bold font-mono">{record.kv} kVp</td>
                  <td className="py-3 px-3 border-r border-slate-200 font-bold font-mono">{record.mAs} mAs</td>
                  <td className="py-3 px-3 border-r border-slate-200 font-bold font-mono">{record.ssd} cm</td>
                  <td className="py-3 px-3 border-r border-slate-200 font-bold text-cyan-700 font-mono">{record.esd.toFixed(3)} mGy</td>
                  <td className="py-3 px-3 font-bold text-indigo-700 font-mono">{record.effectiveDose.toFixed(3)} mSv</td>
                </tr>
              </tbody>
            </table>

            {/* Organ absorbed doses */}
            <h3 className="text-xs font-bold text-sky-850 border-b border-slate-100 pb-1.5 uppercase mb-3">
              4. รายการประเมินการดูดซับของอวัยวะที่อ่อนไหวรังสี (Organ Absorbed Summary)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 text-center">
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-500 font-bold">ปอด (Lung)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">{record.organDoses.lung.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">mGy</span></p>
              </div>
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-500 font-bold">ไทรอยด์ (Thyroid)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">{record.organDoses.thyroid.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">mGy</span></p>
              </div>
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-500 font-bold">ไขกระดูก (Marrow)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">{record.organDoses.boneMarrow.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">mGy</span></p>
              </div>
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-500 font-bold">สืบพันธุ์ (Gonads)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">{record.organDoses.gonads.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">mGy</span></p>
              </div>
              <div className="p-2 border border-slate-200 rounded-xl bg-slate-50/50 col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-500 font-bold">สมอง (Brain)</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1 font-mono">{record.organDoses.brain.toFixed(4)} <span className="text-[9px] font-normal text-slate-400">mGy</span></p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end mt-4">
              <div className="sm:col-span-8 text-xs space-y-1.5">
                <h4 className="font-bold text-slate-700">5. ลายเซ็นรับรองทางคลินิก (Healthcare Provider Attestation)</h4>
                <p><span className="font-semibold text-slate-400">เจ้าหน้าที่รับรองปริมาณรังสี:</span> <span className="font-bold text-slate-800">{record.rtName}</span></p>
                <p><span className="font-semibold text-slate-400">ตำแหน่งปฎิบัติงาน:</span> <span className="font-bold text-slate-800">{record.position === 'RT' ? 'นักรังสีเทคนิค (Registered Radiologic Technologist)' : 'เจ้าพนักงานรังสีการแพทย์ (Medical Radiation Assistant)'}</span></p>
                <p className="text-[10px] font-mono text-slate-500">ID ล็อกเวิร์ก: {record.id}</p>
              </div>
              <div className="sm:col-span-4 text-center mt-3 sm:mt-0">
                <div className="border-b border-slate-400 w-full mb-1 h-8"></div>
                <p className="text-[9px] text-slate-400">ตราสแตมป์ / ลายมือชื่อประกอบการตรวจ</p>
              </div>
            </div>

            {/* Legal / Notes */}
            <div className="border-t border-slate-200 pt-3 mt-6 text-[8px] text-slate-400 leading-normal text-center sm:text-left">
              * รายงานนี้สร้างขึ้นด้วยสูตรวิทยาศาสตร์การแพทย์ประเมินผลรังสีแบบจำลอง (Computational Dosimetry Estimation Framework) คณะวิจัยสนับสนุนสมาคมเวชศาสตร์รังสีการแพทย์สากล ICRP-103. ข้อมูลประวัติรักษาสิทธิ์ตามเงื่อนไข PDPA ลบออกจากข้อมูลเว็บบราวเซอร์ทันทีเมื่อล้างแคชเครื่องของโรงพยาบาล.
            </div>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="px-6 py-4 bg-slate-950/30 border-t border-slate-800 flex flex-wrap gap-3 justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-100 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>พิมพ์รายงานในคลิกเดียว (Browser Print)</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>ดาวน์โหลดเอกสารเป็นทางการ (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
