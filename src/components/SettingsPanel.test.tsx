import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from './SettingsPanel'
import { useGameStore } from '../stores/gameStore'

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    useGameStore.setState({
      settings: { stickCount: 30, marbleCount: 30 }
    })
  })

  it('should render settings title', () => {
    render(<SettingsPanel onClose={mockOnClose} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should display current settings values', () => {
    render(<SettingsPanel onClose={mockOnClose} />)

    expect(screen.getByLabelText('Sticks')).toHaveValue('30')
    expect(screen.getByLabelText('Marbles')).toHaveValue('30')
  })

  it('should call onClose when Cancel is clicked', () => {
    render(<SettingsPanel onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should update settings and restart when Apply is clicked', () => {
    render(<SettingsPanel onClose={mockOnClose} />)

    const sticksSlider = screen.getByLabelText('Sticks')
    fireEvent.change(sticksSlider, { target: { value: '40' } })

    fireEvent.click(screen.getByText('Apply & Restart'))

    expect(mockOnClose).toHaveBeenCalled()
    expect(useGameStore.getState().settings.stickCount).toBe(40)
  })
})
