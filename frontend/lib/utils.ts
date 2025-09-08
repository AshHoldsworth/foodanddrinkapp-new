export function getCostLabel(cost: number): string {
  switch (cost) {
    case 1:
      return '£';
    case 2:
      return '££';
    case 3:
      return '£££';
    default:
      return '?';
  }
}

export function getCostRating(cost: number): string {
  return getCostLabel(cost);
}

// Updated: difficulty now 1-3 only
export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    default:
      return 'Unknown';
  }
}

// Updated: speed now 1-3 (Quick, Medium, Slow) with legacy mapping support
export function getSpeedLabel(speed: number): string {
  switch (speed) {
    case 1:
      return 'Quick';
    case 2:
      return 'Medium';
    case 3:
      return 'Slow';
    default:
      // Legacy values 1-10 -> bucket
      if (speed <= 3) return 'Quick';
      if (speed <= 7) return 'Medium';
      return 'Slow';
  }
}
