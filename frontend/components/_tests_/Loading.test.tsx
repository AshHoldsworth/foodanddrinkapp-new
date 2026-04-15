import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Loading from '@/components/Loading'

describe('Loading', () => {
  it('renders skeleton placeholders', () => {
    const { container } = render(<Loading />)

    expect(container.querySelectorAll('.skeleton')).toHaveLength(4)
  })
})
