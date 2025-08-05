const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
  }

  /**
   * Cluster search terms into categories using AI
   */
  async clusterSearchTerms(searchTerms, maxCategories = 10) {
    try {
      // For now, return a placeholder implementation
      // In the future, this will integrate with OpenAI GPT or Google Cloud NLP
      
      const categories = this.generatePlaceholderCategories(searchTerms);
      
      return {
        success: true,
        categories,
        totalTerms: searchTerms.length,
        clusteringMethod: 'placeholder'
      };
    } catch (error) {
      console.error('❌ Error clustering search terms:', error);
      return {
        success: false,
        error: error.message,
        categories: []
      };
    }
  }

  /**
   * Generate placeholder categories based on common patterns
   */
  generatePlaceholderCategories(searchTerms) {
    const categories = {
      'Transportation': {
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        count: 0
      },
      'Destinations': {
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        count: 0
      },
      'Services': {
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        count: 0
      },
      'Booking': {
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        count: 0
      },
      'Information': {
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        count: 0
      }
    };

    // Simple keyword-based categorization
    const transportationKeywords = ['transport', 'transfer', 'car', 'bus', 'train', 'airport', 'taxi'];
    const destinationKeywords = ['rome', 'lisbon', 'dubrovnik', 'porto', 'split', 'florence', 'santiago'];
    const serviceKeywords = ['service', 'booking', 'reservation', 'guide', 'tour'];
    const bookingKeywords = ['book', 'reserve', 'booking', 'reservation'];
    const informationKeywords = ['how', 'what', 'where', 'when', 'why', 'best', 'top'];

    searchTerms.forEach(term => {
      const termText = term.term.toLowerCase();
      let categorized = false;

      // Check transportation
      if (transportationKeywords.some(keyword => termText.includes(keyword))) {
        this.addToCategory(categories, 'Transportation', term);
        categorized = true;
      }

      // Check destinations
      if (destinationKeywords.some(keyword => termText.includes(keyword))) {
        this.addToCategory(categories, 'Destinations', term);
        categorized = true;
      }

      // Check services
      if (serviceKeywords.some(keyword => termText.includes(keyword))) {
        this.addToCategory(categories, 'Services', term);
        categorized = true;
      }

      // Check booking
      if (bookingKeywords.some(keyword => termText.includes(keyword))) {
        this.addToCategory(categories, 'Booking', term);
        categorized = true;
      }

      // Check information
      if (informationKeywords.some(keyword => termText.includes(keyword))) {
        this.addToCategory(categories, 'Information', term);
        categorized = true;
      }

      // If not categorized, add to "Other"
      if (!categorized) {
        if (!categories['Other']) {
          categories['Other'] = {
            terms: [],
            totalCost: 0,
            totalConversions: 0,
            avgRoas: 0,
            count: 0
          };
        }
        this.addToCategory(categories, 'Other', term);
      }
    });

    // Calculate averages and clean up empty categories
    Object.keys(categories).forEach(category => {
      if (categories[category].count > 0) {
        categories[category].avgRoas = categories[category].totalCost > 0 
          ? categories[category].totalConversions / categories[category].totalCost 
          : 0;
      } else {
        delete categories[category];
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  /**
   * Add a term to a category
   */
  addToCategory(categories, categoryName, term) {
    categories[categoryName].terms.push(term);
    categories[categoryName].totalCost += term.cost;
    categories[categoryName].totalConversions += term.conversions;
    categories[categoryName].count += 1;
  }

  /**
   * Analyze search intent with detailed breakdown
   */
  async analyzeSearchIntent(searchTerms) {
    const intentKeywords = {
      informational: [
        'how', 'what', 'where', 'when', 'why', 'best', 'top', 'guide', 'tips', 'learn', 
        'information', 'details', 'explain', 'compare', 'difference', 'vs', 'versus',
        'which', 'recommend', 'suggest', 'advice', 'help', 'support'
      ],
      navigational: [
        'rome', 'lisbon', 'dubrovnik', 'porto', 'split', 'florence', 'santiago', 
        'official', 'website', 'homepage', 'main', 'direct', 'exact', 'specific',
        'brand', 'company', 'business', 'store', 'shop', 'location', 'address'
      ],
      transactional: [
        'book', 'reserve', 'booking', 'reservation', 'buy', 'purchase', 'order', 
        'transfer', 'service', 'price', 'cost', 'cheap', 'discount', 'deal', 'offer',
        'sale', 'promotion', 'coupon', 'voucher', 'payment', 'credit', 'card'
      ]
    };

    const intentAnalysis = {
      informational: {
        count: 0,
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        percentage: 0
      },
      navigational: {
        count: 0,
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        percentage: 0
      },
      transactional: {
        count: 0,
        terms: [],
        totalCost: 0,
        totalConversions: 0,
        avgRoas: 0,
        percentage: 0
      },
      total: searchTerms.length
    };

    searchTerms.forEach(term => {
      const termText = term.term.toLowerCase();
      let categorized = false;

      // Check each intent type
      Object.keys(intentKeywords).forEach(intentType => {
        if (intentKeywords[intentType].some(keyword => termText.includes(keyword))) {
          intentAnalysis[intentType].count++;
          intentAnalysis[intentType].terms.push(term);
          intentAnalysis[intentType].totalCost += term.cost;
          intentAnalysis[intentType].totalConversions += term.conversions;
          categorized = true;
        }
      });

      // If not categorized, add to informational as default
      if (!categorized) {
        intentAnalysis.informational.count++;
        intentAnalysis.informational.terms.push(term);
        intentAnalysis.informational.totalCost += term.cost;
        intentAnalysis.informational.totalConversions += term.conversions;
      }
    });

    // Calculate percentages and averages
    Object.keys(intentAnalysis).forEach(intentType => {
      if (intentType !== 'total') {
        const intent = intentAnalysis[intentType];
        intent.percentage = (intent.count / intentAnalysis.total) * 100;
        intent.avgRoas = intent.totalCost > 0 ? intent.totalConversions / intent.totalCost : 0;
      }
    });

    return intentAnalysis;
  }
}

module.exports = new AIService(); 