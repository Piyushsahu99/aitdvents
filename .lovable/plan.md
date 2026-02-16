

# HackSamarth 2026 - PPT Submission Page

## Overview
Create a dedicated landing page for **HackSamarth 2026** that showcases the hackathon details and directs participants to submit their PPTs via the Google Form. This page will serve as an onboarding funnel to bring users onto the AITD platform.

## What Will Be Built

### 1. Dedicated HackSamarth 2026 Page (`/hacksamarth`)
A visually striking landing page with:
- **Hero Section** - Bold banner with HackSamarth 2026 branding, tagline, and a prominent "Submit Your PPT" call-to-action button
- **About Section** - Brief description of HackSamarth 2026 and the PPT submission round
- **How It Works** - Step-by-step guide (Register on platform -> Prepare PPT -> Submit via form)
- **Submission Guidelines** - Rules, format requirements, deadlines for the PPT round
- **CTA Section** - Large button linking to the Google Form (`https://forms.gle/AjZr3XjvZvbjZJKLA`) that opens in a new tab
- **FAQ Section** - Common questions about the submission process

### 2. Navigation Integration
- Add "HackSamarth 2026" link in the Hackathons page as a featured/pinned hackathon
- Add route `/hacksamarth` to the app router

## Technical Details

### New Files
- `src/pages/HackSamarth.tsx` - The dedicated landing page component

### Modified Files
- `src/App.tsx` - Add the `/hacksamarth` route
- `src/pages/Hackathons.tsx` - Add a featured banner at the top linking to the HackSamarth page

### Design Approach
- Use existing UI components (Card, Badge, Button) for consistency
- Gradient backgrounds and animations matching the current theme
- Mobile-responsive layout
- The Google Form link (`https://forms.gle/AjZr3XjvZvbjZJKLA`) opens in a new tab on CTA button click
- Encourage users to sign up / log in on the platform before submitting (soft gate -- show AuthModal if not logged in, but still allow form access)

### No Database Changes Required
- The Google Form handles all submission data externally
- No new tables or migrations needed

