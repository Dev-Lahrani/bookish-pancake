# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm package manager
- OpenAI API key OR Anthropic API key

## Installation (5 minutes)

### Option 1: Using Setup Script (Recommended)
```bash
cd "/home/dev-lahrani/Desktop/Projects/AI Plagarism Detector and Humanizer"
./setup.sh
```

### Option 2: Manual Installation
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your API key
# OPENAI_API_KEY=sk-your-key-here
# OR
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# 4. Build shared types
npm run build --workspace=shared

# 5. Start development servers
npm run dev
```

## Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Quick Test

### Test Plagiarism Checker
1. Open http://localhost:5173
2. Click "Plagiarism Checker" tab
3. Paste this sample AI-generated text:
```
It's important to note that artificial intelligence has become increasingly prevalent in today's digital age. Furthermore, it is crucial to understand that AI systems delve into vast datasets to generate content. Moreover, the landscape of AI-generated text continues to evolve rapidly.
```
4. Click "Analyze Text"
5. View the high AI detection score!

### Test Humanizer
1. Click "Humanizer" tab
2. Paste the same text
3. Select:
   - Tone: Casual
   - Intensity: Medium
4. Click "Humanize Text"
5. Compare the original and humanized versions!

## Common Commands

```bash
# Start both client and server
npm run dev

# Start only server
npm run dev:server

# Start only client
npm run dev:client

# Build for production
npm run build

# Run production server
npm start
```

## Troubleshooting

### "Analysis failed"
- Check that server is running on port 3001
- Verify text is at least 50 characters

### "Humanization failed - API key error"
- Make sure .env file exists in root directory
- Verify API key is correct (starts with sk-)
- Check you have one of: OPENAI_API_KEY or ANTHROPIC_API_KEY

### Port already in use
- Change PORT in .env file
- Or kill the process using the port

### Build errors
- Run: `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`
- Build shared package: `npm run build --workspace=shared`

## Project Structure Quick Reference

```
/
├── client/src/
│   ├── components/        # React components
│   │   ├── PlagiarismChecker.tsx
│   │   ├── Humanizer.tsx
│   │   ├── MetricsCard.tsx
│   │   └── TextComparison.tsx
│   ├── services/
│   │   └── api.ts        # API calls
│   └── App.tsx           # Main app
│
├── server/src/
│   ├── routes/           # API endpoints
│   ├── services/         # AI integration
│   └── utils/            # Analysis algorithms
│
└── shared/src/
    └── types.ts          # Shared types
```

## API Testing with curl

### Analyze Text
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text to analyze here. Make sure it is at least 50 characters long for the analysis to work properly."}'
```

### Humanize Text
```bash
curl -X POST http://localhost:3001/api/humanize \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Your AI-generated text here that needs to be humanized.",
    "options":{
      "tone":"professional",
      "intensity":"medium",
      "preserveTechnical":false,
      "addPersonalTouches":false
    }
  }'
```

## Environment Variables

Required in `.env`:
```env
# At least one API key required
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Optional
PORT=3001
NODE_ENV=development
```

## Getting API Keys

### OpenAI (GPT-4)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into .env

### Anthropic (Claude)
1. Go to https://console.anthropic.com/
2. Create API key
3. Copy and paste into .env

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture details
3. Customize the UI in `client/src/components/`
4. Adjust analysis algorithms in `server/src/utils/analyzer.ts`
5. Add new features!

## Getting Help

- Check console for error messages
- Review server logs in terminal
- Inspect network requests in browser DevTools
- Read inline code comments
- Check GitHub issues

## Performance Tips

- Use Chrome/Edge for best performance
- Analysis is fastest with 100-1000 word texts
- Humanization takes 10-30 seconds depending on length
- Dark mode reduces eye strain for long sessions

## Security Notes

- Never commit .env file to git
- Keep API keys private
- Rate limiting is enabled (100 req/15min)
- Input is validated on backend

---

**Ready to start? Run `npm run dev` and open http://localhost:5173** 🎉
