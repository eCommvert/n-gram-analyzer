const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');
const Joi = require('joi');

// Validation schemas
const validateSpreadsheetUrl = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid Google Sheets URL',
    'any.required': 'Spreadsheet URL is required'
  })
});

const validateSheetName = Joi.object({
  sheetName: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Sheet name must be at least 1 character',
    'string.max': 'Sheet name must be less than 100 characters',
    'any.required': 'Sheet name is required'
  })
});

/**
 * POST /api/sheets/validate
 * Validate a Google Sheets URL and check structure
 */
router.post('/validate', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = validateSpreadsheetUrl.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { url } = value;
    
    // Extract spreadsheet ID from URL
    const spreadsheetId = sheetsService.extractSpreadsheetId(url);
    
    // Validate spreadsheet structure
    const validation = await sheetsService.validateSpreadsheet(spreadsheetId);
    
    res.json({
      success: true,
      data: {
        spreadsheetId,
        url,
        ...validation
      }
    });
  } catch (error) {
    console.error('❌ Error validating spreadsheet:', error);
    res.status(400).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/sheets/:spreadsheetId/metadata
 * Get spreadsheet metadata
 */
router.get('/:spreadsheetId/metadata', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    
    const metadata = await sheetsService.getSheetMetadata(spreadsheetId);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('❌ Error getting spreadsheet metadata:', error);
    res.status(500).json({
      error: 'Failed to get spreadsheet metadata',
      message: error.message
    });
  }
});

/**
 * GET /api/sheets/:spreadsheetId/sample
 * Get sample data from a sheet
 */
router.get('/:spreadsheetId/sample', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { sheetName, maxRows = 10 } = req.query;
    
    // Validate sheet name
    const { error } = validateSheetName.validate({ sheetName });
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }
    
    const sampleData = await sheetsService.getSampleData(
      spreadsheetId, 
      sheetName, 
      parseInt(maxRows)
    );
    
    res.json({
      success: true,
      data: sampleData
    });
  } catch (error) {
    console.error('❌ Error getting sample data:', error);
    res.status(500).json({
      error: 'Failed to get sample data',
      message: error.message
    });
  }
});

/**
 * GET /api/sheets/:spreadsheetId/search-terms
 * Get search terms data from spreadsheet
 */
router.get('/:spreadsheetId/search-terms', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { sheetName = 'Search Terms Data' } = req.query;
    
    const searchTermsData = await sheetsService.readSearchTermsData(
      spreadsheetId, 
      sheetName
    );
    
    res.json({
      success: true,
      data: searchTermsData
    });
  } catch (error) {
    console.error('❌ Error reading search terms data:', error);
    res.status(500).json({
      error: 'Failed to read search terms data',
      message: error.message
    });
  }
});

/**
 * GET /api/sheets/:spreadsheetId/keywords
 * Get keywords data from spreadsheet
 */
router.get('/:spreadsheetId/keywords', async (req, res) => {
  try {
    const { spreadsheetId } = req.params;
    const { sheetName = 'Keywords Data' } = req.query;
    
    const keywordsData = await sheetsService.readKeywordsData(
      spreadsheetId, 
      sheetName
    );
    
    res.json({
      success: true,
      data: keywordsData
    });
  } catch (error) {
    console.error('❌ Error reading keywords data:', error);
    res.status(500).json({
      error: 'Failed to read keywords data',
      message: error.message
    });
  }
});

module.exports = router; 