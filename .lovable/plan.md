
## Footer Reels Highlight + Enhanced Reel Sharing

### What's Being Changed

Two goals:
1. Replace the "Games" section in the footer's Quick Links with a prominent **Reels** call-to-action that makes it feel like a core platform feature.
2. Improve the **Share** button inside `ReelPlayer` so students can easily share individual reels to WhatsApp, Instagram, Twitter/X, and LinkedIn — with a referral coin reward.

---

### Part 1 — Footer (`src/components/Footer.tsx`)

**Current state:** The Quick Links column has Events, Bounties, Jobs, Courses, Scholarships, Blogs. There is no Reels link.

**Changes:**
- Add **Reels** as a highlighted entry in Quick Links, styled with a gradient pink/purple badge (matching the Reels brand color) to make it stand out visually from other plain links.
- Add a separate **"🎬 Reels — Watch & Earn"** promotional block between the Quick Links column and the Social column. It will show:
  - A short tagline: *"Watch educational shorts, share yours & earn AITD Coins"*
  - A "Watch Reels →" CTA link
  - A "Share Your Reel →" CTA link (opens /reels with the submit dialog intent, via query param)
  - Coin earn badges: `+2 coins to watch`, `+10 coins to upload`

---

### Part 2 — Mobile Bottom Nav (`src/components/MobileBottomNav.tsx`)

**Current state:** Bottom bar shows Home, Events, Quiz, Jobs, More. Reels is buried in "More > Tools".

**Change:**
- Replace **Quiz** slot with **Reels** (using the `Video` icon) in the 4-item bottom nav bar so it's always one tap away on mobile. Quiz moves into the "More" sheet under a new "Explore" category (it already exists there as a full page).

---

### Part 3 — Enhanced Sharing in `ReelPlayer` (`src/components/reels/ReelPlayer.tsx`)

**Current state:** The Share button calls `navigator.share()` (native OS share sheet) or copies to clipboard. No platform-specific options. No referral coins.

**Changes:**
- Replace the single Share button with a **share panel** that slides up (small popover/bottom sheet) showing:
  - **WhatsApp** — pre-fills message: *"🎬 Check this out on AITD Reels: [title] [url]"*
  - **Twitter/X** — pre-fills tweet with title + link
  - **LinkedIn** — opens LinkedIn share
  - **Copy Link** — copies URL to clipboard with toast confirmation
- The platform URL will be the reel's page link: `https://aitdevents.lovable.app/reels?id=[reelId]` (so it's shareable and trackable)
- If the user is logged in, append `?ref=[first8ofUserId]` for referral tracking (consistent with existing referral system)
- Award **+1 AITD Coin** on share (using `POINT_VALUES.REEL_LIKE` = 1, calling `earnCoins`) — rewarded once per reel per user per platform

---

### Technical Details

**Files to modify:**

| File | Change |
|---|---|
| `src/components/Footer.tsx` | Add Reels highlighted link + promo block |
| `src/components/MobileBottomNav.tsx` | Swap Quiz → Reels in bottom 4-tab bar; move Quiz to More sheet |
| `src/components/reels/ReelPlayer.tsx` | Replace share handler with expandable share panel (WhatsApp, X, LinkedIn, Copy) + referral coin |

**No database changes** required — referral tracking reuses existing `earn_points` RPC and the existing referral URL convention.

**Coin reward on share:** The existing `earnCoins(1, "reel_like", ...)` call will be reused since it's already mapped server-side. Only triggered once per share action (not per platform tap — user picks one platform).
