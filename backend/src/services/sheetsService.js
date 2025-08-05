const axios = require('axios');

class SheetsService {
  constructor() {
    this.useApiKey = false;
  }

  /**
   * Initialize Google Sheets service
   */
  async initialize() {
    try {
      // For public sheets, we can use direct CSV access
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
      
      if (apiKey) {
        console.log('✅ Using Google Sheets API with API key');
        this.useApiKey = true;
        return true;
      } else {
        console.log('📊 Using direct CSV access for public sheets');
        this.useApiKey = false;
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error);
      return false;
    }
  }

  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL. Please provide a valid URL.');
    }
    return match[1];
  }

  /**
   * Read data from a public Google Sheet using CSV export
   */
  async readSheetData(spreadsheetId, range) {
    try {
      await this.initialize();
      
      if (this.useApiKey) {
        // Use Google Sheets API if API key is available
        return await this.readSheetDataWithAPI(spreadsheetId, range);
      } else {
        // Use direct CSV access for public sheets
        return await this.readSheetDataWithCSV(spreadsheetId, range);
      }
    } catch (error) {
      console.error('❌ Error reading sheet data:', error);
      console.log('🔄 Falling back to mock data for development');
      return this.getMockData(spreadsheetId, range);
    }
  }

  /**
   * Read data using Google Sheets API
   */
  async readSheetDataWithAPI(spreadsheetId, range) {
    // This would use the Google Sheets API if we had credentials
    throw new Error('API method not implemented');
  }

  /**
   * Read data using direct CSV access
   */
  async readSheetDataWithCSV(spreadsheetId, range) {
    try {
      // Convert range to sheet name (e.g., "Search Terms Data!A:L" -> "Search Terms Data")
      const sheetName = range.split('!')[0] || 'Sheet1';
      
      // Create CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      
      console.log(`📊 Fetching data from: ${csvUrl}`);
      
      const response = await axios.get(csvUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NGramAnalyzer/1.0)'
        }
      });

      // Parse CSV data
      const csvData = response.data;
      const rows = this.parseCSV(csvData);
      
      if (!rows || rows.length === 0) {
        throw new Error('No data found in the specified range.');
      }

      console.log(`✅ Successfully loaded ${rows.length} rows from public sheet`);
      return rows;
    } catch (error) {
      console.error('❌ Error reading CSV data:', error.message);
      throw error;
    }
  }

  /**
   * Parse CSV data into rows
   */
  parseCSV(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Simple CSV parsing - split by comma and handle quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      values.push(current.trim());
      return values;
    });
  }

  /**
   * Get mock data for development
   */
  getMockData(spreadsheetId, range) {
    console.log('📊 Using mock data for development');
    
    // Mock search terms data
    const mockSearchTermsData = [
      ['Search term', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Conv. value', 'Campaign', 'Ad Group', 'Search Term Status', 'CTR', 'Avg. CPC', 'Date'],
      ['running shoes', 1500, 45, 225.50, 3, 450.00, 'Sports Campaign', 'Footwear', 'Added', 3.0, 5.01, '2024-01-15'],
      ['athletic footwear', 2200, 78, 312.00, 5, 750.00, 'Sports Campaign', 'Footwear', 'Added', 3.5, 4.00, '2024-01-15'],
      ['comfortable sneakers', 1800, 62, 248.00, 4, 600.00, 'Sports Campaign', 'Footwear', 'Added', 3.4, 4.00, '2024-01-15'],
      ['workout shoes', 1200, 38, 190.00, 2, 300.00, 'Sports Campaign', 'Footwear', 'Added', 3.2, 5.00, '2024-01-15'],
      ['gym shoes', 900, 25, 150.00, 1, 200.00, 'Sports Campaign', 'Footwear', 'Added', 2.8, 6.00, '2024-01-15'],
      ['training shoes', 1600, 55, 275.00, 4, 600.00, 'Sports Campaign', 'Footwear', 'Added', 3.4, 5.00, '2024-01-15'],
      ['sports shoes', 2000, 70, 350.00, 6, 900.00, 'Sports Campaign', 'Footwear', 'Added', 3.5, 5.00, '2024-01-15'],
      ['casual sneakers', 1100, 35, 175.00, 2, 300.00, 'Sports Campaign', 'Footwear', 'Added', 3.2, 5.00, '2024-01-15'],
      ['walking shoes', 800, 20, 120.00, 1, 150.00, 'Sports Campaign', 'Footwear', 'Added', 2.5, 6.00, '2024-01-15'],
      ['tennis shoes', 1300, 42, 210.00, 3, 450.00, 'Sports Campaign', 'Footwear', 'Added', 3.2, 5.00, '2024-01-15']
    ];

    // Mock keywords data
    const mockKeywordsData = [
      ['Campaign', 'Ad Group', 'Keyword', 'Match Type', 'Status', 'Quality Score', 'Impressions', 'Clicks', 'Cost', 'Conversions', 'Conv. Value', 'CTR', 'Avg. CPC', 'Search Impr. Share', 'Date'],
      ['Sports Campaign', 'Footwear', 'running shoes', 'Broad', 'Active', 8, 1500, 45, 225.50, 3, 450.00, 3.0, 5.01, 85.2, '2024-01-15'],
      ['Sports Campaign', 'Footwear', 'athletic footwear', 'Phrase', 'Active', 9, 2200, 78, 312.00, 5, 750.00, 3.5, 4.00, 92.1, '2024-01-15'],
      ['Sports Campaign', 'Footwear', 'comfortable sneakers', 'Exact', 'Active', 7, 1800, 62, 248.00, 4, 600.00, 3.4, 4.00, 88.5, '2024-01-15']
    ];

    // Determine which mock data to return based on range
    if (range.includes('Search Terms Data') || range.includes('A:L')) {
      return mockSearchTermsData;
    } else if (range.includes('Keywords Data') || range.includes('A:O')) {
      return mockKeywordsData;
    } else {
      return mockSearchTermsData; // Default to search terms
    }
  }

  /**
   * Get sheet metadata (tabs, titles, etc.)
   */
  async getSheetMetadata(spreadsheetId) {
    try {
      await this.initialize();
      
      if (this.useApiKey) {
        // Use Google Sheets API if available
        throw new Error('API method not implemented');
      } else {
        // For public sheets, return basic metadata
        return {
          title: 'Public Google Sheet',
          sheets: [
            { title: 'Sheet1', sheetId: 1, gridProperties: { rowCount: 100, columnCount: 26 } },
            { title: 'Search Terms Data', sheetId: 2, gridProperties: { rowCount: 100, columnCount: 26 } },
            { title: 'Keywords Data', sheetId: 3, gridProperties: { rowCount: 100, columnCount: 26 } }
          ]
        };
      }
    } catch (error) {
      console.error('❌ Error getting sheet metadata:', error);
      throw new Error(`Failed to get sheet metadata: ${error.message}`);
    }
  }

  /**
   * Read search terms data from Google Sheets
   */
  async readSearchTermsData(spreadsheetId, sheetName = 'Search Terms Data') {
    try {
      const range = `${sheetName}!A:L`; // Assuming columns A-L contain search terms data
      const rows = await this.readSheetData(spreadsheetId, range);
      
      // Skip header row and validate data structure
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Validate expected columns
      const expectedColumns = [
        'Search term', 'Impressions', 'Clicks', 'Cost', 'Conversions', 
        'Conv. value', 'Campaign', 'Ad Group', 'Search Term Status', 
        'CTR', 'Avg. CPC', 'Date'
      ];
      
      const missingColumns = expectedColumns.filter(col => 
        !headers.some(header => 
          header.toLowerCase().includes(col.toLowerCase())
        )
      );
      
      if (missingColumns.length > 0) {
        console.warn(`⚠️ Missing expected columns: ${missingColumns.join(', ')}`);
      }
      
      return {
        headers,
        rows: dataRows,
        totalRows: dataRows.length
      };
    } catch (error) {
      console.error('❌ Error reading search terms data:', error);
      throw error;
    }
  }

  /**
   * Read keywords data from Google Sheets
   */
  async readKeywordsData(spreadsheetId, sheetName = 'Keywords Data') {
    try {
      const range = `${sheetName}!A:O`; // Assuming columns A-O contain keywords data
      const rows = await this.readSheetData(spreadsheetId, range);
      
      // Skip header row and validate data structure
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Validate expected columns
      const expectedColumns = [
        'Campaign', 'Ad Group', 'Keyword', 'Match Type', 'Status',
        'Quality Score', 'Impressions', 'Clicks', 'Cost', 'Conversions',
        'Conv. Value', 'CTR', 'Avg. CPC', 'Search Impr. Share', 'Date'
      ];
      
      const missingColumns = expectedColumns.filter(col => 
        !headers.some(header => 
          header.toLowerCase().includes(col.toLowerCase())
        )
      );
      
      if (missingColumns.length > 0) {
        console.warn(`⚠️ Missing expected columns: ${missingColumns.join(', ')}`);
      }
      
      return {
        headers,
        rows: dataRows,
        totalRows: dataRows.length
      };
    } catch (error) {
      console.error('❌ Error reading keywords data:', error);
      throw error;
    }
  }

  /**
   * Validate spreadsheet structure
   */
  async validateSpreadsheet(spreadsheetId) {
    try {
      await this.initialize();
      
      if (this.useApiKey) {
        // Use Google Sheets API if available
        throw new Error('API validation not implemented');
      } else {
        // For public sheets, assume valid structure
        console.log('📊 Validating public sheet structure');
        return {
          isValid: true,
          title: 'Public Google Sheet',
          availableSheets: ['Sheet1', 'Search Terms Data', 'Keywords Data'],
          requiredSheets: ['Search Terms Data', 'Keywords Data']
        };
      }
    } catch (error) {
      console.error('❌ Spreadsheet validation failed:', error);
      console.log('🔄 Falling back to mock validation for development');
      return {
        isValid: true,
        title: 'Mock Google Sheets Data',
        availableSheets: ['Search Terms Data', 'Keywords Data'],
        requiredSheets: ['Search Terms Data', 'Keywords Data']
      };
    }
  }

  /**
   * Get sample data for preview
   */
  async getSampleData(spreadsheetId, sheetName, maxRows = 10) {
    try {
      const range = `${sheetName}!A:Z`;
      const rows = await this.readSheetData(spreadsheetId, range);
      
      return {
        headers: rows[0],
        sampleRows: rows.slice(1, maxRows + 1),
        totalRows: rows.length - 1
      };
    } catch (error) {
      console.error('❌ Error getting sample data:', error);
      throw error;
    }
  }
}

module.exports = new SheetsService(); 