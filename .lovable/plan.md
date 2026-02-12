

# Improve UI, Theme, Navigation & Image Handling

## Overview
A comprehensive UI refresh across the homepage and key pages, with navigation improvements and standardized image sizing for a more polished, consistent experience.

---

## 1. Homepage UI Refresh

### Hero Section
- Tighten vertical spacing; reduce min-height on mobile to avoid excessive whitespace
- Make the mascot image slightly smaller on mobile (w-44 instead of w-52) to prevent it from dominating the viewport
- Add a subtle animated border/glow ring around the mascot for visual interest
- Improve the trust pills row with better wrapping on small screens

### Mission Section
- Reduce gap between mission cards on mobile for a denser, more app-like feel
- Add subtle icon background blurs for depth
- Tighten heading sizes for better mobile readability

### Quick Access Features
- Increase icon size slightly and add labels below for clearer tap targets
- Add a light background tint to the active/hovered feature card

### Featured Courses Section
- Standardize course thumbnail to `aspect-[16/10]` with `object-cover` for uniform card heights
- Add a fallback gradient when no thumbnail exists (currently uses placeholder.svg which looks broken)

### Events Section
- Standardize event card images to `aspect-[4/3]` consistently (already in EventCard but homepage has custom cards)
- Replace the inline homepage event cards with the reusable `EventCard` component for consistency

### Jobs Section
- Add company logo placeholder (colored initial circle) for visual interest
- Tighten card padding on mobile

### Games Arena
- Slightly reduce section padding on mobile
- Make game preview cards tappable with proper links

### Campus Ambassador & CTA
- No major changes needed, minor spacing tweaks

### Community/Leaderboard
- Reduce redundancy -- the stats appear twice (hero + community section). Remove the community stats grid and keep only the leaderboard

---

## 2. Navigation Improvements

### Top Navbar (`Navbar.tsx`)
- Reduce desktop button clutter: combine Profile/Dashboard into a single user avatar dropdown
- Add active indicator (bottom bar) animation for desktop nav links
- Improve mobile hamburger menu: add user avatar and name at the top when logged in
- Add a "Certificates" link under the Learning section in mobile menu

### Bottom Nav (`MobileBottomNav.tsx`)
- Add a subtle active indicator dot/pill beneath the active icon (currently just color change)
- Increase the bottom sheet height from 65vh to 70vh for more breathing room
- Add a search bar at the top of the "More" bottom sheet for quick navigation

---

## 3. Image Size Standardization

### Event Images
- All event cards (homepage + Events page): `aspect-[4/3]` with `object-cover` -- already in `EventCard.tsx`, but homepage renders custom cards. Fix by reusing `EventCard` or matching the aspect ratio.

### Course Thumbnails
- Standardize to `aspect-[16/10]` across homepage featured courses and Courses page
- Add a gradient fallback for missing thumbnails

### Job Cards
- No images currently, but add a colored company initial circle (first letter of company name) as a visual anchor

### General
- Add `loading="lazy"` to all off-screen images (most already have it)
- Ensure all images use `object-cover` to prevent stretching/gaps

---

## 4. Footer Enhancement
- Update copyright year from 2025 to 2026
- Add "Courses" and "Scholarships" to quick links
- Minor spacing adjustments

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Home.tsx` | Edit | Hero spacing, reuse EventCard, standardize image aspects, remove duplicate stats, tighten mobile spacing |
| `src/components/Navbar.tsx` | Edit | User avatar dropdown, add Certificates to learning, active link animation |
| `src/components/MobileBottomNav.tsx` | Edit | Active indicator pill, search bar in More sheet, height increase |
| `src/pages/Courses.tsx` | Edit | Standardize thumbnail aspect ratio, gradient fallback |
| `src/pages/Jobs.tsx` | Edit | Company initial avatar, minor card UI polish |
| `src/components/EventCard.tsx` | Edit | Minor polish -- ensure consistent border radius and shadow |
| `src/components/Footer.tsx` | Edit | Update year, add more quick links |
| `src/index.css` | Edit | Add active-indicator utility class, refine shadow tokens |

---

## Technical Details

### Image Aspect Ratio Strategy
All image containers will use Tailwind's `aspect-[ratio]` utility with `object-cover` and `overflow-hidden` to ensure:
- Consistent card heights in grids
- No image stretching or letterboxing
- Graceful fallback gradients when images are missing

### Navigation User Dropdown
Replace the separate Profile, Dashboard, and Logout buttons with a single avatar dropdown:
```text
[Avatar] v
  -- My Profile
  -- Dashboard  
  -- Admin (if admin)
  -- Sign Out
```

### Active Nav Indicator
Add an animated bottom border that slides to the active link using CSS transitions, replacing the current full-background highlight for a cleaner look on desktop.

### Company Initial Avatar (Jobs)
Generate a colored circle from the first letter of the company name:
```text
[B] Buildspace
[G] Google
```
Color is derived from a hash of the company name for consistency.

