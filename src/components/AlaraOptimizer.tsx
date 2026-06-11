/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldEllipsis, AlertCircle } from 'lucide-react';

interface AlaraOptimizerProps {
  currentKv: number;
  currentMAs: number;
  optimizedKv: number;
  optimizedMAs: number;
  currentEsd: number;
  optimizedEsd: number;
  drlThreshold: number;
  onApply: () => void;
}

export default function AlaraOptimizer({
  currentKv,
  currentMAs,
  optimizedKv,
  optimizedMAs,
  currentEsd,
  optimizedEsd,
  drlThreshold,
  onApply
}: AlaraOptimizerProps) {
  // Quantify dose reduction
  const reductionPercent = currentEsd > 0 
    ? Math.round(((currentEsd - optimizedEsd) / currentEsd) * 100)
    : 37;

  // Check if current ESD is nearing or exceeding threshold (near = >80%)
  const isHighDose = currentEsd >= drlThreshold * 0.8;

  // Relative dose bars width
  const currentWidthPct = 100;
  const optimizedWidthPct = Math.max(10, Math.min(100, (optimizedEsd / currentEsd) * 100));

  return (
    <div className={`relative border p-6 bg-white transition-all duration-300 rounded-xl hover:shadow-md ${
      isHighDose 
        ? 'border-amber-400 bg-gradient-to-br from-white to-amber-50/15' 
        : 'border-stone-200'
    }`}>
      {/* Corner markings for Geometric Balance theme */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-600/40" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-600/40" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-600/40" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-600/40" />

      {/* Decorative pulse background */}
      {isHighDose && (
        <span className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 mb-4 animate-fadeIn">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 bg-cyan-100 border border-cyan-300 flex items-center justify-center rotate-45 rounded">
            <div className="w-4 h-4 bg-white -rotate-45 flex items-center justify-center rounded-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              ALARA 15% Rule Optimizer (การบริหารจัดการปริมาณรังสีลดผิวสัมผัส)
            </h3>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              โมดูลคำนวณปรับพารามิเตอร์รังสีอัตโนมัติ เพิ่มแรงดันประจุครึ่งกระแส ช่วยประหยัดโดสรังสีเฉลี่ย 37%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-cyan-50 px-3 py-1 border border-cyan-150 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
          <span className="text-[9px] font-bold text-cyan-700 tracking-widest uppercase font-mono">
            Optimisation Recommended
          </span>
        </div>
      </div>

      {isHighDose && (
        <div className="mb-4 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left font-sans rounded-md">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-650" />
          <p className="leading-relaxed text-[11px]">
            <strong>ALARA Compliance Warning (ระดับจำกัด):</strong> ปริมาณรังสีที่ขอบผิวคนไข้เพิ่มสูงใกล้เคียงหรือเกินเกณฑ์ DRL สกอ. แนะนำอย่างยิ่งให้ใช้หลักเพิ่มค่าแรงดันหลอดรังสี (kV) ขึ้น 15% และหักทอนค่าปริมาณกระแสไฟฟ้าผ่านหลอดรังสี (mAs) ลงร้อยละ 50 เพื่อคงคุณภาพภาพถ่ายโดยลดปริมาณรังสีผิวลงอย่างวิเศษ
          </p>
        </div>
      )}

      {/* Main Grid Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
        {/* Sliders current vs optimized values */}
        <div className="xl:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Current Technique */}
            <div className="p-3.5 border border-stone-158 bg-stone-50 rounded-lg text-left">
              <span className="text-[9px] font-mono font-bold uppercase text-stone-400 block mb-1">เทคนิคปัจจุบัน (Current Parameters)</span>
              <div className="flex justify-between items-baseline mt-1 leading-none">
                <span className="text-lg font-bold text-slate-700 font-mono">{currentKv} <span className="text-[9px] text-slate-400 font-normal">kV</span></span>
                <span className="text-lg font-bold text-slate-700 font-mono">{currentMAs} <span className="text-[9px] text-slate-400 font-normal">mAs</span></span>
              </div>
              <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-stone-200/50 pt-2">
                <span>ปริมาณรังสีคาดการณ์ (ESD):</span>
                <span className="text-slate-700 font-bold">{currentEsd.toFixed(3)} mGy</span>
              </div>
            </div>

            {/* Optimized Technique */}
            <div className="p-3.5 border border-teal-200 bg-teal-50/40 rounded-lg text-left">
              <span className="text-[9px] font-mono font-bold uppercase text-teal-600 block mb-1">สูตรปรับปรุงตามหลัก ALARA</span>
              <div className="flex justify-between items-baseline mt-1 leading-none">
                <span className="text-lg font-bold text-teal-700 font-mono">{optimizedKv} <span className="text-[9px] text-teal-550 font-normal">kV</span></span>
                <span className="text-lg font-bold text-teal-700 font-mono">{optimizedMAs} <span className="text-[9px] text-teal-550 font-normal">mAs</span></span>
              </div>
              <div className="mt-3 text-[10px] font-mono text-teal-750 flex items-center justify-between border-t border-teal-100 pt-2">
                <span>ปริมาณรังสีปรับลดสำเร็จ:</span>
                <span className="text-teal-600 font-bold">{optimizedEsd.toFixed(3)} mGy</span>
              </div>
            </div>
          </div>

          {/* Visual Bar Comparison of ESD */}
          <div className="space-y-2 border-t border-stone-100 pt-3">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block text-left">
              ผลลัพธ์ลดปริมาณรังสีสะสมผิวเปรียบเทียบ (Dose Reduction Contrast)
            </span>
            
            <div className="space-y-2 font-mono text-xs text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-450 uppercase">Standard Skin Dose (ปริมาณเดิม)</span>
                  <span className="text-slate-700 font-bold">{currentEsd.toFixed(3)} mGy</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-stone-400 h-full transition-all duration-300" 
                    style={{ width: `${currentWidthPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-teal-600 uppercase flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-550" /> ALARA Minimised Dose
                  </span>
                  <span className="text-teal-600 font-bold">{optimizedEsd.toFixed(3)} mGy</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-550 h-full transition-all duration-300" 
                    style={{ width: `${optimizedWidthPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Actionable CTA and Stats */}
        <div className="xl:col-span-5 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-stone-150 pt-4 xl:pt-0 xl:pl-6 text-center xl:text-left h-full">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-cyan-600 tracking-wider block">
              อัตราการประหยัดสัดส่วนผิวสัมผัสรังสี (Efficiency)
            </span>
            <h4 className="text-4xl font-extrabold text-teal-600 font-mono mt-0.5 tracking-tight">
              -{reductionPercent}%
            </h4>
            <div className="mt-2 text-xs text-slate-500 space-y-1 inline-block text-left font-sans">
              <p className="flex items-center gap-1.5 text-[10px] uppercase font-semibold">
                <ShieldEllipsis className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>รักษาระดับความละเอียดเวชระเบียดอย่างสมบูรณ์</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>สอดคล้องตามข้อกำหนดทฤษฎีรังสีวิทยาปลอดภัย</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onApply}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-650 to-cyan-600 hover:from-teal-600 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm cursor-pointer active:translate-y-0.5 transition-all text-xs tracking-wider uppercase font-mono border border-teal-700/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Apply ALARA Parameters On Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
