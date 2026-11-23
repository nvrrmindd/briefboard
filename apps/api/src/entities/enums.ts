export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/** Services a creative studio sells. A brief or project can include several. */
export enum Service {
  BRANDING = 'BRANDING',
  SMM = 'SMM',
  WEB = 'WEB',
  MARKETING = 'MARKETING',
  VIDEO = 'VIDEO',
}

export enum BriefStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/** Production pipeline. Order matters: it is the column order on the board. */
export enum Stage {
  STRATEGY = 'STRATEGY',
  DESIGN = 'DESIGN',
  DEVELOPMENT = 'DEVELOPMENT',
  REVIEW = 'REVIEW',
  DELIVERED = 'DELIVERED',
}

export const STAGE_ORDER: Stage[] = [
  Stage.STRATEGY,
  Stage.DESIGN,
  Stage.DEVELOPMENT,
  Stage.REVIEW,
  Stage.DELIVERED,
];
