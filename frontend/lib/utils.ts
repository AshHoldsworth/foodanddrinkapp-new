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

export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Very Easy';
    case 2:
      return 'Easy';
    case 3:
      return 'Easy-Medium';
    case 4:
    case 5:
      return 'Medium';
    case 6:
      return 'Medium-Hard';
    case 7:
    case 8:
      return 'Hard';
    case 9:
      return 'Very Hard';
    case 10:
      return 'Expert';
    default:
      return 'Unknown';
  }
}

export function getSpeedLabel(speed: number): string {
  switch (speed) {
    case 1:
      return 'Very Slow';
    case 2:
      return 'Slow';
    case 3:
      return 'Slow-Medium';
    case 4:
    case 5:
      return 'Medium';
    case 6:
      return 'Medium-Fast';
    case 7:
    case 8:
      return 'Fast';
    case 9:
      return 'Very Fast';
    case 10:
      return 'Lightning';
    default:
      return 'Unknown';
  }
}
