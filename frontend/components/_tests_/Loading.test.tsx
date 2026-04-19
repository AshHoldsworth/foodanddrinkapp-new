import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Loading from '@/components/Loading'

describe('Loading', () => {
  it('renders spinner loader', () => {
    const { container } = render(<Loading />)

    expect(container.querySelector('.loading.loading-spinner.loading-xl')).toBeTruthy()
  })
})
