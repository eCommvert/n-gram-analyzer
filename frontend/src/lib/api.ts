import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://n-gram-1bsjw738v-capko-5214s-projects.vercel.app/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Types
export interface SpreadsheetValidation {
  spreadsheetId: string
  url: string
  isValid: boolean
  title: string
  availableSheets: string[]
  requiredSheets: string[]
}

export interface SearchTermsData {
  headers: string[]
  rows: any[][]
  totalRows: number
}

export interface NGramAnalysis {
  summary: {
    totalSearchTerms: number
    totalUnigrams: number
    totalBigrams: number
    totalTrigrams: number
    negativeKeywordCandidates: number
    expansionOpportunities: number
    totalCost: number
    totalConversions: number
    totalConversionValue: number
  }
  ngramResults: {
    unigrams: Record<string, any>
    bigrams: Record<string, any>
    trigrams: Record<string, any>
  }
  topUnigrams?: Array<{
    term: string
    frequency: number
    cost: number
    roas: number
  }>
  topBigrams?: Array<{
    term: string
    frequency: number
    cost: number
    roas: number
  }>
  topTrigrams?: Array<{
    term: string
    frequency: number
    cost: number
    roas: number
  }>
  negativeKeywords: any[]
  expansionOpportunities: any[]
  categories?: any[]
  intentAnalysis?: {
    informational: {
      count: number
      terms: any[]
      totalCost: number
      totalConversions: number
      avgRoas: number
      percentage: number
    }
    navigational: {
      count: number
      terms: any[]
      totalCost: number
      totalConversions: number
      avgRoas: number
      percentage: number
    }
    transactional: {
      count: number
      terms: any[]
      totalCost: number
      totalConversions: number
      avgRoas: number
      percentage: number
    }
    total: number
  }
  metadata: {
    spreadsheetId: string
    sheetName: string
    processedAt: string
    thresholds: any
  }
}

export interface NGramItem {
  ngram: string
  frequency: number
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
  avgCtr: number
  avgCpc: number
  avgRoas: number
  avgConversionRate: number
  searchTerms: string[]
}

// API functions
export const sheetsAPI = {
  // Validate Google Sheets URL
  validateSpreadsheet: async (url: string): Promise<SpreadsheetValidation> => {
    const response = await api.post('/sheets/validate', { url })
    return response.data.data
  },

  // Get spreadsheet metadata
  getMetadata: async (spreadsheetId: string) => {
    const response = await api.get(`/sheets/${spreadsheetId}/metadata`)
    return response.data.data
  },

  // Get sample data
  getSampleData: async (spreadsheetId: string, sheetName: string, maxRows = 10) => {
    const response = await api.get(`/sheets/${spreadsheetId}/sample`, {
      params: { sheetName, maxRows }
    })
    return response.data.data
  },

  // Get search terms data
  getSearchTermsData: async (spreadsheetId: string, sheetName = 'Search Terms Data'): Promise<SearchTermsData> => {
    const response = await api.get(`/sheets/${spreadsheetId}/search-terms`, {
      params: { sheetName }
    })
    return response.data.data
  },

  // Get keywords data
  getKeywordsData: async (spreadsheetId: string, sheetName = 'Keywords Data') => {
    const response = await api.get(`/sheets/${spreadsheetId}/keywords`, {
      params: { sheetName }
    })
    return response.data.data
  }
}

export const analysisAPI = {
  // Process analysis
  processAnalysis: async (spreadsheetId: string): Promise<NGramAnalysis> => {
    const response = await api.post('/analysis/process', {
      spreadsheetId
    })
    return response.data.data
  },

  // Get n-grams
  getNGrams: async (
    spreadsheetId: string, 
    type: 'unigrams' | 'bigrams' | 'trigrams',
    limit = 20
  ): Promise<NGramItem[]> => {
    const response = await api.get(`/analysis/${spreadsheetId}/ngrams`, {
      params: { type, limit }
    })
    return response.data.data
  },

  // Get negative keywords
  getNegativeKeywords: async (spreadsheetId: string): Promise<any[]> => {
    const response = await api.get(`/analysis/${spreadsheetId}/negative-keywords`)
    return response.data.data
  },

  // Get expansion opportunities
  getExpansionOpportunities: async (spreadsheetId: string): Promise<any[]> => {
    const response = await api.get(`/analysis/${spreadsheetId}/expansion-opportunities`)
    return response.data.data
  },

  // Get analysis summary
  getSummary: async (spreadsheetId: string) => {
    const response = await api.get(`/analysis/${spreadsheetId}/summary`)
    return response.data.data
  },

  // Get configuration
  getConfig: async () => {
    const response = await api.get('/analysis/config')
    return response.data.data
  },

  // Update configuration
  updateConfig: async (config: any) => {
    const response = await api.put('/analysis/config', config)
    return response.data.data
  }
}

export const aiAPI = {
  // Cluster n-grams (placeholder for future implementation)
  clusterNGrams: async (data: any) => {
    const response = await api.post('/ai/cluster', data)
    return response.data.data
  },

  // Suggest themes (placeholder for future implementation)
  suggestThemes: async (data: any) => {
    const response = await api.post('/ai/suggest-themes', data)
    return response.data.data
  }
}

export default api 