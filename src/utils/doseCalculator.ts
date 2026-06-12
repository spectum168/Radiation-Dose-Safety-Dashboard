/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExamPreset, DoseRecord } from '../types';

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'chest_pa',
    nameTh: 'เอกซเรย์ปอด (Chest PA)',
    nameEn: 'Chest PA',
    defaultKv: 80,
    defaultMAs: 5,
    defaultSsd: 180, // mAs is low, distance is far (180 cm) to reduce magnification
    drlEsd: 0.35, // mGy
    drlEffective: 0.05, // mSv
    organWeights: {
      lung: 0.80,
      thyroid: 0.15,
      brain: 0.01,
      gonads: 0.005,
      boneMarrow: 0.25,
    }
  },
  {
    id: 'abdomen_ap',
    nameTh: 'เอกซเรย์ช่องท้อง (Abdomen AP)',
    nameEn: 'Abdomen AP',
    defaultKv: 75,
    defaultMAs: 20.0,
    defaultSsd: 100,
    drlEsd: 5.0, // mGy
    drlEffective: 0.70, // mSv
    organWeights: {
      lung: 0.10,
      thyroid: 0.01,
      brain: 0.01,
      gonads: 0.40,
      boneMarrow: 0.35,
    }
  },
  {
    id: 'lumbar_ap',
    nameTh: 'เอกซเรย์กระดูกสันหลังส่วนเอว (Lumbar Spine AP)',
    nameEn: 'Lumbar Spine AP',
    defaultKv: 80,
    defaultMAs: 25.0,
    defaultSsd: 100,
    drlEsd: 6.0, // mGy
    drlEffective: 1.20, // mSv
    organWeights: {
      lung: 0.12,
      thyroid: 0.02,
      brain: 0.01,
      gonads: 0.35,
      boneMarrow: 0.45,
    }
  },
  {
    id: 'skull_ap',
    nameTh: 'เอกซเรย์กะโหลกศีรษะ (Skull AP)',
    nameEn: 'Skull AP',
    defaultKv: 75,
    defaultMAs: 16.0,
    defaultSsd: 100,
    drlEsd: 3.0, // mGy
    drlEffective: 0.15, // mSv
    organWeights: {
      lung: 0.01,
      thyroid: 0.12,
      brain: 0.85,
      gonads: 0.001,
      boneMarrow: 0.15,
    }
  },
  {
    id: 'pelvis_ap',
    nameTh: 'เอกซเรย์กระดูกอุ้งเชิงกราน (Pelvis AP)',
    nameEn: 'Pelvis AP',
    defaultKv: 75,
    defaultMAs: 20.0,
    defaultSsd: 100,
    drlEsd: 4.5, // mGy
    drlEffective: 0.85, // mSv
    organWeights: {
      lung: 0.02,
      thyroid: 0.01,
      brain: 0.001,
      gonads: 0.85,
      boneMarrow: 0.40,
    }
  },
  {
    id: 'extremity',
    nameTh: 'เอกซเรย์ระยางค์ / แขนขา (Extremity)',
    nameEn: 'Extremity',
    defaultKv: 55,
    defaultMAs: 4.0,
    defaultSsd: 100,
    drlEsd: 0.50, // mGy
    drlEffective: 0.01, // mSv
    organWeights: {
      lung: 0.001,
      thyroid: 0.001,
      brain: 0.0,
      gonads: 0.005,
      boneMarrow: 0.05,
    }
  }
];

/**
 * Calculates ESD (Entrance Skin Dose) in mGy
 * Formula: ESD = OutputFactor * (kV / 80)^2 * mAs * (100 / SSD)^2 * BSF
 * Output factor at 80kV @ 100cm is ~0.08 mGy/mAs for general tube systems.
 * BSF is standard backscatter factor (~1.35).
 * We also calibrate based on anatomical region characteristics and patient thickness.
 */
export function calculateEsd(
  kv: number,
  mas: number,
  ssd: number,
  thickness: number,
  presetId: string
): number {
  if (ssd <= 0) return 0;
  
  // Baseline output factor (mGy per mAs at 100 cm and 80 kV)
  const baseOutput = 0.082; 
  const bsf = 1.35; // Backscatter factor
  
  // Standard dosimetry formula
  let estimatedEsd = baseOutput * Math.pow(kv / 80, 2.1) * mas * Math.pow(100 / ssd, 2) * bsf;
  
  // Patient thickness factor: thicker patients scatter and absorb differently, but ESD is the entrance skin dose.
  // Thicker body part means the entrance skin is closer to the tube, reducing SSD.
  // If SSD already accounts for custom distance, thickness changes backscatter slightly. We can scale by (thickness / baselineThickness).
  const baselineThicknesses: Record<string, number> = {
    chest_pa: 22,
    abdomen_ap: 22,
    lumbar_ap: 22,
    skull_ap: 18,
    pelvis_ap: 22,
    extremity: 10,
  };
  
  const baseThickness = baselineThicknesses[presetId] || 20;
  const thicknessRatio = thickness / baseThickness;
  
  // Apply a subtle correction factor for backscatter variation depending on thickness
  // thicker patient -> slightly greater backscatter factor
  const thicknessCorrection = 1.0 + (thicknessRatio - 1.0) * 0.15;
  
  estimatedEsd *= thicknessCorrection;
  
  return parseFloat(Math.max(0.005, estimatedEsd).toFixed(4));
}

