# Macau Compass - WeChat Mini Program

A comprehensive entrepreneurship platform for Macau, now available as a **WeChat Mini Program** using Taro, with original H5 web version support.

Features:
- 📊 **Business Dashboard**: Real-time company registration and trademark application data
- 🏪 **Store Inspector**: AI-powered visual site auditing with Gemini Vision
- 💡 **AI Strategy Advisor**: Policy guidance and business consultation with Gemini
- 🎯 **Business Simulator**: Cost analysis and financial planning tool
- 📈 **Industry Analytics**: Market trends and sector analysis
- 🌐 **Multi-platform**: WeChat Mini Program, H5 Web, and more via Taro

## Platform Support

| Platform | Status | Build Command |
|----------|--------|---------------|
| WeChat Mini Program | ✅ Primary | `npm run build` |
| H5 (Web) | ✅ Supported | `npm run build:h5` |
| React (Legacy) | ⚠️ Migrated | Use git history |

## Quick Start - Development

### Prerequisites
- Node.js 18+
- npm or yarn
- WeChat Developer Tools (for Mini Program testing)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` with API key:**
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Get your key from: https://aistudio.google.com/app/apikey

3. **Start development server:**

   For Mini Program development:
   ```bash
   npm run dev
   ```

   This starts Taro's development server and compiles to `dist/` folder.

4. **Test in WeChat Developer Tools:**
   - Download: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - Open Developer Tools → Import Project
   - Select project folder
   - Set Mini Program root to `dist/`
   - Enter your WeChat AppID
   - Click Compile to preview

## Production Deployment

### Build for Mini Program

```bash
npm run build
```

Output: `dist/` folder ready for WeChat Mini Program console

### Build for H5 (Web)

```bash
npm run build:h5
```

Output: `dist/h5/` folder ready for web hosting (Vercel, Netlify, etc.)

### Deploy WeChat Mini Program

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Uploading to WeChat console
- Configuring API domains
- Submitting for review
- Releasing to users

## Project Structure

```
src/
├── pages/              # Mini Program pages
│   ├── landing/        # Entry page
│   ├── dashboard/      # Business metrics
│   ├── industry/       # Industry analysis
│   ├── simulator/      # Cost calculator
│   ├── trademarks/     # Trademark trends
│   ├── advisor/        # AI consultant
│   └── inspector/      # Store auditor
├── services/           # Business logic
│   ├── dataService.ts  # Macau data APIs
│   └── geminiService.ts # AI integration
├── types.ts            # TypeScript definitions
├── app.tsx             # App component
├── app.config.ts       # App configuration
└── index.tsx           # Entry point
```

## Key Features

### 1. Real-time Business Data
- Company registration trends via Macau DSEC API
- Trademark applications from Macau Open Data
- Automatic fallback to mock data on API failures

### 2. AI Strategy Advisor
- Chat interface with Gemini AI
- Traditional Chinese (繁體中文) responses
- Policy guidance and business consultation
- Real-time streaming responses

### 3. Store Inspector
- Image upload and AI analysis
- Visibility scoring (0-100)
- Condition assessment with hidden issue detection
- Industry fit recommendations
- Risk factor identification

### 4. Business Simulator
- Cost calculation based on:
  - Shop size (square feet)
  - Employee count
  - Macau rental and salary data
  - Renovation budget

### 5. Market Analytics
- Industry heatmap
- Trademark trend visualization
- Growth metrics and comparisons

## Configuration Files

| File | Purpose |
|------|---------|
| `taro.config.ts` | Taro build configuration |
| `project.config.json` | WeChat Mini Program settings |
| `src/app.config.ts` | App routes and window style |
| `tsconfig.json` | TypeScript compiler options |
| `.babelrc` | Babel/JSX compilation config |

## Environment Variables

```bash
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

Required for AI features:
- Store Inspector image analysis
- AI Strategy Advisor conversation

## API Integration

### Macau Open Data APIs
- **Company Data**: https://dsec.apigateway.data.gov.mo/
- **Trademark Data**: https://api.data.gov.mo/

No authentication required - public APIs.

### Google Gemini AI
- **Endpoint**: generativelanguage.googleapis.com
- **Models**: gemini-2.0-flash-001, gemini-2.5-flash
- **Requires**: API key (set in environment)

## Styling

- **Framework**: Sass with rpx units (responsive pixels)
- **Design Width**: 750px (Mini Program standard)
- **Color Scheme**: Dark theme (#050505 background, emerald/blue accents)
- **Components**: Custom styled per page, no external UI library

## Browser/Platform Support

### Mini Program
- WeChat iOS 8.0+
- WeChat Android 8.0+

### H5 Web
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

## Troubleshooting

### Development

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Build fails:**
```bash
# Clean build cache
rm -rf node_modules dist
npm install
npm run build
```

**API not responding:**
- Check network in DevTools
- Verify domains are whitelisted in WeChat console
- Check API rate limits

### Mini Program Issues

See [TARO_MIGRATION.md](./TARO_MIGRATION.md) for migration-specific troubleshooting.

## Documentation

- [Taro Migration Guide](./TARO_MIGRATION.md) - Technical details of React → Taro conversion
- [Deployment Guide](./DEPLOYMENT.md) - WeChat Mini Program deployment steps
- [Taro Official Docs](https://taro.zone/)
- [WeChat Mini Program Docs](https://developers.weixin.qq.com/miniprogram/)

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Taro | 3.6.0 | Cross-platform framework |
| React | 19.2.0 | UI library |
| TypeScript | 5.8.2 | Type safety |
| Sass | Latest | Styling |
| Google Gemini API | Latest | AI features |

## Performance

- **Mini Program Size**: < 2MB (Mini Program limit)
- **Load Time**: ~2-3 seconds on 4G
- **API Response**: < 3 seconds (with fallback data)

## License

MIT

## Support

- **Issues**: Check existing GitHub issues or create new one
- **Documentation**: See [TARO_MIGRATION.md](./TARO_MIGRATION.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Community**: [Taro Community](https://github.com/NervJS/taro/discussions)

---

**Last Updated**: December 2024  
**Version**: 4.0 (Taro WeChat Mini Program)  
**Status**: Production Ready ✅
