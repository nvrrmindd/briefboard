import { Stage } from '../entities/enums';
import { canMoveStage } from './stage-rules';

describe('canMoveStage', () => {
  it('allows moving forward by exactly one column', () => {
    expect(canMoveStage(Stage.STRATEGY, Stage.DESIGN)).toBe(true);
    expect(canMoveStage(Stage.REVIEW, Stage.DELIVERED)).toBe(true);
  });

  it('blocks skipping columns forward', () => {
    expect(canMoveStage(Stage.STRATEGY, Stage.DEVELOPMENT)).toBe(false);
    expect(canMoveStage(Stage.DESIGN, Stage.DELIVERED)).toBe(false);
  });

  it('allows moving back any distance (rework)', () => {
    expect(canMoveStage(Stage.REVIEW, Stage.DESIGN)).toBe(true);
    expect(canMoveStage(Stage.DELIVERED, Stage.STRATEGY)).toBe(true);
  });

  it('rejects a move to the same column', () => {
    expect(canMoveStage(Stage.DESIGN, Stage.DESIGN)).toBe(false);
  });
});