/**
 * Calculates Effective Dose in mSv from ESD
 * Effective Dose = ESD * f_effective * thicknessCorrection
 */
export function calculateEffectiveDose(
  esd: number,
  presetId: string,
  thickness: number
): number {
  // Conversion factors f_eff (mSv per mGy of skin dose) based on anatomical scans
  const effectiveConversion: Record<string, number> = {
    chest_pa: 0.15,     // highly weighted organs in thorax
    abdomen_ap: 0.13,   // lower abdomen organs have high aggregate risk
    lumbar_ap: 0.20,    // lumbar bone marrow and gonads
    skull_ap: 0.04,     // brain is highly sensitive but skull absorbs a lot, lower tissue weight factors
    pelvis_ap: 0.18,    // very high gonadal and marrow weighting
    extremity: 0.005,   // minimal active radiosensitive organs
  };
  
  const factor = effectiveConversion[presetId] || 0.10;
  let effDose = esd * factor;

  // Patient thickness attenuates internal organ doses, but higher thickness means larger irradiated volume.
  // A simple scale works beautifully:
  effDose *= (thickness / 20) * 0.8 + 0.2;

  return parseFloat(Math.max(0.001, effDose).toFixed(4));
}

/**
 * Calculates individual organ absorbed doses based on skin dose and geometry attenuation.
 * Organs closer or in direct beam receive more, deeper organs receive attenuated dose.
 */
export function calculateOrganDoses(
  esd: number,
  preset: ExamPreset,
  thickness: number
) {
  // A simple depth-penetration model:
  // kVp controls depth penetration. Lower kVp has rapid attenuation, higher kVp penetrates better.
  const organDoses = {
    lung: 0,
    thyroid: 0,
    brain: 0,
    gonads: 0,
    boneMarrow: 0,
  };

  const w = preset.organWeights;
  
  // Attenuation coefficient model
  // average thickness reduction factor
  const attFactor = Math.exp(-0.12 * (thickness / 2.5)); // ~3-8% transmission standard

  organDoses.lung = parseFloat((esd * w.lung * (preset.id === 'chest_pa' ? 0.35 : attFactor)).toFixed(4));
  organDoses.thyroid = parseFloat((esd * w.thyroid * (['chest_pa', 'skull_ap'].includes(preset.id) ? 0.45 : attFactor * 0.1)).toFixed(4));
  organDoses.brain = parseFloat((esd * w.brain * (preset.id === 'skull_ap' ? 0.55 : 0.001)).toFixed(4));
  organDoses.gonads = parseFloat((esd * w.gonads * (['pelvis_ap', 'abdomen_ap', 'lumbar_ap'].includes(preset.id) ? 0.40 : attFactor * 0.02)).toFixed(4));
  organDoses.boneMarrow = parseFloat((esd * w.boneMarrow * 0.22).toFixed(4));

  return organDoses;
}

/**
 * Evaluates the safety status of a computed ESD dose against standard Diagnostic Reference Levels (DRLs)
 */
export function evaluateSafetyStatus(
  esd: number,
  drl: number
): 'safe' | 'warning' | 'critical' {
  if (esd <= drl * 0.85) {
    return 'safe';
  } else if (esd <= drl * 1.2) {
    return 'warning';
  } else {
    return 'critical';
  }
}

/**
 * ALARA 15% Optimisation Rules
 * If we increase kVp by 15%, we can reduce mAs by 50%.
 * This keeps the optical density / image quality nearly identical, but reduces patient skin entry dose by ~35-40%.
 */
export function optimizeAlara(kv: number, mas: number) {
  const optimizedKv = Math.round(kv * 1.15);
  const optimizedMAs = parseFloat((mas * 0.50).toFixed(2));
  
  return {
    kv: Math.min(150, Math.max(40, optimizedKv)),
    mas: Math.max(0.1, optimizedMAs),
    doseReductionPercent: 37 // approx dose reduction 35%-40%
  };
}
