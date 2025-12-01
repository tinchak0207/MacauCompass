# Deployment Guide - Macau Compass WeChat Mini Program

## Prerequisites

1. **WeChat Mini Program Account**: Create an account at https://mp.weixin.qq.com/
2. **Developer Tools**: Download WeChat Developer Tools from https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
3. **AppID**: Get your AppID from WeChat MP Admin Console
4. **API Credentials**: 
   - Google Gemini API Key from https://aistudio.google.com/app/apikey
   - Macau Open Data is publicly accessible (no credentials needed)

## Local Development Setup

### 1. Install Dependencies

```bash
cd /path/to/macau-compass
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Update WeChat AppID

Edit `project.config.json`:

```json
{
  "appid": "your_wechat_appid",
  "projectname": "macau-compass",
  ...
}
```

### 4. Start Development Server

For Mini Program development:
```bash
npm run dev
```

The Taro development server will start watching for changes and recompile the Mini Program code into `dist/`.

## Building for Production

### 1. Build the Project

```bash
npm run build
```

This compiles the entire project and outputs to the `dist/` directory in Mini Program format.

### 2. Verify Build Output

Check that `dist/` contains:
- `app.js` - App entry point
- `app.json` - App configuration
- `app.wxss` - App styles
- `pages/` - Individual page files
- `components/` - Component files
- `services/` - Service layer code

## WeChat Developer Tools Setup

### 1. Import Project

1. Open WeChat Developer Tools
2. Click "Import Project"
3. Set:
   - **Project Path**: `/path/to/macau-compass`
   - **AppID**: Your WeChat Mini Program AppID
   - **Project Name**: Macau Compass
   - **Backend Service**: (leave empty if testing locally)

### 2. Configure Mini Program Root

1. In Developer Tools settings
2. Set **Mini Program Root Directory**: `dist`
3. Save settings

### 3. Test Locally

1. Click "Compile" to test the current build
2. Use the "Preview" button to generate QR code for mobile testing
3. Scan with WeChat to test on actual device

## API Configuration in WeChat Console

### 1. Register Request Domains

In WeChat MP Admin Console → Settings → Development Settings:

Add these request domains:
- `https://dsec.apigateway.data.gov.mo` - Macau company data
- `https://api.data.gov.mo` - Macau trademark data
- `https://generativelanguage.googleapis.com` - Google Gemini API

### 2. Register Download Domains (if needed)

For image handling:
- Leave empty if using inline base64 for Gemini analysis

### 3. Configure Socket Domains (if needed)

For real-time features:
- Leave empty for now (not required for current features)

## Environment Variables in Production

### Option 1: Build-time Configuration

1. Create `.env.production` file:
```bash
VITE_GEMINI_API_KEY=your_production_key
```

2. Build with production environment:
```bash
npm run build
```

### Option 2: WeChat Server Configuration

Alternatively, configure API keys directly in WeChat backend if available.

## Uploading to WeChat Platform

### 1. Prepare for Upload

1. Ensure `dist/` directory is complete
2. Verify all API domains are configured in WeChat console
3. Test thoroughly in Developer Tools

### 2. Upload Version

In Developer Tools:
1. Click "Upload"
2. Select version type (development, trial, official)
3. Enter version number (e.g., 1.0.0)
4. Enter release notes in Chinese
5. Click "Upload"

### 3. Submit for Review

In WeChat MP Admin Console:
1. Go to Version Management
2. Click "Submit Review" next to your uploaded version
3. Fill in review notes and test account (if needed)
4. Submit for review

Typical review time: 1-7 business days

### 4. Release

After review approval:
1. In Version Management, click "Release"
2. Confirm release to all users
3. Your Mini Program is now live!

## Build Variations

### For Different Channels

Taro supports building for multiple platforms:

```bash
# Build for WeChat Mini Program (default)
npm run build

# Build for H5 (Web version)
npm run build:h5

# Build for other platforms (if configured)
npm run build:alipay
npm run build:swan
```

## Monitoring and Analytics

### Enable Analytics in WeChat Console

1. Access Insight (实时数据) in MP Admin Console
2. Monitor:
   - Daily active users
   - Page views
   - Performance metrics
   - Error logs
   - User feedback

### Debug Remote Issues

In WeChat Developer Tools:
1. Enable Remote Debugging (if available)
2. Connect to production Mini Program
3. Monitor console logs and network requests
4. Fix issues and redeploy

## Troubleshooting Deployment

### Build Issues

**Error: ENOENT: no such file or directory**
- Ensure all page files exist in `src/pages/`
- Check that `src/app.config.ts` lists all pages

**Error: Cannot find module '@tarojs/...'**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

**TypeScript errors**
- Check `src/vite-env.d.ts` for correct type definitions
- Verify `tsconfig.json` includes all necessary paths

### Runtime Issues in Mini Program

**API requests fail with 403 or CORS error**
- Verify domains are registered in WeChat console
- Check API URLs are HTTPS
- Ensure API accepts requests from WeChat

**Blank page or loading forever**
- Check `app.config.ts` pages list matches actual files
- Enable remote debugging to see console errors
- Verify `dist/` folder was built correctly

**Large file size**
- Use `npm run build` and check console for warnings
- Remove unused dependencies from `package.json`
- Consider lazy loading components

### Feature Issues

**AI Advisor not responding**
- Verify `VITE_GEMINI_API_KEY` is configured
- Check Google Gemini API quota and billing
- Test API key directly on Google AI Studio

**Data not loading**
- Check network requests in Developer Tools
- Verify Macau data API domains are registered
- Fallback mock data should display if APIs fail

**Store Inspector image upload fails**
- Check camera permission is requested
- Verify file size is reasonable
- Ensure image is valid format (JPEG, PNG)

## Performance Optimization

### Code Splitting

Taro automatically splits code per page. Monitor bundle size:
```bash
npm run build 2>&1 | grep "size"
```

### Lazy Loading

Pages are lazy-loaded by default. Main app bundle should be < 500KB.

### Caching

Mini Programs cache resources by default. Users may need to:
1. Clear Mini Program cache in WeChat
2. Update to latest version (notify users to pull-down refresh)

## Rollback Plan

If issues occur after release:

1. **Minor Issues**: Upload new version with fixes
2. **Critical Issues**: 
   - In MP Admin Console, click "Rollback" next to previous stable version
   - Users will see the previous version on next app restart
   - Publish fixes and re-upload

## Continuous Deployment (CI/CD)

For automated deployments, integrate with GitHub Actions:

Example workflow (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to WeChat Mini Program

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Upload to WeChat
        # Use WeChat CLI tool for automated upload
        run: npm run deploy:wechat
```

Requires: WeChat Mini Program CLI configured with credentials.

## Support and Resources

- **Taro Docs**: https://taro.zone/
- **WeChat Mini Program Docs**: https://developers.weixin.qq.com/miniprogram/
- **Macau Data Platform**: https://data.gov.mo/
- **Google Gemini API Docs**: https://ai.google.dev/

## Next Steps

1. ✅ Set up local development environment
2. ✅ Build the project
3. ✅ Test in WeChat Developer Tools
4. ✅ Configure API domains in WeChat console
5. ✅ Upload version to WeChat platform
6. ✅ Submit for review
7. ✅ Release to users
8. ✅ Monitor analytics and user feedback
9. ✅ Plan updates and improvements
