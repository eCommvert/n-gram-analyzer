'use client'

import { useState, useEffect } from 'react'
import { X, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react'
import { sheetsAPI } from '@/lib/api'

interface FilteredTableViewProps {
  isOpen: boolean
  onClose: () => void
  spreadsheetId: string
  filterType: 'term' | 'category' | 'ngram' | 'intent'
  filterValue: string
  title: string
}

interface SearchTerm {
  term: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
  ctr: number
  cpc: number
  roas: number
  conversionRate: number
}

export default function FilteredTableView({ 
  isOpen, 
  onClose, 
  spreadsheetId, 
  filterType, 
  filterValue, 
  title 
}: FilteredTableViewProps) {
  const [filteredData, setFilteredData] = useState<SearchTerm[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<keyof SearchTerm>('cost')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (isOpen && spreadsheetId && filterValue) {
      loadFilteredData()
    }
  }, [isOpen, spreadsheetId, filterValue, filterType])

  const loadFilteredData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await sheetsAPI.getSearchTermsData(spreadsheetId)
      
      if (!data || !data.rows) {
        setError('No data available')
        return
      }

      // Filter the data based on the filter type and value
      let filtered: SearchTerm[] = []
      
      switch (filterType) {
        case 'term':
          filtered = data.rows
            .filter((row: any) => row[0]?.toLowerCase().includes(filterValue.toLowerCase()))
            .map((row: any) => ({
              term: row[0] || '',
              impressions: parseFloat(row[1]) || 0,
              clicks: parseFloat(row[2]) || 0,
              cost: parseFloat(row[3]) || 0,
              conversions: parseFloat(row[4]) || 0,
              conversionValue: parseFloat(row[5]) || 0,
              ctr: parseFloat(row[6]) || 0,
              cpc: parseFloat(row[7]) || 0,
              roas: parseFloat(row[8]) || 0,
              conversionRate: parseFloat(row[9]) || 0
            }))
          break
          
        case 'ngram':
          filtered = data.rows
            .filter((row: any) => {
              const term = row[0]?.toLowerCase() || ''
              const ngramWords = filterValue.toLowerCase().split(' ')
              return ngramWords.every(word => term.includes(word))
            })
            .map((row: any) => ({
              term: row[0] || '',
              impressions: parseFloat(row[1]) || 0,
              clicks: parseFloat(row[2]) || 0,
              cost: parseFloat(row[3]) || 0,
              conversions: parseFloat(row[4]) || 0,
              conversionValue: parseFloat(row[5]) || 0,
              ctr: parseFloat(row[6]) || 0,
              cpc: parseFloat(row[7]) || 0,
              roas: parseFloat(row[8]) || 0,
              conversionRate: parseFloat(row[9]) || 0
            }))
          break
          
        case 'intent':
          const intentKeywords = getIntentKeywords(filterValue)
          filtered = data.rows
            .filter((row: any) => {
              const term = row[0]?.toLowerCase() || ''
              return intentKeywords.some(keyword => term.includes(keyword))
            })
            .map((row: any) => ({
              term: row[0] || '',
              impressions: parseFloat(row[1]) || 0,
              clicks: parseFloat(row[2]) || 0,
              cost: parseFloat(row[3]) || 0,
              conversions: parseFloat(row[4]) || 0,
              conversionValue: parseFloat(row[5]) || 0,
              ctr: parseFloat(row[6]) || 0,
              cpc: parseFloat(row[7]) || 0,
              roas: parseFloat(row[8]) || 0,
              conversionRate: parseFloat(row[9]) || 0
            }))
          break
          
        case 'category':
          const categoryKeywords = getCategoryKeywords(filterValue)
          filtered = data.rows
            .filter((row: any) => {
              const term = row[0]?.toLowerCase() || ''
              return categoryKeywords.some(keyword => term.includes(keyword))
            })
            .map((row: any) => ({
              term: row[0] || '',
              impressions: parseFloat(row[1]) || 0,
              clicks: parseFloat(row[2]) || 0,
              cost: parseFloat(row[3]) || 0,
              conversions: parseFloat(row[4]) || 0,
              conversionValue: parseFloat(row[5]) || 0,
              ctr: parseFloat(row[6]) || 0,
              cpc: parseFloat(row[7]) || 0,
              roas: parseFloat(row[8]) || 0,
              conversionRate: parseFloat(row[9]) || 0
            }))
          break
      }

      setFilteredData(filtered)
    } catch (err: any) {
      setError(err.message || 'Failed to load filtered data')
    } finally {
      setLoading(false)
    }
  }

  const getIntentKeywords = (intent: string) => {
    const keywords = {
      informational: ['how', 'what', 'where', 'when', 'why', 'best', 'top', 'guide', 'tips', 'learn'],
      navigational: ['rome', 'lisbon', 'dubrovnik', 'porto', 'split', 'florence', 'santiago', 'official', 'website'],
      transactional: ['book', 'reserve', 'booking', 'reservation', 'buy', 'purchase', 'order', 'transfer', 'service']
    }
    return keywords[intent as keyof typeof keywords] || []
  }

  const getCategoryKeywords = (category: string) => {
    const keywords = {
      'Transportation': ['transport', 'transfer', 'car', 'bus', 'train', 'airport', 'taxi', 'shuttle'],
      'Destinations': ['rome', 'lisbon', 'dubrovnik', 'porto', 'split', 'florence', 'santiago', 'city', 'tour'],
      'Services': ['service', 'booking', 'reservation', 'guide', 'tour', 'package'],
      'Booking': ['book', 'reserve', 'booking', 'reservation', 'schedule'],
      'Information': ['how', 'what', 'where', 'when', 'why', 'best', 'top', 'guide']
    }
    return keywords[category as keyof typeof keywords] || []
  }

  const handleSort = (column: keyof SearchTerm) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalMetrics = filteredData.reduce((acc, item) => ({
    impressions: acc.impressions + item.impressions,
    clicks: acc.clicks + item.clicks,
    cost: acc.cost + item.cost,
    conversions: acc.conversions + item.conversions,
    conversionValue: acc.conversionValue + item.conversionValue
  }), {
    impressions: 0,
    clicks: 0,
    cost: 0,
    conversions: 0,
    conversionValue: 0
  })

  const avgCtr = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0
  const avgCpc = totalMetrics.clicks > 0 ? totalMetrics.cost / totalMetrics.clicks : 0
  const avgRoas = totalMetrics.cost > 0 ? totalMetrics.conversionValue / totalMetrics.cost : 0
  const avgConversionRate = totalMetrics.clicks > 0 ? (totalMetrics.conversions / totalMetrics.clicks) * 100 : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple rounded-2xl border border-white/10 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <Filter className="h-6 w-6 text-neon-purple" />
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-gray-400">
                {filteredData.length} search terms found for "{filterValue}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="p-6 border-b border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{filteredData.length}</div>
              <div className="text-sm text-gray-400">Terms</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{Math.round(totalMetrics.impressions).toLocaleString()}</div>
              <div className="text-sm text-gray-400">Impressions</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{Math.round(totalMetrics.clicks).toLocaleString()}</div>
              <div className="text-sm text-gray-400">Clicks</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">${Math.round(totalMetrics.cost)}</div>
              <div className="text-sm text-gray-400">Cost</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{Math.round(totalMetrics.conversions)}</div>
              <div className="text-sm text-gray-400">Conversions</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">${Math.round(totalMetrics.conversionValue)}</div>
              <div className="text-sm text-gray-400">Revenue</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{avgCtr.toFixed(2)}%</div>
              <div className="text-sm text-gray-400">Avg CTR</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{avgRoas.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Avg ROAS</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
              <span className="ml-3 text-white">Loading filtered data...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12">
              <span className="text-red-400">{error}</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5 sticky top-0">
                <tr>
                  <th className="text-left p-4 text-white font-semibold">Search Term</th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('impressions')}>
                    Impressions {sortBy === 'impressions' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('clicks')}>
                    Clicks {sortBy === 'clicks' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('cost')}>
                    Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('conversions')}>
                    Conversions {sortBy === 'conversions' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('roas')}>
                    ROAS {sortBy === 'roas' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('ctr')}>
                    CTR {sortBy === 'ctr' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right p-4 text-white font-semibold cursor-pointer hover:bg-white/10" onClick={() => handleSort('cpc')}>
                    CPC {sortBy === 'cpc' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white font-medium">{item.term}</td>
                    <td className="p-4 text-right text-white">{Math.round(item.impressions).toLocaleString()}</td>
                    <td className="p-4 text-right text-white">{Math.round(item.clicks).toLocaleString()}</td>
                    <td className="p-4 text-right text-white">${Math.round(item.cost)}</td>
                    <td className="p-4 text-right text-white">{Math.round(item.conversions)}</td>
                    <td className="p-4 text-right text-white">
                      <span className={`font-semibold ${item.roas >= 3 ? 'text-green-400' : item.roas >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {item.roas.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right text-white">{(item.ctr * 100).toFixed(2)}%</td>
                    <td className="p-4 text-right text-white">${item.cpc.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="text-gray-400">
            Showing {filteredData.length} search terms
          </div>
          <button className="bg-neon-purple hover:bg-neon-purple/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  )
} 