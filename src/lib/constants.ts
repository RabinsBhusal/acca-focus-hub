export const SUBJECTS = ["ATX", "AAA", "SBL", "Other"] as const;
export type Subject = (typeof SUBJECTS)[number];
