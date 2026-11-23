// Mirrors the API enums (apps/api/src/entities/enums.ts).
export const SERVICES = ['BRANDING', 'SMM', 'WEB', 'MARKETING', 'VIDEO'] as const;
export type Service = (typeof SERVICES)[number];

export const STAGES = ['STRATEGY', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'DELIVERED'] as const;
export type Stage = (typeof STAGES)[number];

export type BriefStatus = 'NEW' | 'ACCEPTED' | 'REJECTED';

export const SERVICE_LABEL: Record<Service, string> = {
  BRANDING: 'Branding',
  SMM: 'SMM & content',
  WEB: 'Web & apps',
  MARKETING: 'Marketing',
  VIDEO: 'Video',
};

export const STAGE_LABEL: Record<Stage, string> = {
  STRATEGY: 'Strategy',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  REVIEW: 'Review',
  DELIVERED: 'Delivered',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface Brief {
  id: string;
  clientName: string;
  company: string | null;
  email: string;
  services: Service[];
  budget: string | null;
  deadline: string | null;
  description: string;
  status: BriefStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  services: Service[];
  stage: Stage;
  dueDate: string | null;
  owner: Pick<User, 'id' | 'name'> | null;
  updatedAt: string;
}

export interface Stats {
  byStage: Record<Stage, number>;
  newBriefs: number;
  total: number;
}

/** Same rule as the API (stage-rules.ts): forward one column at a time, back any distance. */
export function canMoveStage(from: Stage, to: Stage) {
  const a = STAGES.indexOf(from);
  const b = STAGES.indexOf(to);
  return a !== b && (b < a || b === a + 1);
}
