# Google Sheets API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### Step 2: Configure Environment

1. Create `.env` file in the `backend` folder:
```bash
cd backend
cp env.example .env
```

2. Add your API key to `.env`:
```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Step 3: Make Your Sheet Public

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1srZB6-bwVsmXrn1p_afXgSd2i7M3SRuDzRqV8Npo5m0
2. Click "Share" (top right)
3. Click "Change to anyone with the link"
4. Set to "Viewer"
5. Click "Done"

### Step 4: Add Data to Your Sheet

Your sheet needs these columns in the first row:
- **Search term** (Column A)
- **Impressions** (Column B) 
- **Clicks** (Column C)
- **Cost** (Column D)
- **Conversions** (Column E)
- **Conv. value** (Column F)

Example data:
```
Search term | Impressions | Clicks | Cost | Conversions | Conv. value
running shoes | 1500 | 45 | 225.50 | 3 | 450.00
athletic footwear | 2200 | 78 | 312.00 | 5 | 750.00
```

### Step 5: Restart Backend

```bash
cd backend
npm run dev
```

## Testing

1. Visit http://localhost:3000
2. Paste your Google Sheets URL
3. Click "Start Analysis"
4. You should now see real data from your sheet!

## Troubleshooting

### If you get "API key not valid" error:
- Make sure your sheet is public (anyone with link can view)
- Check that the API key is correct in `.env`
- Ensure Google Sheets API is enabled in Google Cloud Console

### If you get "No data found" error:
- Check that your sheet has data in the expected format
- Make sure the first row contains headers
- Verify the sheet is accessible with the link

## Production Deployment

For production, you'll want to use Service Account credentials instead of API keys for better security. This guide covers the development setup. 