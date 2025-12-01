# Macau Compass - Taro WeChat Mini Program Migration

## Overview

This project has been successfully migrated from a React SPA (using Vite) to a Taro-based WeChat Mini Program application. Taro allows us to write code once and deploy to multiple platforms including WeChat Mini Programs, H5, React Native, and more.

## Project Structure

```
macau-compass/
├── src/
│   ├── pages/              # Mini Program pages
│   │   ├── landing/        # Landing page
│   │   ├── dashboard/      # Business metrics dashboard
│   │   ├── industry/       # Industry analysis
│   │   ├── simulator/      # Business cost simulator
│   │   ├── trademarks/     # Trademark trends
│   │   ├── advisor/        # AI Strategy advisor
│   │   └── inspector/      # Store visual audit
│   ├── services/           # Business logic
│   │   ├── dataService.ts  # Macau data API integration
│   │   └── geminiService.ts # Google Gemini AI integration
│   ├── types.ts            # TypeScript type definitions
│   ├── app.tsx             # App component
│   ├── app.config.ts       # App configuration
│   ├── index.tsx           # Entry point
│   ├── app.scss            # Global styles
│   └── index.scss          # Index styles
├── public/                 # Static assets
├── config/                 # Build configurations
│   ├── dev.js             # Development config
│   └── prod.js            # Production config
├── taro.config.ts         # Taro build configuration
├── project.config.json    # WeChat Mini Program config
├── tsconfig.json          # TypeScript configuration
├── .babelrc               # Babel configuration
└── package.json           # Dependencies
```

## Key Migration Changes

### 1. **Framework Conversion**

**Before (React/Vite):**
```typescript
import React from 'react'
import { useState } from 'react'

const App = () => {
  const [count, setCount] = useState(0)
  return <div>{count}</div>
}
```

**After (Taro):**
```typescript
import React from 'react'
import { useState } from 'react'
import { View, Text } from '@tarojs/components'

const App = () => {
  const [count, setCount] = useState(0)
  return <View><Text>{count}</Text></View>
}
```

### 2. **Routing System**

**Before (Hash-based routing):**
```typescript
// window.location.hash = '#console'
```

**After (Page-based routing):**
```typescript
// src/app.config.ts - Define all pages
export default defineAppConfig({
  pages: [
    'pages/landing/index',
    'pages/dashboard/index',
    // ...
  ]
})

// Navigate to page
import Taro from '@tarojs/taro'
Taro.navigateTo({ url: '/pages/dashboard/index' })
```

### 3. **Styling**

- **Before:** Tailwind CSS (via CDN)
- **After:** Sass modules with rpx units (responsive pixel units)
- Mini Programs use rpx for responsive design (750px design width)

### 4. **API Requests**

**Before (fetch):**
```typescript
const response = await fetch(url)
const data = await response.json()
```

**After (Taro.request):**
```typescript
import Taro from '@tarojs/taro'
const response = await Taro.request({ url, method: 'GET' })
const data = response.data
```

### 5. **Storage**

**Before (localStorage):**
```typescript
localStorage.setItem('key', value)
const value = localStorage.getItem('key')
```

**After (Taro storage):**
```typescript
import Taro from '@tarojs/taro'
Taro.setStorageSync('key', value)
const value = Taro.getStorageSync('key')
```

### 6. **Lifecycle Hooks**

**Before (React useEffect):**
```typescript
useEffect(() => {
  // Component mounted
}, [])

useEffect(() => {
  // On visibility change
}, [])
```

**After (Taro lifecycle):**
```typescript
import { useDidShow, useDidHide } from '@tarojs/taro'

useDidShow(() => {
  // Page shown
})

useDidHide(() => {
  // Page hidden
})
```

## Pages and Features

### 1. Landing Page (`pages/landing/`)
- Entry point for the application
- Displays app features and call-to-action
- Navigates to dashboard

### 2. Dashboard (`pages/dashboard/`)
- Shows real-time business metrics
- Displays KPIs from Macau Open Data
- Navigation hub to other features

### 3. Industry Analysis (`pages/industry/`)
- Sector analysis
- Business market trends
- Industry growth metrics

### 4. Business Simulator (`pages/simulator/`)
- Cost calculation tool
- Financial modeling
- Risk assessment

### 5. Trademark Trends (`pages/trademarks/`)
- Application data visualization
- Historical trends
- Data from Macau Open Data Platform

