import { useGameStore } from '../stores/gameStore'
import './SettingsPanel.css'

interface SettingsPanelProps {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetGame } = useGameStore()

  const handleApply = () => {
    resetGame()
    onClose()
  }

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2>Settings</h2>

        <div className="setting-row">
          <label htmlFor="stickCount">Sticks</label>
          <input
            id="stickCount"
            type="range"
            min="10"
            max="50"
            value={settings.stickCount}
            onChange={(e) => updateSettings({ stickCount: Number(e.target.value) })}
          />
          <span>{settings.stickCount}</span>
        </div>

        <div className="setting-row">
          <label htmlFor="marbleCount">Marbles</label>
          <input
            id="marbleCount"
            type="range"
            min="10"
            max="50"
            value={settings.marbleCount}
            onChange={(e) => updateSettings({ marbleCount: Number(e.target.value) })}
          />
          <span>{settings.marbleCount}</span>
        </div>

        <div className="settings-buttons">
          <button className="btn" onClick={handleApply}>
            Apply & Restart
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
