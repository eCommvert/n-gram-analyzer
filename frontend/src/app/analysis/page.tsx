'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Download,
  ArrowLeft,
  RefreshCw,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { analysisAPI, type NGramAnalysis } from '@/lib/api'
import ConfigurationModal from '@/components/ConfigurationModal'
import FilteredTableView from '@/components/FilteredTableView'

function AnalysisPageContent() {
  const searchParams = useSearchParams()
  const spreadsheetId = searchParams.get('id')
  
  const [analysis, setAnalysis] = useState<NGramAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showConfig, setShowConfig] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedNGramType, setSelectedNGramType] = useState<'unigrams' | 'bigrams' | 'trigrams'>('unigrams')
  
  // Filtered table view state
  const [showFilteredTable, setShowFilteredTable] = useState(false)
  const [filteredTableConfig, setFilteredTableConfig] = useState({
    filterType: 'term' as 'term' | 'category' | 'ngram' | 'intent',
    filterValue: '',
    title: ''
  })

  useEffect(() => {
    if (spreadsheetId) {
      loadAnalysis()
    }
  }, [spreadsheetId])

  const handleItemClick = (type: 'term' | 'category' | 'ngram' | 'intent', value: string, title: string) => {
    setFilteredTableConfig({
      filterType: type,
      filterValue: value,
      title: title
    })
    setShowFilteredTable(true)
  }

  const loadAnalysis = async () => {
    if (!spreadsheetId) return
    
    try {
      setLoading(true)
      setError('')
      
      const result = await analysisAPI.processAnalysis(spreadsheetId)
      
      // Transform ngram data from objects to arrays
      const transformedResult = {
        ...result,
        topUnigrams: result.ngramResults?.unigrams 
          ? Object.entries(result.ngramResults.unigrams)
              .map(([term, data]: [string, any]) => ({
                term,
                frequency: data.frequency,
                cost: data.cost,
                roas: data.avgRoas
              }))
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 9)
          : [],
        topBigrams: result.ngramResults?.bigrams 
          ? Object.entries(result.ngramResults.bigrams)
              .map(([term, data]: [string, any]) => ({
                term,
                frequency: data.frequency,
                cost: data.cost,
                roas: data.avgRoas
              }))
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 9)
          : [],
        topTrigrams: result.ngramResults?.trigrams 
          ? Object.entries(result.ngramResults.trigrams)
              .map(([term, data]: [string, any]) => ({
                term,
                frequency: data.frequency,
                cost: data.cost,
                roas: data.avgRoas
              }))
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 9)
          : []
      }
      
      // Fetch categories data
      try {
        const categoriesResponse = await fetch(`http://localhost:3001/api/analysis/${spreadsheetId}/categories`)
        const categoriesData = await categoriesResponse.json()
        if (categoriesData.success) {
          transformedResult.categories = categoriesData.data.categories
          transformedResult.intentAnalysis = categoriesData.data.intentAnalysis
        }
      } catch (categoriesError) {
        console.log('Categories not available yet:', categoriesError)
      }
      
      setAnalysis(transformedResult)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Processing Your Data</h2>
          <p className="text-gray-300">Analyzing search terms and generating insights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Analysis</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link href="/" className="bg-neon-purple hover:bg-neon-purple/90 text-white px-6 py-3 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Analysis Data</h2>
          <p className="text-gray-300 mb-4">Please provide a valid Google Sheets URL to analyze.</p>
          <Link href="/" className="bg-neon-purple hover:bg-neon-purple/90 text-white px-6 py-3 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Analysis Dashboard</h1>
              <p className="text-gray-400">Processed {analysis.summary?.totalSearchTerms || 0} search terms</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {reloading && (
              <div className="flex items-center space-x-2 text-neon-purple">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Reloading...</span>
              </div>
            )}
            {configSaved && (
              <div className="flex items-center space-x-2 text-green-400">
                <span className="text-sm">✓ Configuration applied</span>
              </div>
            )}
            <button
              onClick={() => setShowConfig(true)}
              disabled={reloading}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer" onClick={() => handleItemClick('term', '', 'High Cost Terms')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Cost</p>
                <p className="text-3xl font-bold text-white">${Math.round(analysis.summary?.totalCost || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Click to view breakdown</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer" onClick={() => handleItemClick('term', '', 'Converting Terms')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Conversions</p>
                <p className="text-3xl font-bold text-white">{Math.round(analysis.summary?.totalConversions || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Click to view converting terms</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer" onClick={() => handleItemClick('term', '', 'Negative Keywords')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Negative Keywords</p>
                <p className="text-3xl font-bold text-white">{analysis.summary?.negativeKeywordCandidates || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Click to view candidates</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:scale-105 transition-transform cursor-pointer" onClick={() => handleItemClick('term', '', 'Expansion Opportunities')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Expansion Opportunities</p>
                <p className="text-3xl font-bold text-white">{analysis.summary?.expansionOpportunities || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Click to view opportunities</p>
              </div>
              <div className="w-12 h-12 bg-neon-purple/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neon-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'ngrams', label: 'N-Grams', icon: TrendingUp },
                { id: 'categories', label: 'Categories', icon: Sparkles },
                { id: 'negatives', label: 'Negative Keywords', icon: AlertTriangle },
                { id: 'opportunities', label: 'Expansion Opportunities', icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1) // Reset pagination when switching tabs
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-neon-purple text-neon-purple'
                      : 'border-transparent text-gray-300 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Analysis Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">N-Gram Distribution</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Unigrams:</span>
                        <span className="text-white">{analysis.summary?.totalUnigrams || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Bigrams:</span>
                        <span className="text-white">{analysis.summary?.totalBigrams || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Trigrams:</span>
                        <span className="text-white">{analysis.summary?.totalTrigrams || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Performance Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Cost:</span>
                        <span className="text-white">${Math.round(analysis.summary?.totalCost || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Conversions:</span>
                        <span className="text-white">{Math.round(analysis.summary?.totalConversions || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Conversion Value:</span>
                        <span className="text-white">${Math.round(analysis.summary?.totalConversionValue || 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Analysis Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Negative Keywords:</span>
                        <span className="text-white">{analysis.summary?.negativeKeywordCandidates || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expansion Opportunities:</span>
                        <span className="text-white">{analysis.summary?.expansionOpportunities || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ngrams' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">N-Gram Analysis</h3>
                <p className="text-gray-300 mb-6">
                  Analysis of 1-word, 2-word, and 3-word combinations from your search terms.
                </p>
                
                {/* N-Gram Type Selector */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex space-x-4">
                    {[
                      { id: 'unigrams', label: 'Unigrams (1-word)', count: analysis.summary?.totalUnigrams },
                      { id: 'bigrams', label: 'Bigrams (2-word)', count: analysis.summary?.totalBigrams },
                      { id: 'trigrams', label: 'Trigrams (3-word)', count: analysis.summary?.totalTrigrams }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedNGramType(type.id as any)
                          setCurrentPage(1)
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedNGramType === type.id
                            ? 'bg-neon-purple text-white'
                            : 'bg-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        {type.label} ({type.count || 0})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced N-Gram Display */}
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white">
                      {selectedNGramType === 'unigrams' ? 'Unigrams' : 
                       selectedNGramType === 'bigrams' ? 'Bigrams' : 'Trigrams'} 
                      ({analysis.ngramResults?.[selectedNGramType] ? 
                        Object.keys(analysis.ngramResults[selectedNGramType]).length : 0} total)
                    </h4>
                    <div className="text-sm text-gray-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, 
                        analysis.ngramResults?.[selectedNGramType] ? 
                        Object.keys(analysis.ngramResults[selectedNGramType]).length : 0)} of {
                        analysis.ngramResults?.[selectedNGramType] ? 
                        Object.keys(analysis.ngramResults[selectedNGramType]).length : 0}
                    </div>
                  </div>

                  {/* N-Gram Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {analysis.ngramResults?.[selectedNGramType] ? 
                      Object.entries(analysis.ngramResults[selectedNGramType])
                        .sort(([,a]: [string, any], [,b]: [string, any]) => b.frequency - a.frequency)
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map(([term, data]: [string, any], index) => (
                          <div 
                            key={term} 
                            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors" 
                            onClick={() => handleItemClick('ngram', term, `${term} (${selectedNGramType})`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-white text-sm">{term}</span>
                              <span className="text-xs text-gray-400">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Frequency:</span>
                                <span className="text-white">{data.frequency}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Cost:</span>
                                <span className="text-white">${Math.round(data.cost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">ROAS:</span>
                                <span className="text-white">{data.avgRoas?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">CTR:</span>
                                <span className="text-white">{(data.avgCtr * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        )) : []
                    }
                  </div>

                  {/* Pagination */}
                  {analysis.ngramResults?.[selectedNGramType] && 
                   Object.keys(analysis.ngramResults[selectedNGramType]).length > itemsPerPage && (
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-gray-300">
                        Page {currentPage} of {Math.ceil(Object.keys(analysis.ngramResults[selectedNGramType]).length / itemsPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(Object.keys(analysis.ngramResults[selectedNGramType]).length / itemsPerPage)}
                        className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">AI Category Analysis</h3>
                <p className="text-gray-300 mb-6">
                  AI-powered categorization of your search terms into meaningful themes and topics.
                </p>
                
                {analysis.categories ? (
                  <div className="space-y-6">
                    {/* Categories Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analysis.categories.map((category, index) => (
                        <div 
                          key={index} 
                          className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => handleItemClick('category', category.name, `${category.name} Category`)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-white">{category.name}</h4>
                            <span className="text-sm text-gray-400">{category.count} terms</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Cost:</span>
                              <span className="text-white">${Math.round(category.totalCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Conversions:</span>
                              <span className="text-white">{Math.round(category.totalConversions)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg ROAS:</span>
                              <span className="text-white">{category.avgRoas.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Intent Analysis */}
                    {analysis.intentAnalysis && (
                      <div className="bg-white/5 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">Search Intent Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div 
                            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleItemClick('intent', 'informational', 'Informational Search Terms')}
                          >
                            <h5 className="font-medium text-white mb-2">Informational</h5>
                            <p className="text-2xl font-bold text-blue-400">{analysis.intentAnalysis.informational.count}</p>
                            <p className="text-xs text-gray-400">Terms seeking information</p>
                          </div>
                          <div 
                            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleItemClick('intent', 'navigational', 'Navigational Search Terms')}
                          >
                            <h5 className="font-medium text-white mb-2">Navigational</h5>
                            <p className="text-2xl font-bold text-green-400">{analysis.intentAnalysis.navigational.count}</p>
                            <p className="text-xs text-gray-400">Terms looking for specific destinations</p>
                          </div>
                          <div 
                            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleItemClick('intent', 'transactional', 'Transactional Search Terms')}
                          >
                            <h5 className="font-medium text-white mb-2">Transactional</h5>
                            <p className="text-2xl font-bold text-purple-400">{analysis.intentAnalysis.transactional.count}</p>
                            <p className="text-xs text-gray-400">Terms ready to convert</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-neon-purple mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-white mb-2">AI Clustering Coming Soon</h4>
                      <p className="text-gray-300 mb-4">
                        We&apos;re working on integrating OpenAI GPT and Google Cloud NLP to automatically categorize your search terms into meaningful themes.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="font-medium text-white mb-2">Topic Clustering</h5>
                          <p className="text-gray-400">Group similar terms into themes like &quot;Transportation&quot;, &quot;Destinations&quot;, &quot;Services&quot;</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="font-medium text-white mb-2">Intent Analysis</h5>
                          <p className="text-gray-400">Identify search intent: informational, navigational, transactional</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="font-medium text-white mb-2">Performance Insights</h5>
                          <p className="text-gray-400">Compare performance across categories and identify opportunities</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'negatives' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Negative Keyword Candidates</h3>
                <p className="text-gray-300 mb-6">
                  Terms that are costing money but not converting well.
                </p>
                
                {analysis.negativeKeywords && analysis.negativeKeywords.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        Found {analysis.negativeKeywords.length} negative keyword candidates
                      </div>
                      <div className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, analysis.negativeKeywords.length)} of {analysis.negativeKeywords.length}
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      {analysis.negativeKeywords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((keyword, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white mb-1">{keyword.term}</h4>
                              <p className="text-sm text-gray-400">High cost, low conversion rate</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
                                Negative Candidate
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Cost:</span>
                              <span className="text-white ml-2">${Math.round(keyword.cost)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Conversions:</span>
                              <span className="text-white ml-2">{Math.round(keyword.conversions)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">CTR:</span>
                              <span className="text-white ml-2">{(keyword.ctr * 100).toFixed(2)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">ROAS:</span>
                              <span className="text-white ml-2">{keyword.roas.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                      {/* Pagination for Negative Keywords */}
                      {analysis.negativeKeywords.length > itemsPerPage && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-2 text-gray-300">
                            Page {currentPage} of {Math.ceil(analysis.negativeKeywords.length / itemsPerPage)}
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(analysis.negativeKeywords.length / itemsPerPage)}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">No Negative Keywords Found</h4>
                    <p className="text-gray-300">
                      Great news! All your search terms are performing well. No negative keyword candidates identified.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Expansion Opportunities</h3>
                <p className="text-gray-300 mb-6">
                  High-performing terms that could be expanded for better results.
                </p>
                
                {analysis.expansionOpportunities && analysis.expansionOpportunities.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        Found {analysis.expansionOpportunities.length} expansion opportunities
                      </div>
                      <div className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, analysis.expansionOpportunities.length)} of {analysis.expansionOpportunities.length}
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      {analysis.expansionOpportunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((opportunity, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white mb-1">{opportunity.term}</h4>
                              <p className="text-sm text-gray-400">High ROAS, good conversion rate</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                Expansion Opportunity
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Cost:</span>
                              <span className="text-white ml-2">${Math.round(opportunity.cost)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Conversions:</span>
                              <span className="text-white ml-2">{Math.round(opportunity.conversions)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">CTR:</span>
                              <span className="text-white ml-2">{(opportunity.ctr * 100).toFixed(2)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">ROAS:</span>
                              <span className="text-white ml-2">{opportunity.roas.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                      {/* Pagination for Expansion Opportunities */}
                      {analysis.expansionOpportunities.length > itemsPerPage && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-2 text-gray-300">
                            Page {currentPage} of {Math.ceil(analysis.expansionOpportunities.length / itemsPerPage)}
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(analysis.expansionOpportunities.length / itemsPerPage)}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-8 text-center">
                    <Sparkles className="h-12 h-12 text-neon-purple mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">No Expansion Opportunities Found</h4>
                    <p className="text-gray-300">
                      No high-performing expansion opportunities identified in your current data.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="bg-neon-purple hover:bg-neon-purple/90 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Negative Keywords</span>
          </button>
          <button className="bg-cyan-blue hover:bg-cyan-blue/90 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Opportunities</span>
          </button>
        </div>
      </main>

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={async (config) => {
          console.log('Configuration saved:', config)
          setReloading(true)
          try {
            // Reload analysis with new configuration
            await loadAnalysis()
            setConfigSaved(true)
            setTimeout(() => setConfigSaved(false), 3000) // Hide after 3 seconds
          } finally {
            setReloading(false)
          }
        }}
      />

      {/* Filtered Table View */}
      <FilteredTableView
        isOpen={showFilteredTable}
        onClose={() => setShowFilteredTable(false)}
        spreadsheetId={spreadsheetId || ''}
        filterType={filteredTableConfig.filterType}
        filterValue={filteredTableConfig.filterValue}
        title={filteredTableConfig.title}
      />
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Analysis...</p>
      </div>
    </div>}>
      <AnalysisPageContent />
    </Suspense>
  )
} 