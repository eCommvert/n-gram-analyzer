const express = require('express');
const Joi = require('joi');
const nGramService = require('../services/nGramService');
const sheetsService = require('../services/sheetsService');
const aiService = require('../services/aiService');

const router = express.Router();

// Validation schemas
const processAnalysisSchema = Joi.object({
  spreadsheetId: Joi.string().required()
});

const updateConfigSchema = Joi.object({
  negativeKeywordThresholds: Joi.object({
    maxRoas: Joi.number().min(0).max(10),
    minCost: Joi.number().min(0),
    maxCtr: Joi.number().min(0).max(1),
    maxConversions: Joi.number().min(0)
  }),
  expansionThresholds: Joi.object({
    minRoas: Joi.number().min(0).max(10),
    minConversions: Joi.number().min(0),
    minCtr: Joi.number().min(0).max(1)
  }),
  stopWords: Joi.array().items(Joi.string()),
  stopWordsArray: Joi.array().items(Joi.string())
});

/**
 * Process analysis for a spreadsheet
 */
router.post('/process', async (req, res) => {
  try {
    const { error, value } = processAnalysisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: error.details[0].message
      });
    }

    const { spreadsheetId } = value;
    
    // Get search terms data
    const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
    
    if (!searchTermsData || !searchTermsData.rows || searchTermsData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No search terms data found'
      });
    }

    // Process the data
    const { ngramResults, searchTerms } = nGramService.processSearchTermsData(searchTermsData.rows);
    
    // Get top n-grams
    const topUnigrams = nGramService.getTopNGrams(ngramResults, 'unigrams', 20);
    const topBigrams = nGramService.getTopNGrams(ngramResults, 'bigrams', 20);
    const topTrigrams = nGramService.getTopNGrams(ngramResults, 'trigrams', 20);
    
    // Identify negative keywords and expansion opportunities
    const negativeKeywords = nGramService.identifyNegativeKeywords(searchTerms);
    const expansionOpportunities = nGramService.identifyExpansionOpportunities(searchTerms);
    
    // Calculate summary metrics
    const summary = {
      totalSearchTerms: searchTerms.length,
      totalUnigrams: Object.keys(ngramResults.unigrams).length,
      totalBigrams: Object.keys(ngramResults.bigrams).length,
      totalTrigrams: Object.keys(ngramResults.trigrams).length,
      negativeKeywordCandidates: negativeKeywords.length,
      expansionOpportunities: expansionOpportunities.length,
      totalCost: searchTerms.reduce((sum, term) => sum + term.cost, 0),
      totalConversions: searchTerms.reduce((sum, term) => sum + term.conversions, 0),
      totalConversionValue: searchTerms.reduce((sum, term) => sum + term.conversionValue, 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        ngramResults,
        topUnigrams,
        topBigrams,
        topTrigrams,
        negativeKeywords,
        expansionOpportunities,
        metadata: {
          spreadsheetId,
          sheetName: 'Search Terms Data',
          processedAt: new Date().toISOString(),
          thresholds: nGramService.getConfig()
        }
      }
    });
  } catch (error) {
    console.error('❌ Error processing analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process analysis',
      error: error.message
    });
  }
});

/**
 * Get current configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = nGramService.getConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('❌ Error getting configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configuration',
      error: error.message
    });
  }
});

/**
 * Update configuration
 */
router.put('/config', async (req, res) => {
  try {
    const { error, value } = updateConfigSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration data',
        error: error.details[0].message
      });
    }

    const updatedConfig = nGramService.updateConfig(value);
    
    res.json({
      success: true,
      data: updatedConfig,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message
    });
  }
});

/**
 * Get n-grams for a specific spreadsheet
 */
router.get('/:spreadsheetId/ngrams', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { type = 'unigrams', limit = 20 } = req.query;
    
    const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
    const { ngramResults } = nGramService.processSearchTermsData(searchTermsData.rows);
    
    const ngrams = nGramService.getTopNGrams(ngramResults, type, parseInt(limit));
    
    res.json({
      success: true,
      data: ngrams
    });
  } catch (error) {
    console.error('❌ Error getting n-grams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get n-grams',
      error: error.message
    });
  }
});

/**
 * Get negative keywords for a specific spreadsheet
 */
  router.get('/:spreadsheetId/negative-keywords', async (req, res) => {
    try {
      const { spreadsheetId } = req.params;
      
      const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
      const { searchTerms } = nGramService.processSearchTermsData(searchTermsData.rows);
      
      const negativeKeywords = nGramService.identifyNegativeKeywords(searchTerms);
    
    res.json({
      success: true,
      data: negativeKeywords
    });
  } catch (error) {
    console.error('❌ Error getting negative keywords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get negative keywords',
      error: error.message
    });
  }
});

/**
 * Get expansion opportunities for a specific spreadsheet
 */
  router.get('/:spreadsheetId/expansion-opportunities', async (req, res) => {
    try {
      const { spreadsheetId } = req.params;
      
      const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
      const { searchTerms } = nGramService.processSearchTermsData(searchTermsData.rows);
      
      const expansionOpportunities = nGramService.identifyExpansionOpportunities(searchTerms);
    
    res.json({
      success: true,
      data: expansionOpportunities
    });
  } catch (error) {
    console.error('❌ Error getting expansion opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expansion opportunities',
      error: error.message
    });
  }
});

/**
 * Get analysis summary for a specific spreadsheet
 */
  router.get('/:spreadsheetId/summary', async (req, res) => {
    try {
      const { spreadsheetId } = req.params;
      
      const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
      const { ngramResults, searchTerms } = nGramService.processSearchTermsData(searchTermsData.rows);
    
    const negativeKeywords = nGramService.identifyNegativeKeywords(searchTerms);
    const expansionOpportunities = nGramService.identifyExpansionOpportunities(searchTerms);
    
    const summary = {
      totalSearchTerms: searchTerms.length,
      totalUnigrams: Object.keys(ngramResults.unigrams).length,
      totalBigrams: Object.keys(ngramResults.bigrams).length,
      totalTrigrams: Object.keys(ngramResults.trigrams).length,
      negativeKeywordCandidates: negativeKeywords.length,
      expansionOpportunities: expansionOpportunities.length,
      totalCost: searchTerms.reduce((sum, term) => sum + term.cost, 0),
      totalConversions: searchTerms.reduce((sum, term) => sum + term.conversions, 0),
      totalConversionValue: searchTerms.reduce((sum, term) => sum + term.conversionValue, 0)
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error getting summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get summary',
      error: error.message
    });
  }
});

/**
 * Get AI clustering analysis
 */
router.get('/:spreadsheetId/categories', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    
    // Get search terms data
    const searchTermsData = await sheetsService.readSearchTermsData(spreadsheetId);
    
    if (!searchTermsData || !searchTermsData.rows || searchTermsData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No search terms data found'
      });
    }

    // Process the data to get search terms
    const { searchTerms } = nGramService.processSearchTermsData(searchTermsData.rows);
    
    // Get AI clustering
    const clusteringResult = await aiService.clusterSearchTerms(searchTerms);
    
    // Get intent analysis
    const intentAnalysis = await aiService.analyzeSearchIntent(searchTerms);

    res.json({
      success: true,
      data: {
        categories: clusteringResult.categories,
        intentAnalysis,
        totalTerms: clusteringResult.totalTerms,
        clusteringMethod: clusteringResult.clusteringMethod
      }
    });
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

module.exports = router; 