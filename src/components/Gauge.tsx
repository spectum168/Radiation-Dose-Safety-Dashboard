/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, ShieldX, BarChart3, TrendingUp, Zap } from 'lucide-react';

interface DoseMetricsCardProps {
  esdValue: number;
  esdThreshold: number;
  effectiveValue: number;
  effectiveThreshold: number;
  safetyStatus: 'safe' | 'warning' | 'critical';
}

export default function DoseMetricsCard({
  esdValue,
  esdThreshold,
  effectiveValue,
  effectiveThreshold,
  safetyStatus
}: DoseMetricsCardProps) {
  // Safe limits ratios
  const esdRatio = esdThreshold > 0 ? (esdValue / esdThreshold) : 0;
  const effectiveRatio = effectiveThreshold > 0 ? (effectiveValue / effectiveThreshold) : 0;

  const esdPercentOfLimit = Math.min(100, Math.round(esdRatio * 100));
  const effectivePercentOfLimit = Math.min(100, Math.round(effectiveRatio * 100));

  // Gauge calculation
  const safeMaxEsd = Math.max(esdThreshold * 1.5, esdValue * 1.2, 0.1);
  const esdGaugePercentage = Math.min(100, (esdValue / safeMaxEsd) * 100);

  const safeMaxEffective = Math.max(effectiveThreshold * 1.5, effectiveValue * 1.2, 0.01);
  const effectiveGaugePercentage = Math.min(100, (effectiveValue / safeMaxEffective) * 100);

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  
  const esdStrokeDashoffset = circumference - (esdGaugePercentage / 100) * circumference;
  const effectiveStrokeDashoffset = circumference - (effectiveGaugePercentage / 100) * circumference;

  // Status mapping
  const statuses = {
    safe: {
      text: 'text-cyan-600',
      fill: 'stroke-cyan-500',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-150',
      label: 'ระดับรังสีปลอดภัย (Verified Safe)',
      icon: ShieldCheck
    },
    warning: {
      text: 'text-amber-600',
      fill: 'stroke-amber-400',
      badge: 'bg-amber-50 text-amber-800 border-amber-150',
      label: 'ช่วงเฝ้าระวัง (DRL Clearance Warning)',
      icon: ShieldAlert
    },
    critical: {
      text: 'text-rose-600',
      fill: 'stroke-rose-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-150',
      label: 'รังสีเกิดพิกัดมาตรฐาน (Critical Alert)',
      icon: ShieldX
    }
  };

  const activeStatus = statuses[safetyStatus] || statuses.safe;
  const StatusIcon = activeStatus.icon;

  return (
    <div className="border border-stone-200 bg-white p-5 shadow-sm relative rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      {/* Decorative corners representing laboratory calibration edges */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/40" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/40" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/40" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/40" />

      <div>
        {/* Header Display */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-left">
          <div className="flex items-center gap-2 pl-2 border-l-2 border-cyan-600">
            <BarChart3 className="w-4.5 h-4.5 text-cyan-600" />
            <h4 className="text-xs font-bold text-slate-800 tracking-wide font-sans mb-0">
              Dose Assessment Metrics (การประมาณปริมาณรังสีผิวและโดสวิเคราะห์สะสม)
            </h4>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
            Compact Gauges
          </span>
        </div>

        {/* Dual Gauges Layout Row */}
        <div className="grid grid-cols-2 gap-4 items-center">
          
          {/* A. ESD GAUGE */}
          <div className="flex flex-col items-center bg-stone-50/50 p-3 rounded-lg border border-slate-100 relative">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Entrance Skin Dose (ESD)
            </span>
            <span className="text-[8px] text-slate-400 font-sans block mb-2 leading-tight">
              ปริมาณรังสีก่อนผ่านเข้าผิวหนัง
            </span>

            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius + 3}
                  className="stroke-slate-200/50"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  fill="transparent"
                />
                {/* Threshold indicator */}
                {esdThreshold < safeMaxEsd && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-amber-400/70"
                    strokeWidth="4.5"
                    strokeDasharray={`1.5, ${circumference}`}
                    strokeDashoffset={circumference - ((esdThreshold / safeMaxEsd) * circumference)}
                    fill="transparent"
                  />
                )}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={`${activeStatus.fill} transition-all duration-300`}
                  strokeWidth="6.5"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: esdStrokeDashoffset }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  fill="transparent"
                />
              </svg>

              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-xl font-mono font-bold text-slate-800 leading-none">
                  {esdValue < 0.1 ? esdValue.toFixed(4) : esdValue.toFixed(3)}
                </span>
                <span className="text-[8px] font-mono text-cyan-600 font-bold uppercase mt-0.5">
                  mGy
                </span>
              </div>
            </div>

            <div className="w-full mt-2 text-[9px] font-mono text-slate-400 flex justify-between px-1">
              <span>Standard (DRL):</span>
              <span className="text-slate-650 font-bold">{esdThreshold.toFixed(2)} mGy</span>
            </div>
          </div>

          {/* B. Effective Dose GAUGE */}
          <div className="flex flex-col items-center bg-stone-50/50 p-3 rounded-lg border border-slate-100 relative">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Effective Dose Score
            </span>
            <span className="text-[8px] text-slate-400 font-sans block mb-2 leading-tight">
              ผลบวกวิเคราะห์เนื้อเยื่อรวมคนไข้
            </span>

            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius + 3}
                  className="stroke-slate-200/50"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  fill="transparent"
                />
                {/* Threshold indicator */}
                {effectiveThreshold < safeMaxEffective && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-amber-400/70"
                    strokeWidth="4.5"
                    strokeDasharray={`1.5, ${circumference}`}
                    strokeDashoffset={circumference - ((effectiveThreshold / safeMaxEffective) * circumference)}
                    fill="transparent"
                  />
                )}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={`${activeStatus.fill} transition-all duration-300`}
                  strokeWidth="6.5"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: effectiveStrokeDashoffset }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  fill="transparent"
                />
              </svg>

              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="text-xl font-mono font-bold text-slate-800 leading-none">
                  {effectiveValue < 0.1 ? effectiveValue.toFixed(4) : effectiveValue.toFixed(3)}
                </span>
                <span className="text-[8px] font-mono text-cyan-600 font-bold uppercase mt-0.5">
                  mSv
                </span>
              </div>
            </div>

            <div className="w-full mt-2 text-[9px] font-mono text-slate-400 flex justify-between px-1">
              <span>Standard (DRL):</span>
              <span className="text-slate-650 font-bold">{effectiveThreshold.toFixed(3)} mSv</span>
            </div>
          </div>

        </div>

        {/* C. INTEGRATED CONTRAST REFERENTIAL CHART (รวมกราฟได้ยิ่งดี ! ) */}
        <div className="border-t border-slate-100 mt-5 pt-3 text-left">
          <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>เทียบช่วงสัดส่วนเพดานปลอดภัยของเกณฑ์ (Proportionate Exposure Limits Rate)</span>
          </span>

          <div className="space-y-2 font-mono text-xs">
            {/* ESD Ratio bar */}
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                <span>ผิวสัมผัสรังสี (ESD Status rate)</span>
                <span className={esdPercentOfLimit > 100 ? 'text-rose-600' : 'text-slate-750'}>
                  {esdPercentOfLimit}% of DRL Limit
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    esdPercentOfLimit > 100 
                      ? 'bg-rose-500' 
                      : esdPercentOfLimit > 80 
                        ? 'bg-amber-400' 
                        : 'bg-cyan-600'
                  }`}
                  style={{ width: `${esdPercentOfLimit}%` }}
                />
              </div>
            </div>

            {/* Effective Dose ratio bar */}
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                <span>ปริมาณโดสประสิทธิผลรวม (Effective Dose Status rate)</span>
                <span className={effectivePercentOfLimit > 100 ? 'text-rose-600' : 'text-slate-750'}>
                  {effectivePercentOfLimit}% of DRL Limit
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    effectivePercentOfLimit > 100 
                      ? 'bg-rose-500' 
                      : effectivePercentOfLimit > 80 
                        ? 'bg-amber-400' 
                        : 'bg-cyan-600'
                  }`}
                  style={{ width: `${effectivePercentOfLimit}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Safety badge summary bar */}
      <div className={`mt-5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider ${activeStatus.badge}`}>
        <StatusIcon className="w-4 h-4 shrink-0" />
        <span>{activeStatus.label}</span>
      </div>
    </div>
  );
}
