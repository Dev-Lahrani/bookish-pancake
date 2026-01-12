# AI Plagiarism Detector & Humanizer

A full-stack web application that detects AI-generated content and humanizes text using advanced Natural Language Processing (NLP) and AI APIs.

![Technology Stack](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 🌟 Features

### AI Plagiarism Checker
- **Comprehensive Analysis**: 6 different metrics to detect AI-generated content
  - Sentence Uniformity Score
  - Perplexity Score (word predictability)
  - Burstiness Score (sentence length variation)
  - AI Phrase Detection (35+ common AI patterns)
  - Vocabulary Diversity Index
  - Readability Score (Flesch-Kincaid)
- **Visual Dashboard**: Color-coded risk levels with circular progress indicators
- **Pattern Detection**: Identifies and highlights common AI phrases
- **Suspicious Sections**: Flags problematic paragraphs with severity levels
- **Actionable Recommendations**: Specific suggestions to make text more human

### Text Humanizer
- **AI-Powered Rewriting**: Uses OpenAI GPT-4 or Anthropic Claude
- **Multiple Tone Options**: Casual, Professional, Academic, Creative
- **Intensity Control**: Light, Medium, Aggressive humanization levels
- **Smart Options**:
  - Preserve technical terminology
  - Add personal touches and anecdotes
- **Side-by-Side Comparison**: Visual diff showing all changes
- **Detailed Statistics**:
  - Words changed count
  - Sentence variations added
  - AI phrases removed
- **Iterative Humanization**: Re-humanize results for better quality

## 🏗️ Architecture

```
/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── PlagiarismChecker.tsx
│   │   │   ├── Humanizer.tsx
│   │   │   ├── MetricsCard.tsx
│   │   │   └── TextComparison.tsx
│   │   ├── services/      # API service layer
│   │   │   └── api.ts
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   │   ├── analyze.ts
│   │   │   └── humanize.ts
│   │   ├── services/     # AI service integration
│   │   │   └── aiService.ts
│   │   ├── utils/        # Analysis algorithms
│   │   │   ├── analyzer.ts
│   │   │   └── humanizer.ts
│   │   └── index.ts      # Server entry point
│   └── package.json
│
├── shared/               # Shared TypeScript types
│   └── src/
│       └── types.ts
│
└── package.json         # Root workspace config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key OR Anthropic API key (for humanization feature)

### Installation

1. **Clone the repository**
   ```bash
   cd "/home/dev-lahrani/Desktop/Projects/AI Plagarism Detector and Humanizer"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # Choose ONE of these (or both)
   OPENAI_API_KEY=sk-your-openai-key-here
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   
   # Server config
   PORT=3001
   NODE_ENV=development
   ```

4. **Build shared types**
   ```bash
   npm run build --workspace=shared
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend server on `http://localhost:3001`
   - Frontend dev server on `http://localhost:5173`

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📖 Usage

### Plagiarism Checker

1. Navigate to the "Plagiarism Checker" tab
2. Paste your text (minimum 50 characters)
3. Click "Analyze Text" or press `Ctrl+Enter`
4. Review the results:
   - Overall AI Detection Score (0-100%)
   - Individual metrics breakdown
   - Detected AI patterns
   - Suspicious sections
   - Recommendations

### Text Humanizer

1. Navigate to the "Humanizer" tab
2. Paste AI-generated text
3. Configure options:
   - **Tone**: Casual, Professional, Academic, or Creative
   - **Intensity**: Light (minimal), Medium (balanced), or Aggressive (maximum)
   - **Preserve Technical**: Keep technical terms unchanged
   - **Add Personal Touches**: Include personal anecdotes
4. Click "Humanize Text"
5. Review the comparison and statistics
6. Copy the humanized text or re-humanize for better results

## 🔍 Analysis Algorithms

### Sentence Uniformity
Calculates the coefficient of variation of sentence lengths. AI tends to produce more uniform sentences.

### Perplexity
Measures word predictability using bigram analysis. Lower perplexity indicates more predictable (AI-like) text.

### Burstiness
Analyzes variation in sentence complexity. Human writing naturally has higher burstiness.

### AI Phrase Detection
Scans for 35+ common AI phrases including:
- "It's important to note that"
- "Delve into"
- "Furthermore" / "Moreover"
- "In today's digital age"
- "The realm/landscape/tapestry of"

### Vocabulary Diversity
Calculates Type-Token Ratio and lexical density. Unnaturally high diversity can indicate AI.

### Readability
Implements Flesch-Kincaid readability score. AI often maintains too-consistent readability.

## 🎨 UI Features

- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Visual feedback for async operations
- **Error Handling**: User-friendly error messages
- **Keyboard Shortcuts**: `Ctrl+Enter` to analyze
- **Progress Indicators**: Real-time analysis progress
- **Smooth Animations**: Professional transitions and effects
- **Accessibility**: ARIA labels and keyboard navigation

## 🔧 API Endpoints

### POST `/api/analyze`
Analyze text for AI detection

**Request:**
```json
{
  "text": "Your text to analyze..."
}
```

**Response:**
```json
{
  "overallScore": 75,
  "metrics": {
    "sentenceUniformity": 68,
    "perplexity": 72,
    "burstiness": 45,
    "aiPhraseCount": 5,
    "vocabularyDiversity": 78,
    "readabilityScore": 65
  },
  "suspiciousSections": [...],
  "detectedPatterns": [...],
  "recommendations": [...]
}
```

### POST `/api/humanize`
Humanize AI-generated text

**Request:**
```json
{
  "text": "AI-generated text...",
  "options": {
    "tone": "professional",
    "intensity": "medium",
    "preserveTechnical": false,
    "addPersonalTouches": false
  }
}
```

**Response:**
```json
{
  "humanizedText": "Humanized version...",
  "changesCount": 45,
  "patternsRemoved": ["delve into", "furthermore"],
  "statistics": {
    "wordsChanged": 120,
    "sentenceVariations": 8,
    "aiPhrasesRemoved": 3
  }
}
```

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **Lucide React** - Icons
- **react-diff-viewer** - Text comparison
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Natural** - NLP library
- **Compromise** - Text parsing
- **OpenAI SDK** - GPT-4 integration
- **Anthropic SDK** - Claude integration
- **express-rate-limit** - Rate limiting

## 🛡️ Rate Limiting

API endpoints are rate-limited to:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## 🔐 Security

- CORS enabled with configurable origins
- Request size limits (10MB)
- Input validation on all endpoints
- API key protection via environment variables
- No sensitive data in client-side code

## 🚦 Error Handling

The application includes comprehensive error handling:
- Network failures
- API timeouts (60 seconds)
- Invalid input validation
- Missing API keys detection
- User-friendly error messages

## 📝 Development Scripts

```bash
# Install all dependencies
npm install

# Run both client and server in dev mode
npm run dev

# Run only server
npm run dev:server

# Run only client
npm run dev:client

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing Recommendations

Test with various text types:
- Academic papers
- Creative writing
- Technical documentation
- Blog posts
- AI-generated content from ChatGPT, Claude, etc.

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | One of OpenAI or Anthropic |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | One of OpenAI or Anthropic |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (default: 900000) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window (default: 100) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Natural library for NLP functionality
- Compromise for text parsing
- OpenAI and Anthropic for AI APIs
- React and Tailwind communities

## 📞 Support

For issues or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🔮 Future Enhancements

- [ ] File upload support (.txt, .docx, .pdf)
- [ ] Export results as PDF reports
- [ ] History tracking of analyzed texts
- [ ] Batch processing for multiple documents
- [ ] Chrome extension integration
- [ ] API authentication for production
- [ ] Caching layer for repeated analyses
- [ ] WebSocket for real-time progress
- [ ] Multi-language support
- [ ] Advanced AI model selection

---

**Built with ❤️ using React, TypeScript, and AI**
