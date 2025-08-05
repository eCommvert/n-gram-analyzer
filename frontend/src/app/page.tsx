'use client'

import { useState } from 'react'
import { FileSpreadsheet, ArrowRight, Sparkles, TrendingUp, AlertTriangle, Settings } from 'lucide-react'
import Link from 'next/link'
import { sheetsAPI } from '@/lib/api'
import ConfigurationModal from '@/components/ConfigurationModal'

export default function Home() {
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfig, setShowConfig] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate Google Sheets URL
      const validation = await sheetsAPI.validateSpreadsheet(sheetsUrl)
      
      if (!validation.isValid) {
        throw new Error('Invalid spreadsheet structure. Please ensure it contains the required sheets.')
      }

      // Extract spreadsheet ID from URL
      const spreadsheetId = validation.spreadsheetId
      
      // Redirect to analysis page
      window.location.href = `/analysis?id=${spreadsheetId}`
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process Google Sheets URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-obsidian-violet to-deep-purple">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-cyan-blue bg-clip-text text-transparent">
                N-Gram Analyzer
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                How it Works
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-neon-purple to-cyan-blue bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-white">Search Term Analysis</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Transform your Google Ads performance with intelligent n-gram analysis. 
              Identify wasted spend, discover expansion opportunities, and optimize your ROAS.
            </p>

            {/* Google Sheets Input Form */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    placeholder="Paste your Google Sheets URL here..."
                    className="w-full pl-10 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                
                {error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !sheetsUrl}
                  className="w-full bg-gradient-to-r from-neon-purple to-cyan-blue hover:from-neon-purple/90 hover:to-cyan-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Analysis</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-sm text-gray-400 mt-4">
                Your data is processed securely and never stored on our servers.
              </p>
            </div>

            {/* Configuration Section */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-neon-purple" />
                    <h3 className="text-lg font-semibold text-white">Analysis Configuration</h3>
                  </div>
                  <button
                    onClick={() => setShowConfig(true)}
                    className="bg-neon-purple hover:bg-neon-purple/90 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Configure
                  </button>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Customize your analysis thresholds for negative keywords and expansion opportunities.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                                     <div className="bg-white/5 rounded-lg p-3">
                     <h4 className="font-medium text-white mb-2">Negative Keywords</h4>
                     <div className="space-y-1 text-gray-300">
                       <div>Max ROAS: 1.0</div>
                       <div>Min Cost: $10</div>
                       <div>Max CTR: 2%</div>
                       <div>Max Conversions: 0</div>
                     </div>
                   </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2">Expansion Opportunities</h4>
                    <div className="space-y-1 text-gray-300">
                      <div>Min ROAS: 3.0</div>
                      <div>Min Conversions: 1</div>
                      <div>Min CTR: 5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for PPC Optimization
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to analyze your search terms and optimize your campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-neon-purple/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">N-Gram Analysis</h3>
              <p className="text-gray-300">
                Extract 1-word, 2-word, and 3-word combinations from your search terms to identify patterns and opportunities.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-neon-purple/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Clustering</h3>
              <p className="text-gray-300">
                Group similar terms into themes using advanced AI to understand your search landscape better.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-neon-purple/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Negative Keywords</h3>
              <p className="text-gray-300">
                Automatically identify negative keyword candidates to reduce wasted spend and improve ROAS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple 3-step process to optimize your Google Ads campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Your Data</h3>
              <p className="text-gray-300">
                Run our Google Ads script to collect search terms and keyword data, then paste the Google Sheets URL.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Analysis</h3>
              <p className="text-gray-300">
                Our AI processes your data to extract n-grams, identify patterns, and generate insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Take Action</h3>
              <p className="text-gray-300">
                Export negative keywords, discover expansion opportunities, and optimize your campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">N-Gram Analyzer</span>
            </div>
            <p className="text-gray-400 mb-4">
              Powered by eCommvert - Advanced PPC Analytics
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={(config) => {
          console.log('Configuration saved:', config)
        }}
      />
    </div>
  )
}
