const natural = require('natural');

class NGramService {
  constructor() {
    // Configuration settings with defaults
    this.config = {
      // Negative keyword thresholds
      negativeKeywordThresholds: {
        maxRoas: 1.0,           // Keywords with ROAS < 1.0 are candidates
        minCost: 10,             // Minimum cost to consider for negative keywords
        maxCtr: 0.02,           // Maximum CTR (2%) for negative candidates
        maxConversions: 0        // Maximum conversions allowed (0 = no conversions)
      },
      
      // Expansion opportunity thresholds
      expansionThresholds: {
        minRoas: 3.0,           // Keywords with ROAS > 3.0 are opportunities
        minConversions: 1,       // Minimum conversions required
        minCtr: 0.05            // Minimum CTR (5%) for opportunities
      },
      
      // Stop words to filter out
      stopWords: new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'his', 'hers', 'ours', 'theirs',
        'get', 'got', 'getting', 'go', 'goes', 'going', 'gone', 'went',
        'airport', 'hotel', 'hotels', 'booking', 'book', 'reservation', 'reserve',
        'travel', 'trip', 'vacation', 'holiday', 'tour', 'tours', 'guide', 'guides'
      ]),
      stopWordsArray: [
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
    };
  }

  /**
   * Normalize text by removing stop words and stemming
   */
  normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Convert to lowercase and split into words
    const words = text.toLowerCase().split(/\s+/);
    
    // Filter out stop words and short words (less than 2 characters)
    const filteredWords = words.filter(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      return cleanWord.length >= 2 && !this.config.stopWords.has(cleanWord);
    });
    
    // Apply stemming
    const stemmedWords = filteredWords.map(word => natural.PorterStemmer.stem(word));
    
    return stemmedWords.join(' ');
  }

  /**
   * Extract n-grams from text
   */
  extractNGrams(text, maxN = 3) {
    const normalizedText = this.normalizeText(text);
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
    const ngrams = { unigrams: [], bigrams: [], trigrams: [] };
    
    // Extract unigrams (1-word)
    ngrams.unigrams = words;
    
    // Extract bigrams (2-word combinations)
    for (let i = 0; i < words.length - 1; i++) {
      ngrams.bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
    
    // Extract trigrams (3-word combinations)
    for (let i = 0; i < words.length - 2; i++) {
      ngrams.trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    return ngrams;
  }

  /**
   * Process search terms data and extract n-grams
   */
  processSearchTermsData(data) {
    const ngramResults = {
      unigrams: {},
      bigrams: {},
      trigrams: {}
    };
    
    const searchTerms = [];
    
    data.forEach(row => {
      const searchTerm = row[0] || '';
      const impressions = parseInt(row[1]) || 0;
      const clicks = parseInt(row[2]) || 0;
      const cost = parseFloat(row[3]) || 0;
      const conversions = parseFloat(row[4]) || 0;
      const conversionValue = parseFloat(row[5]) || 0;
      
      if (searchTerm && impressions > 0) {
        searchTerms.push({
          term: searchTerm,
          impressions,
          clicks,
          cost,
          conversions,
          conversionValue
        });
        
        // Extract n-grams
        const ngrams = this.extractNGrams(searchTerm);
        
        // Process unigrams
        ngrams.unigrams.forEach(ngram => {
          if (!ngramResults.unigrams[ngram]) {
            ngramResults.unigrams[ngram] = {
              frequency: 0,
              impressions: 0,
              clicks: 0,
              cost: 0,
              conversions: 0,
              conversionValue: 0,
              searchTerms: []
            };
          }
          
          ngramResults.unigrams[ngram].frequency++;
          ngramResults.unigrams[ngram].impressions += impressions;
          ngramResults.unigrams[ngram].clicks += clicks;
          ngramResults.unigrams[ngram].cost += cost;
          ngramResults.unigrams[ngram].conversions += conversions;
          ngramResults.unigrams[ngram].conversionValue += conversionValue;
          ngramResults.unigrams[ngram].searchTerms.push(searchTerm);
        });
        
        // Process bigrams
        ngrams.bigrams.forEach(ngram => {
          if (!ngramResults.bigrams[ngram]) {
            ngramResults.bigrams[ngram] = {
              frequency: 0,
              impressions: 0,
              clicks: 0,
              cost: 0,
              conversions: 0,
              conversionValue: 0,
              searchTerms: []
            };
          }
          
          ngramResults.bigrams[ngram].frequency++;
          ngramResults.bigrams[ngram].impressions += impressions;
          ngramResults.bigrams[ngram].clicks += clicks;
          ngramResults.bigrams[ngram].cost += cost;
          ngramResults.bigrams[ngram].conversions += conversions;
          ngramResults.bigrams[ngram].conversionValue += conversionValue;
          ngramResults.bigrams[ngram].searchTerms.push(searchTerm);
        });
        
        // Process trigrams
        ngrams.trigrams.forEach(ngram => {
          if (!ngramResults.trigrams[ngram]) {
            ngramResults.trigrams[ngram] = {
              frequency: 0,
              impressions: 0,
              clicks: 0,
              cost: 0,
              conversions: 0,
              conversionValue: 0,
              searchTerms: []
            };
          }
          
          ngramResults.trigrams[ngram].frequency++;
          ngramResults.trigrams[ngram].impressions += impressions;
          ngramResults.trigrams[ngram].clicks += clicks;
          ngramResults.trigrams[ngram].cost += cost;
          ngramResults.trigrams[ngram].conversions += conversions;
          ngramResults.trigrams[ngram].conversionValue += conversionValue;
          ngramResults.trigrams[ngram].searchTerms.push(searchTerm);
        });
      }
    });
    
    // Calculate metrics for all n-grams
    Object.keys(ngramResults).forEach(type => {
      Object.keys(ngramResults[type]).forEach(ngram => {
        const data = ngramResults[type][ngram];
        data.avgCtr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        data.avgCpc = data.clicks > 0 ? data.cost / data.clicks : 0;
        data.avgRoas = data.cost > 0 ? data.conversionValue / data.cost : 0;
        data.avgConversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
      });
    });
    
    return { ngramResults, searchTerms };
  }

  /**
   * Get top n-grams by frequency
   */
  getTopNGrams(ngramResults, type, limit = 10) {
    const ngrams = ngramResults[type] || {};
    return Object.entries(ngrams)
      .map(([term, data]) => ({
        term,
        frequency: data.frequency,
        impressions: data.impressions,
        clicks: data.clicks,
        cost: data.cost,
        conversions: data.conversions,
        conversionValue: data.conversionValue,
        ctr: data.avgCtr,
        cpc: data.avgCpc,
        roas: data.avgRoas,
        conversionRate: data.avgConversionRate
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Identify negative keyword candidates based on configuration
   */
  identifyNegativeKeywords(searchTerms) {
    const { negativeKeywordThresholds } = this.config;
    
    return searchTerms
      .filter(term => {
        const roas = term.cost > 0 ? term.conversionValue / term.cost : 0;
        const ctr = term.impressions > 0 ? term.clicks / term.impressions : 0;
        
        return (
          term.cost >= negativeKeywordThresholds.minCost &&
          roas < negativeKeywordThresholds.maxRoas &&
          ctr < negativeKeywordThresholds.maxCtr &&
          term.conversions <= negativeKeywordThresholds.maxConversions
        );
      })
      .map(term => ({
        term: term.term,
        cost: term.cost,
        conversions: term.conversions,
        ctr: term.impressions > 0 ? term.clicks / term.impressions : 0,
        roas: term.cost > 0 ? term.conversionValue / term.cost : 0,
        impressions: term.impressions,
        clicks: term.clicks,
        conversionValue: term.conversionValue
      }))
      .sort((a, b) => b.cost - a.cost); // Sort by cost (highest first)
  }

  /**
   * Identify expansion opportunities based on configuration
   */
  identifyExpansionOpportunities(searchTerms) {
    const { expansionThresholds } = this.config;
    
    return searchTerms
      .filter(term => {
        const roas = term.cost > 0 ? term.conversionValue / term.cost : 0;
        const ctr = term.impressions > 0 ? term.clicks / term.impressions : 0;
        
        return (
          roas >= expansionThresholds.minRoas &&
          term.conversions >= expansionThresholds.minConversions &&
          ctr >= expansionThresholds.minCtr
        );
      })
      .map(term => ({
        term: term.term,
        cost: term.cost,
        conversions: term.conversions,
        ctr: term.impressions > 0 ? term.clicks / term.impressions : 0,
        roas: term.cost > 0 ? term.conversionValue / term.cost : 0,
        impressions: term.impressions,
        clicks: term.clicks,
        conversionValue: term.conversionValue
      }))
      .sort((a, b) => b.roas - a.roas); // Sort by ROAS (highest first)
  }

  /**
   * Update configuration settings
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Ensure stopWords is always a Set
    if (newConfig.stopWords && Array.isArray(newConfig.stopWords)) {
      this.config.stopWords = new Set(newConfig.stopWords);
      this.config.stopWordsArray = newConfig.stopWords;
    } else if (newConfig.stopWordsArray && Array.isArray(newConfig.stopWordsArray)) {
      // Handle case where stopWordsArray is provided instead of stopWords
      this.config.stopWords = new Set(newConfig.stopWordsArray);
      this.config.stopWordsArray = newConfig.stopWordsArray;
    }
    
    return this.config;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    // Create a copy of the config to avoid modifying the original
    const configCopy = { ...this.config };
    
    // Convert Set to Array for JSON serialization
    if (this.config.stopWords instanceof Set) {
      configCopy.stopWords = Array.from(this.config.stopWords);
    }
    
    return configCopy;
  }
}

module.exports = new NGramService(); 