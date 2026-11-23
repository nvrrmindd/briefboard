import { STAGE_ORDER, Stage } from '../entities/enums';

/**
 * Board rule: a project may move FORWARD only one column at a time
 * (no jumping from Strategy straight to Delivered without review),
 * but may move BACK any number of columns (e.g. client asked for rework).
 * Pure function -> easy to unit-test without a database.
 */
export function canMoveStage(from: Stage, to: Stage): boolean {
  const a = STAGE_ORDER.indexOf(from);
  const b = STAGE_ORDER.indexOf(to);
  if (a === b) return false;
  return b < a || b === a + 1;
}
