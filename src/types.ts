/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExamPreset {
  id: string;
  nameTh: string;
  nameEn: string;
  defaultKv: number;
  defaultMAs: number;
  defaultSsd: number; // in cm
  drlEsd: number; // DRL Entrance Skin Dose threshold in mGy
  drlEffective: number; // DRL Effective Dose average in mSv
  organWeights: {
    lung: number;       // weighting factor or relative dose share
    thyroid: number;
    brain: number;
    gonads: number;
    boneMarrow: number;
  };
}

export type RadiographerPosition = 'RT' | 'R_ASSISTANT'; // นักรังสีเทคนิค or เจ้าพนักงานรังสีการแพทย์

export interface DoseRecord {
  id: string;
  hn: string;              // Hospital Number
  patientName: string;
  gender: 'male' | 'female' | 'other';
  thickness: number;       // Patient thickness in cm
  examType: string;        // E.g., 'Chest PA'
  kv: number;              // Tube voltage
  mAs: number;             // Tube charge
  ssd: number;             // Source-to-skin distance (cm)
  esd: number;             // Calculated Entrance Skin Dose (mGy)
  effectiveDose: number;   // Calculated Effective Dose (mSv)
  organDoses: {
    lung: number;
    thyroid: number;
    brain: number;
    gonads: number;
    boneMarrow: number;
  };
  rtName: string;          // Name of the radiographer
  position: RadiographerPosition;
  isAlaraApplied: boolean;
  timestamp: string;       // ISO String or date label
  notes?: string;
  safetyStatus: 'safe' | 'warning' | 'critical';
}

export interface AdminStats {
  totalExams: number;
  avgEsd: number;
  avgEffective: number;
  complianceRate: number; // percentage
  cumulativeCollectiveDose: number; // Person-Sv or Person-mSv
}
