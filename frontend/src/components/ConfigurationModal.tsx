'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Save, RefreshCw } from 'lucide-react'
import { analysisAPI } from '@/lib/api'

interface ConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: any) => void
}

interface Config {
  negativeKeywordThresholds: {
    maxRoas: number
    minCost: number
    maxCtr: number
    maxConversions: number
  }
  expansionThresholds: {
    minRoas: number
    minConversions: number
    minCtr: number
  }
  stopWords: string[]
}

export default function ConfigurationModal({ isOpen, onClose, onSave }: ConfigurationModalProps) {
  const [config, setConfig] = useState<Config>({
    negativeKeywordThresholds: {
      maxRoas: 1.0,
      minCost: 10,
      maxCtr: 0.02,
      maxConversions: 0
    },
    expansionThresholds: {
      minRoas: 3.0,
      minConversions: 1,
      minCtr: 0.05
    },
    stopWords: [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs',
      'get', 'got', 'getting', 'go', 'goes', 'going', 'gone', 'went',
      'airport', 'hotel', 'hotels', 'booking', 'book', 'reservation', 'reserve',
      'travel', 'trip', 'vacation', 'holiday', 'tour', 'tours', 'guide', 'guides'
    ]
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await analysisAPI.getConfig()
      setConfig(data)
    } catch (error) {
      console.error('Failed to load configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await analysisAPI.updateConfig({
        negativeKeywordThresholds: config.negativeKeywordThresholds,
        expansionThresholds: config.expansionThresholds,
        stopWords: config.stopWords
      })
      onSave(config)
      onClose()
    } catch (error) {
      console.error('Failed to save configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current: any = newConfig
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newConfig
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-neon-purple" />
              <h2 className="text-2xl font-bold text-white">Configuration Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-neon-purple animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Negative Keywords Configuration */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Negative Keywords Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum ROAS
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={config.negativeKeywordThresholds.maxRoas}
                      onChange={(e) => updateConfig('negativeKeywordThresholds.maxRoas', parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Keywords with ROAS below this value are candidates</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Cost ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={config.negativeKeywordThresholds.minCost}
                      onChange={(e) => updateConfig('negativeKeywordThresholds.minCost', parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum cost to consider for negative keywords</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum CTR (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={config.negativeKeywordThresholds.maxCtr * 100}
                      onChange={(e) => updateConfig('negativeKeywordThresholds.maxCtr', parseFloat(e.target.value) / 100)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum CTR for negative candidates</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Conversions
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={config.negativeKeywordThresholds.maxConversions}
                      onChange={(e) => updateConfig('negativeKeywordThresholds.maxConversions', parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum conversions allowed (0 = no conversions)</p>
                  </div>
                </div>
              </div>

              {/* Expansion Opportunities Configuration */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Expansion Opportunities Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum ROAS
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={config.expansionThresholds.minRoas}
                      onChange={(e) => updateConfig('expansionThresholds.minRoas', parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Keywords with ROAS above this value are opportunities</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Conversions
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={config.expansionThresholds.minConversions}
                      onChange={(e) => updateConfig('expansionThresholds.minConversions', parseFloat(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum conversions required</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum CTR (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={config.expansionThresholds.minCtr * 100}
                      onChange={(e) => updateConfig('expansionThresholds.minCtr', parseFloat(e.target.value) / 100)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum CTR for opportunities</p>
                  </div>
                </div>
              </div>

              {/* Stop Words Configuration */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Stop Words</h3>
                <p className="text-gray-300 mb-4">Words to filter out from n-gram analysis</p>
                
                {/* Add new stop word */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add new stop word..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newWord = e.currentTarget.value.trim().toLowerCase()
                        if (!config.stopWords.includes(newWord)) {
                          updateConfig('stopWords', [...config.stopWords, newWord])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      const newWord = input.value.trim().toLowerCase()
                      if (newWord && !config.stopWords.includes(newWord)) {
                        updateConfig('stopWords', [...config.stopWords, newWord])
                        input.value = ''
                      }
                    }}
                    className="bg-neon-purple hover:bg-neon-purple/90 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>

                {/* Display stop words with remove option */}
                <div className="bg-white/5 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {config.stopWords.map((word, index) => (
                      <span
                        key={index}
                        className="bg-neon-purple/20 text-neon-purple px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        {word}
                        <button
                          onClick={() => {
                            const newStopWords = config.stopWords.filter((_, i) => i !== index)
                            updateConfig('stopWords', newStopWords)
                          }}
                          className="text-neon-purple hover:text-red-400 text-xs ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Stop words are automatically filtered out to improve analysis quality. Click × to remove.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-neon-purple hover:bg-neon-purple/90 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 