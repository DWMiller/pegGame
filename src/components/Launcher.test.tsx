import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Launcher from './Launcher'

describe('Launcher', () => {
  it('should render the title', () => {
    render(
      <BrowserRouter>
        <Launcher />
      </BrowserRouter>
    )

    expect(screen.getByText('Peg Game')).toBeInTheDocument()
  })

  it('should render the play button with correct link', () => {
    render(
      <BrowserRouter>
        <Launcher />
      </BrowserRouter>
    )

    const playButton = screen.getByText('Play Game')
    expect(playButton).toBeInTheDocument()
    expect(playButton).toHaveAttribute('href', '/game')
  })

  it('should render game description', () => {
    render(
      <BrowserRouter>
        <Launcher />
      </BrowserRouter>
    )

    expect(screen.getByText(/Remove sticks to let marbles fall/)).toBeInTheDocument()
  })
})
