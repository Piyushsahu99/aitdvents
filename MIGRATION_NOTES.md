# Migration Notes - Removing Lovable References

## Changes Made

### 1. Documentation Updates

#### README.md
- Changed project title from "Welcome to your Lovable project" to "AITD Events Platform"
- Removed Lovable project URL references
- Updated deployment section with generic hosting options (Vercel, Netlify, AWS, Firebase)
- Added build instructions for production

#### ADMIN_SETUP.md
- Changed "Lovable AI" references to "Google Gemini 2.5 Flash" API
- Removed Lovable-specific action tags (`<lov-actions>`)
- Updated footer from "Lovable Cloud + Lovable AI" to "Supabase + Google Gemini AI"
- Replaced backend links with generic Supabase dashboard references

### 2. Code Changes

#### vite.config.ts
- Removed `lovable-tagger` import
- Simplified plugin configuration to only include React plugin
- Removed development mode check for componentTagger

#### package.json
- Removed `lovable-tagger` from devDependencies
- Updated package name from `vite_react_shadcn_ts` to `aitd-events-platform`
- Updated version from `0.0.0` to `1.0.0`

#### src/pages/About.tsx
- Updated CodeMatrix hackathon link from `codematrix-genesis-site.lovable.app` to `codematrix-genesis.aitdevents.com`

### 3. Edge Functions Updates

All Supabase Edge Functions have been updated to use generic environment variable names:

#### supabase/functions/ai-chat/index.ts
- Changed `LOVABLE_API_KEY` to `GEMINI_API_KEY`
- Added fallback support for old `LOVABLE_API_KEY` variable during transition
- Updated error messages to reference `GEMINI_API_KEY`

#### supabase/functions/generate-content/index.ts
- Changed `LOVABLE_API_KEY` to `GEMINI_API_KEY`
- Added fallback support for old `LOVABLE_API_KEY` variable during transition
- Updated error messages to reference `GEMINI_API_KEY`

#### supabase/functions/generate-poster/index.ts
- Changed `LOVABLE_API_KEY` to `GEMINI_API_KEY`
- Added fallback support for old `LOVABLE_API_KEY` variable during transition
- Updated error messages to reference `GEMINI_API_KEY`

#### supabase/functions/send-certificate/index.ts
- Updated certificate verification URLs from `aitdevents.lovable.app` to `aitdevents.com`
- Updated both regular certificate emails and leaderboard certificate emails

## Required Actions

### 1. Environment Variables (IMPORTANT!)

You need to update your Supabase Edge Functions environment variables:

**Option A: Rename the existing variable**
```bash
# In your Supabase dashboard, go to Project Settings > Edge Functions
# Rename LOVABLE_API_KEY to GEMINI_API_KEY
```

**Option B: Add new variable (recommended for smooth transition)**
```bash
# Keep LOVABLE_API_KEY temporarily and add:
GEMINI_API_KEY=your_api_key_here
# Once verified working, you can remove LOVABLE_API_KEY
```

The code currently supports both variable names for backward compatibility.

### 2. Dependencies Cleanup

Run the following to clean up your dependencies:

```bash
# Remove node_modules and lockfiles
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### 3. Verify Build

Test that the project builds successfully:

```bash
npm run build
```

### 4. Update Environment Variables (if needed)

If you have any `.env` files with Lovable references, update them to use generic names.

### 5. Domain Updates

The following domains need to be updated if you're using them:
- `codematrix-genesis-site.lovable.app` → `codematrix-genesis.aitdevents.com`
- `aitdevents.lovable.app` → `aitdevents.com`

Make sure DNS records are properly configured for the new domains.

## API Gateway Note

**IMPORTANT:** The code still uses `https://ai.gateway.lovable.dev/v1/chat/completions` as the API endpoint. This is the Lovable AI Gateway that provides access to Google Gemini models.

If you need to migrate to direct Gemini API access, you would need to:
1. Get a Google AI API key from https://makersuite.google.com/app/apikey
2. Update the endpoint to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
3. Modify the request/response format to match Google's API structure

However, using the Lovable AI Gateway is fine if it continues to work, as it's just an API proxy service.

## Testing Checklist

- [ ] Application builds successfully
- [ ] Development server runs without errors
- [ ] Admin dashboard AI features work (blog generation, hashtags, posters)
- [ ] AI chat functionality works
- [ ] Certificate emails are sent with correct URLs
- [ ] All documentation is updated
- [ ] No console errors related to missing dependencies

## Rollback Plan

If you need to rollback:

1. Revert the git changes:
   ```bash
   git checkout HEAD -- .
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Keep using `LOVABLE_API_KEY` environment variable name

## Support

If you encounter issues after migration:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify environment variables are set correctly
4. Ensure all dependencies installed correctly

---

**Migration completed on:** 2026-01-26
**Original builder:** Lovable
**Current maintainer:** AITD Events Team
