

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1X5--mdP9ok5sSyF9AExF9axgtCRGS3-Q

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and set your Gemini API key:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository in Vercel

3. **Configure Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add a new variable:
     - **Name**: `VITE_GEMINI_API_KEY`
     - **Value**: Your Gemini API key from https://aistudio.google.com/app/apikey
     - **Environments**: Check all (Production, Preview, Development)

4. Deploy!

**Important:** The environment variable MUST be named `VITE_GEMINI_API_KEY` (with the `VITE_` prefix) for Vite to expose it to the client-side application.
