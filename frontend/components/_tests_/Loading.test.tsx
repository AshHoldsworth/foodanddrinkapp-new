import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Loading from '@/components/Loading'

describe('Loading', () => {
  it('renders spinner loader', () => {
    const { container } = render(<Loading />)

    expect(container.querySelector('.loading.loading-spinner.loading-xl')).toBeTruthy()
  })

  it('renders spinner loader with label', () => {
    const { container, getByText } = render(<Loading label="Loading users..." />)

    expect(container.querySelector('.loading.loading-spinner.loading-sm')).toBeTruthy()
    expect(getByText('Loading users...')).toBeTruthy()
  })
})
