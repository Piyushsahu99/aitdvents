

# Games Arena Expansion - Implementation Plan
## Adding Spin & Win, Lucky Draw, and IPL Auction Games

---

## Overview

This implementation adds three new interactive games to the existing Games Arena hub at `/quiz`:

1. **Spin & Win** - Animated prize wheel with AITD Coins rewards
2. **Lucky Draw** - Fair random winner selection with verifiable results
3. **IPL Auction** - Virtual cricket auction with 200+ real players and unlimited participation

All games integrate with the existing AITD Coins economy and feature celebration animations.

---

## Phase 1: Database Schema

### New Tables

| Table | Purpose |
|-------|---------|
| `spin_wheels` | Configurable wheel settings and themes |
| `spin_wheel_segments` | Prize segments with probabilities |
| `spin_results` | User spin history |
| `lucky_draws` | Draw configurations and status |
| `lucky_draw_entries` | Participant entries |
| `lucky_draw_winners` | Selected winners with verification hash |
| `ipl_players` | 200+ cricket players with photos and stats |
| `ipl_auctions` | Auction room configurations |
| `auction_teams` | User teams with virtual budgets |
| `auction_bids` | Real-time bidding history |
| `auction_sold_players` | Players purchased by teams |

### Key Schema Details

**Spin Wheels:**
- Configurable cost per spin (AITD coins)
- Daily/total spin limits
- Weighted probability segments
- Jackpot markers

**Lucky Draw:**
- Multiple draw types (random/weighted)
- Scheduled draws with countdown
- SHA-256 verification hash for fairness
- Multiple winner support

**IPL Auction:**
- Virtual currency (separate from AITD coins)
- Team size constraints
- Real-time bid tracking
- Player categories (Platinum/Gold/Silver/Bronze)

---

## Phase 2: Spin & Win Game

### Features
- Animated spinning wheel using CSS transforms and framer-motion
- 6-12 configurable prize segments
- Daily free spins + coin-based additional spins
- Jackpot celebrations with fireworks confetti
- Spin history tracking

### New Files
```
src/pages/SpinWheel.tsx
src/components/games/SpinWheelCanvas.tsx
src/components/games/SpinWheelResult.tsx
src/hooks/useSpinWheel.ts
```

### Animation Details
- CSS `transform: rotate()` with framer-motion
- 4-6 second spin duration with easing
- Result pre-calculated server-side for fairness
- Confetti explosion on prize reveal

---

## Phase 3: Lucky Draw Game

### Features
- Fair cryptographic random selection
- Entry modes: free, coin-based, or action-based
- Scheduled draws with countdown timers
- Live winner announcement with dramatic reveal
- Verification page for transparency

### New Files
```
src/pages/LuckyDraw.tsx
src/components/games/LuckyDrawCard.tsx
src/components/games/LuckyDrawLive.tsx
src/components/games/LuckyDrawWinners.tsx
src/hooks/useLuckyDraw.ts
```

### Winner Selection Algorithm
1. Collect all valid entries at draw time
2. Generate cryptographic seed (timestamp + entries hash)
3. Use Fisher-Yates shuffle with seed
4. Select top N winners
5. Store verification hash for audit

---

## Phase 4: IPL Auction Game

### Features
- 200+ IPL cricket players with real photos and stats
- Virtual budget (85Cr per team by default)
- Real-time bidding with Supabase Realtime
- Player categories: Platinum, Gold, Silver, Bronze
- Team composition rules
- Animated "SOLD!" celebrations

### New Files
```
src/pages/IPLAuction.tsx
src/pages/CreateAuction.tsx
src/components/games/AuctionLobby.tsx
src/components/games/AuctionRoom.tsx
src/components/games/PlayerCard.tsx
src/components/games/BidPanel.tsx
src/components/games/TeamRoster.tsx
src/components/games/AuctionResults.tsx
src/hooks/useAuctionRealtime.ts
src/data/iplPlayers.ts
```

### Sample Player Data
```
{
  name: "Virat Kohli",
  role: "Batsman",
  team: "Royal Challengers Bangalore",
  nationality: "India",
  photo_url: "/images/ipl/virat-kohli.jpg",
  base_price: 200000000, // 2 Cr (virtual)
  category: "Platinum",
  stats: {
    matches: 237,
    runs: 7263,
    average: 37.25,
    strike_rate: 129.95
  }
}
```

### Real-time Features
- Supabase Realtime for instant bid updates
- Presence API for active participants
- Auto-pass after timeout
- Host controls: pause, skip, extend time

---

## Phase 5: Celebration Animations

### New Confetti Types
| Type | Effect | Trigger |
|------|--------|---------|
| `spinWin` | Spiral confetti | Wheel prize reveal |
| `jackpot` | Golden coins shower | Jackpot win |
| `luckyDraw` | Spotlight + burst | Winner announcement |
| `auctionSold` | Hammer + money rain | Player sold |
| `teamComplete` | Stadium celebration | Squad completed |

---

## Phase 6: Games Hub Updates

### Changes to `/quiz` Page
- Update game cards from "Coming Soon" to active
- Add navigation to new game pages
- Show live player counts for each game
- Add quick join codes support

---

## File Changes Summary

### New Pages
- `src/pages/SpinWheel.tsx`
- `src/pages/LuckyDraw.tsx`
- `src/pages/IPLAuction.tsx`
- `src/pages/CreateAuction.tsx`

### New Components (12 files)
- `src/components/games/SpinWheelCanvas.tsx`
- `src/components/games/SpinWheelResult.tsx`
- `src/components/games/LuckyDrawCard.tsx`
- `src/components/games/LuckyDrawLive.tsx`
- `src/components/games/LuckyDrawWinners.tsx`
- `src/components/games/AuctionLobby.tsx`
- `src/components/games/AuctionRoom.tsx`
- `src/components/games/PlayerCard.tsx`
- `src/components/games/BidPanel.tsx`
- `src/components/games/TeamRoster.tsx`
- `src/components/games/AuctionResults.tsx`
- `src/components/games/AuctionCountdown.tsx`

### New Hooks
- `src/hooks/useSpinWheel.ts`
- `src/hooks/useLuckyDraw.ts`
- `src/hooks/useAuctionRealtime.ts`

### New Data
- `src/data/iplPlayers.ts` (200+ players with stats)

### Modified Files
- `src/App.tsx` - Add routes for new pages
- `src/pages/Quiz.tsx` - Update game cards to active with links
- `src/components/quiz/ConfettiEffect.tsx` - Add new celebration types

### Database Migration
- Create 11 new tables for games
- Enable RLS policies
- Enable Realtime for auction_bids table
- Add storage bucket for player photos

---

## Implementation Order

1. **Database Migration** - Create all tables with RLS
2. **Confetti Enhancements** - Add new celebration types
3. **Spin & Win** - Complete wheel game
4. **Lucky Draw** - Random selection system
5. **IPL Players Data** - Seed player database
6. **IPL Auction** - Real-time bidding system
7. **Games Hub Updates** - Connect all games
8. **Testing & Polish** - Animations and mobile responsiveness

---

## Technical Notes

- All games use virtual currency (except Spin & Win which uses AITD coins)
- IPL Auction budgets are isolated per auction room
- Lucky Draw uses SHA-256 for verifiable fairness
- Real-time updates via Supabase Realtime channels
- Mobile-first responsive design throughout

