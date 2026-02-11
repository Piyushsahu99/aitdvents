

# Enhanced Certificate & Badge System (Inspired by GiveMyCertificate)

## Overview
Upgrade the certificate system to be a professional credential platform with public shareable pages, one-click LinkedIn credential sharing with proper metadata, digital badges, and a polished verification experience.

## Key Features

### 1. Public Certificate Page (Shareable URL)
Create a dedicated public route `/certificate/:certificateNumber` that displays a beautifully rendered certificate anyone can view -- no login required. This is the link recipients share on social media and LinkedIn.

- Full certificate rendering with QR code, badge, and branding
- Verification status prominently displayed (green checkmark)
- One-click "Add to LinkedIn" and "Share" buttons on the page itself
- Open Graph meta tags so the link previews nicely when shared
- Clean URL format: `aitdevents.lovable.app/certificate/AITD-CERT-XXXXXXXX`

### 2. Improved LinkedIn Credential Integration
Fix and enhance the LinkedIn "Add to Profile" flow using LinkedIn's official Add-to-Profile URL format:

```text
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
  &name=AITD Events - [Certificate Type]
  &organizationName=AITD Events
  &issueYear=2026
  &issueMonth=2
  &certUrl=[public certificate page URL]
  &certId=AITD-CERT-XXXXXXXX
```

This lets users add the credential to their LinkedIn profile with proper organization name, certificate ID, and a clickable verification URL.

### 3. Digital Badges
Add badge support so certificates can also be represented as compact, shareable badge images:

- Badge variants: circular achievement badges for leaderboard ranks, event participation, course completion
- Badges rendered as downloadable images (PNG)
- Badge gallery on user profile

### 4. Enhanced Certificate Preview
Upgrade the certificate rendering with:
- Template-aware design (use template colors from the database)
- QR code linking to the new public certificate page
- Certificate type badge (Achievement, Participation, Completion, Membership)
- Signature area with "AITD Events" branding

### 5. Share Flow Improvements
- Direct share to LinkedIn with credential metadata (not just a generic post)
- Share to Twitter/X with certificate image preview
- Copy shareable link button
- Track shares in the database (`shared_to_linkedin`, `shared_to_twitter` columns already exist)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/CertificatePublic.tsx` | **Create** | Public certificate view page at `/certificate/:id` |
| `src/pages/Certificates.tsx` | Edit | Improve UI, better LinkedIn flow, add badge tab |
| `src/components/certificates/CertificatePreview.tsx` | Edit | Template-aware rendering, improved design |
| `src/components/certificates/DigitalBadge.tsx` | **Create** | Compact badge component for achievements |
| `src/components/certificates/ShareCertificatePanel.tsx` | **Create** | Reusable share panel with LinkedIn credential, Twitter, copy link |
| `src/App.tsx` | Edit | Add route for `/certificate/:certificateNumber` |

## Technical Details

### Public Certificate Route
- Route: `/certificate/:certificateNumber`
- Uses the existing `verify_certificate` RPC function (SECURITY DEFINER, returns only safe fields)
- No authentication required -- fully public
- Renders the certificate with share buttons

### LinkedIn Add-to-Profile URL Parameters
The LinkedIn integration will use these specific parameters:
- `name`: Certificate title (e.g., "AITD Events - Certificate of Excellence")
- `organizationName`: "AITD Events"
- `issueYear` / `issueMonth`: Extracted from `issue_date`
- `certUrl`: Public certificate page URL
- `certId`: The `certificate_number`

### Share Tracking
When a user shares to LinkedIn or Twitter, update the `issued_certificates` row:
- Set `shared_to_linkedin = true` or `shared_to_twitter = true`
- This uses the existing columns in the database

### Digital Badge Component
A compact circular/shield-shaped badge showing:
- Certificate type icon (trophy, award, star)
- Recipient name
- Issue date
- Downloadable as PNG via html2canvas

### Certificate Page Open Graph Tags
Update `index.html` or use `react-helmet` equivalent to set dynamic OG tags for certificate pages so shared links show a rich preview on social media.

