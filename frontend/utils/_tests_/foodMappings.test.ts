import { describe, expect, it } from 'vitest'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/foodMappings'

describe('food mappings', () => {
  it('maps difficulty values to readable labels', () => {
    expect(difficultyMapping[1]).toBe('Easy')
    expect(difficultyMapping[2]).toBe('Medium')
    expect(difficultyMapping[3]).toBe('Hard')
  })

  it('maps speed values to readable labels', () => {
    expect(speedMapping[1]).toBe('Slow')
    expect(speedMapping[2]).toBe('Average')
    expect(speedMapping[3]).toBe('Fast')
  })

  it('maps cost values to readable labels', () => {
    expect(costMapping[1]).toBe('Cheap')
    expect(costMapping[2]).toBe('Moderate')
    expect(costMapping[3]).toBe('Expensive')
  })
})
