# Cruxly - The Crux of the Story

A news aggregation platform that compares coverage from multiple sources across the political spectrum, powered by AI for fact extraction, bias detection, and source scoring.

## The Problem

Modern news is optimized for views, not truth. Political bias, selective reporting, and emotional framing make it difficult to understand what's actually happening. Manually cross-referencing multiple sources is time-consuming.

## The Solution

Cruxly automates multi-source news comparison:
- Aggregates articles from trusted sources across the political spectrum
- Uses AI (Claude) to extract facts, detect bias, and score sources
- Shows consensus facts vs. disputed claims
- Provides side-by-side comparison with raw sources + AI analysis

## Target Users

- Policy analysts & researchers
- Journalists fact-checking competitors
- International expats following home country news
- Educators teaching media literacy
- Curious professionals who want the truth, not spin

## Features

- **Multi-Source Aggregation**: Compare 30+ trusted news sources (US, UK, Europe)
- **AI-Powered Analysis**:
  - Fact extraction
  - Bias detection (emotional language, omissions, framing)
  - Source scoring (factual accuracy per story)
- **Dual View**: Raw sources + AI synthesis
- **Search & Trending**: Find specific topics or browse trending stories

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **News API**: NewsAPI.org
- **AI**: Anthropic Claude (Sonnet 4)
- **Deployment**: Vercel (recommended)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd cruxly
npm install
```

### 2. Get API Keys

**NewsAPI** (Free tier: 100 requests/day)
1. Go to https://newsapi.org/
2. Sign up for a free account
3. Copy your API key

**Anthropic API**
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy your API key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
NEWS_API_KEY=your_newsapi_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Search**: Enter any news topic (e.g., "climate change policy")
2. **View Sources**: See articles from left, center, and right-leaning sources
3. **Analyze**: Click "Analyze with AI" to get:
   - Consensus facts (what all sources agree on)
   - Disputed claims (what only some sources report)
   - Source-by-source bias analysis
   - Factual accuracy scores

## Trusted Sources

### United States
- **Left**: NYT, Washington Post, CNN, Politico
- **Center**: Reuters, AP, BBC, Axios, The Economist
- **Right**: Fox News, WSJ, National Review

### International
- **UK**: Guardian, Telegraph, Financial Times
- **Spain**: El País, El Mundo, ABC
- **Italy**: La Repubblica, Corriere della Sera, Il Sole 24 Ore
- **France**: Le Monde, Le Figaro, AFP
- **Germany**: Der Spiegel, Die Welt, FAZ

See `src/config/sources.ts` for the complete list with bias ratings and trust scores.

## API Rate Limits

**NewsAPI Free Tier:**
- 100 requests per day
- 15 requests per 15 minutes
- Only articles from last 30 days

**Anthropic API:**
- Pay-as-you-go pricing
- ~$0.003 per analysis (6 articles)
- Budget ~$10/month for MVP testing

## Roadmap

### MVP (Current)
- [x] Multi-source search
- [x] AI analysis (fact extraction, bias detection, scoring)
- [x] Basic UI

### Phase 2
- [ ] User authentication
- [ ] Save/favorite stories
- [ ] Email alerts for tracked topics
- [ ] Trending topics (automated)
- [ ] More sources (international, non-English)

### Phase 3 (B2B)
- [ ] API access for researchers
- [ ] Media monitoring dashboard
- [ ] Bulk analysis
- [ ] Custom source lists
- [ ] Export reports (PDF, CSV)

## Business Model

**B2C**: $10/month for unlimited searches and analysis
- Target: Analysts, journalists, educators, curious professionals
- Value prop: Save 45 minutes of manual cross-referencing per story

**B2B**: $100-500/month for organizations
- Newsrooms (fact-checking)
- NGOs (media monitoring)
- Think tanks (policy analysis)
- Corporates (reputation monitoring)

## Defensibility

Technical features are replicable. Defensibility comes from:
1. **Editorial trust**: Transparent methodology, published bias ratings
2. **Source relationships**: Direct API access, partnerships
3. **Brand reputation**: Like AllSides, trust takes years to build
4. **Network effects**: User corrections improve accuracy over time

## Contributing

This is currently a solo project. If you'd like to contribute:
1. Fork the repo
2. Create a feature branch
3. Submit a PR with tests

## License

MIT License - See LICENSE file

## Contact

For questions, feedback, or partnerships: [Your email/contact]

---

Built with Claude Code