### 6. AI Strategy Advisor (`pages/advisor/`)
- Chat interface with Gemini AI
- Business consultation
- Policy guidance
- Traditional Chinese output only

### 7. Store Inspector (`pages/inspector/`)
- AI-powered visual auditing
- Image upload and analysis
- Storefront assessment
- Visibility scoring and recommendations

## Services

### Data Service (`src/services/dataService.ts`)
- Fetches newly incorporated companies data from Macau DSEC API
- Retrieves trademark application trends from Macau Open Data
- Implements fallback mock data for API failures

### Gemini Service (`src/services/geminiService.ts`)
- Integrates Google Gemini AI API
- Two specialized modes:
  - Business Advisory (Policy guidance, regulations)
  - Site Inspector (Visual analysis of storefronts)
- Streams responses for real-time feedback

## Environment Variables

Set up in `.env.local` for development or in your WeChat platform dashboard for production:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

## Building and Deployment

### Development

```bash
# Install dependencies
npm install

# Start Taro development server for Mini Program
npm run dev
# or for H5
npm run dev:h5
```

### Production Build

```bash
# Build for WeChat Mini Program
npm run build

# Build for H5 (Web version)
npm run build:h5
```

### WeChat Developer Tools

1. Download WeChat Developer Tools from https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. Open the tools
3. Click "Import Project"
4. Select the project folder
5. Set `dist/` as the Mini Program root
6. Enter your WeChat Mini Program AppID
7. Click "Import"

The compiled code will be in the `dist/` folder ready for uploading to WeChat.

## Key Dependencies

- **@tarojs/react**: Taro React integration
- **@tarojs/taro**: Core Taro framework
- **@tarojs/components**: Native Mini Program components
- **@tarojs/api**: Mini Program APIs
- **@google/genai**: Google Generative AI API
- **react**: UI framework (^19.2.0)
- **typescript**: Type safety

## Configuration Files

- **taro.config.ts**: Taro build configuration (design width, compiler settings)
- **project.config.json**: WeChat Mini Program configuration
- **app.config.ts**: App-level configuration (pages, window style, permissions)
- **tsconfig.json**: TypeScript compiler options
- **.babelrc**: Babel configuration for JSX and TypeScript

## Important Notes

1. **Mini Program Size Limit**: WeChat Mini Programs have a 2MB code limit. Keep dependencies lean.
2. **Limited APIs**: Some browser/web APIs are not available in Mini Programs (no DOM APIs, limited CSS).
3. **Storage Size**: Taro storage is limited to ~10MB per key.
4. **Image Handling**: Images must be converted to base64 for Gemini API analysis.
5. **Network**: Mini Programs require HTTPS URLs for all API calls (must be registered in WeChat backend).

## Migration Checklist

- ✅ Project structure created
- ✅ Taro configuration set up
- ✅ Pages created (7 main pages)
- ✅ Services migrated and adapted
- ✅ Styling converted to Sass/rpx
- ✅ API request migration to Taro.request
- ✅ Storage migration to Taro storage
- ✅ Lifecycle hooks updated
- ✅ Routing configured via app.config.ts
- ✅ TypeScript configuration updated
- ✅ Environment variables documented
- ✅ WeChat project config created

## Next Steps

1. **Update AppID**: Replace `YOUR_APPID_HERE` in `project.config.json` with your WeChat Mini Program AppID
2. **Register API Domains**: Add API URLs in WeChat admin console (request/download domains)
3. **Test in WeChat DevTools**: Import dist/ folder and test locally
4. **Upload to WeChat**: Use WeChat DevTools to upload version to your backend
5. **Submit for Review**: Submit to WeChat for official review and release

## Troubleshooting

### Build Errors
- Ensure all TypeScript files are in `src/` directory
- Check that `src/app.config.ts` is properly formatted
- Verify all page paths in `app.config.ts` match actual page locations

### Runtime Errors
- Check browser console for Taro-specific errors
- Verify environment variables are set correctly
- Ensure API URLs are whitelisted in WeChat Mini Program admin console

### API Issues
- Verify API requests use HTTP/HTTPS allowed in WeChat
- Check CORS headers (Mini Programs bypass traditional CORS)
- Validate response data format matches expected types

## Additional Resources

- [Taro Documentation](https://taro.zone/)
- [WeChat Mini Program Documentation](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro Component Library](https://taro-ui.jd.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Macau Data Platform](https://data.gov.mo/)
