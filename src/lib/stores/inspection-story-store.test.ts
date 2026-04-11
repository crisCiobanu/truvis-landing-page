import { describe, it, expect, beforeEach } from 'vitest';
import {
  $currentScene,
  setCurrentScene,
  resetInspectionStory,
} from './inspection-story-store';

describe('inspection-story-store', () => {
  beforeEach(() => {
    // Reset the atom between tests. This is the ONLY place where we
    // touch `.set()` directly — consumers outside the store module
    // must use the action functions (decision 4c).
    $currentScene.set(0);
  });

  it('defaults to scene index 0', () => {
    expect($currentScene.get()).toBe(0);
  });

  it('setCurrentScene(3) updates the atom to 3', () => {
    setCurrentScene(3);
    expect($currentScene.get()).toBe(3);
  });

  it('resetInspectionStory() returns the atom to 0', () => {
    setCurrentScene(4);
    resetInspectionStory();
    expect($currentScene.get()).toBe(0);
  });
});
