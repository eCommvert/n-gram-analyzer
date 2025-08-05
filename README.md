# N-Gram Analyzer for Google Ads

An AI-powered search term analysis tool that helps PPC specialists identify wasted spend and expansion opportunities through n-gram analysis and AI clustering.

## 🚀 Features

### Core Analysis
- **N-Gram Analysis**: Extract unigrams, bigrams, and trigrams from search terms
- **Negative Keyword Identification**: Find high-cost, low-converting terms
- **Expansion Opportunities**: Discover high-performing terms for expansion
- **Real-time Processing**: Analyze thousands of search terms instantly

### Interactive Features
- **Clickable Elements**: Click any term, category, or metric to see filtered data
- **Advanced Filtering**: Filter search terms by n-grams, categories, and intent
- **Sortable Tables**: Sort by any metric (cost, conversions, ROAS, CTR, CPC)
- **Export Functionality**: Export filtered data for further analysis

### AI-Powered Insights
- **Category Clustering**: Automatically group terms into meaningful categories
- **Intent Analysis**: Classify terms as informational, navigational, or transactional
- **Performance Metrics**: Track cost, conversions, ROAS, and CTR across categories

### Configuration & Customization
- **Configurable Thresholds**: Set custom thresholds for negative keywords and expansion opportunities
- **Editable Stop Words**: Add or remove stop words to improve analysis
- **Real-time Updates**: Changes apply immediately to analysis results

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Natural** for text processing
- **Axios** for HTTP requests
- **Joi** for validation

### Data Processing
- **N-Gram Extraction**: Custom algorithm for unigrams, bigrams, trigrams
- **Text Normalization**: Stop word removal and stemming
- **Performance Aggregation**: Cost, conversions, ROAS, CTR calculations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/n-gram-analyzer.git
   cd n-gram-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 🚀 Usage

### 1. Add Your Google Sheets URL
- Enter your Google Sheets URL on the homepage
- The sheet should have a "Search Terms Data" tab with columns:
  - Search Term
  - Impressions
  - Clicks
  - Cost
  - Conversions
  - Conversion Value
  - CTR
  - CPC
  - ROAS
  - Conversion Rate

### 2. Analyze Your Data
- **Overview**: See summary metrics and key insights
- **N-Grams**: Explore unigrams, bigrams, and trigrams
- **Categories**: View AI-clustered categories
- **Negative Keywords**: Identify poor-performing terms
- **Expansion Opportunities**: Find high-performing terms

### 3. Interactive Analysis
- **Click any metric card** to see filtered data
- **Click any n-gram term** to see matching search terms
- **Click any category** to see terms in that category
- **Click any intent type** to see terms with that intent

### 4. Configure Settings
- Click the Settings button to adjust thresholds
- Modify negative keyword criteria
- Add/remove stop words
- Set expansion opportunity thresholds

## 🏗️ Project Structure

```
n-gram/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities and API client
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.js        # Server entry point
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Backend
PORT=3001
NODE_ENV=development

# Optional: OpenAI API for enhanced AI features
OPENAI_API_KEY=your_openai_api_key

# Optional: Google Cloud API for NLP
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

### Default Thresholds
- **Negative Keywords**:
  - Max ROAS: 1.0
  - Min Cost: $10
  - Max CTR: 2%
  - Max Conversions: 0
- **Expansion Opportunities**:
  - Min ROAS: 3.0
  - Min Conversions: 1
  - Min CTR: 5%

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

### Option 2: Railway

1. **Connect to Railway**
   - Push to GitHub
   - Connect repository to Railway
   - Add environment variables

2. **Deploy automatically** on every push

### Option 3: Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Deploy**
   ```bash
   git push heroku main
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

## 🔍 API Endpoints

### Analysis
- `POST /api/analysis/process` - Process search terms data
- `GET /api/analysis/config` - Get current configuration
- `PUT /api/analysis/config` - Update configuration
- `GET /api/analysis/:id/categories` - Get AI clustering results

### Sheets
- `POST /api/sheets/validate` - Validate Google Sheets URL
- `GET /api/sheets/:id/metadata` - Get sheet metadata
- `GET /api/sheets/:id/search-terms` - Get search terms data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/n-gram-analyzer/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/n-gram-analyzer/wiki)
- **Email**: support@ecommvert.com

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] N-Gram analysis
- [x] Negative keyword identification
- [x] Expansion opportunities
- [x] Basic UI

### Phase 2: Enhanced Features ✅
- [x] Interactive filtering
- [x] AI clustering
- [x] Intent analysis
- [x] Configuration system

### Phase 3: Advanced Features 🚧
- [ ] OpenAI GPT integration
- [ ] Google Cloud NLP integration
- [ ] Advanced filtering options
- [ ] Export functionality
- [ ] Trend analysis
- [ ] KPI dashboards

### Phase 4: Enterprise Features 📋
- [ ] Multi-account support
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] User authentication
- [ ] Team collaboration

---

Built with ❤️ by [eCommvert](https://ecommvert.com) 