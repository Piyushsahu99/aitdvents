
# Live Quiz System Implementation Plan

## Overview

Build a comprehensive real-time quiz platform (similar to Kahoot/Slido) that enables brands and event organizers to create interactive quizzes where participants can join via QR code or unique ID, compete in real-time, and winners receive certificates.

## Core Features

### For Quiz Hosts (Admin/Brand)
- Create and manage quiz sessions with custom questions
- Generate shareable QR codes and unique quiz IDs
- Control quiz flow (start, pause, next question, end)
- View live participant count and leaderboard
- Award prizes/certificates to winners
- Associate quizzes with events

### For Participants (Students)
- Join quiz via QR code scan or quiz ID
- Enter name (no login required for participation)
- Answer questions within time limit
- See live position on leaderboard
- Receive certificates for winning positions

---

## Database Schema

### New Tables Required

```text
+----------------------+     +------------------------+     +----------------------+
|      quizzes         |     |    quiz_questions      |     |   quiz_participants  |
+----------------------+     +------------------------+     +----------------------+
| id (uuid, PK)        |     | id (uuid, PK)          |     | id (uuid, PK)        |
| title                |---->| quiz_id (FK)           |     | quiz_id (FK)         |
| description          |     | question_text          |     | user_id (nullable)   |
| created_by (FK)      |     | options (jsonb[])      |     | participant_name     |
| event_id (FK, null)  |     | correct_option_index   |     | joined_at            |
| status (enum)        |     | time_limit_seconds     |     | total_score          |
| quiz_code (unique)   |     | points                 |     | final_rank           |
| max_participants     |     | order_index            |     | device_id (unique)   |
| current_question_idx |     | image_url (nullable)   |     +----------------------+
| starts_at            |     +------------------------+
| created_at           |                |
+----------------------+                v
                               +------------------------+
                               | quiz_participant_answers|
                               +------------------------+
                               | id (uuid, PK)          |
                               | participant_id (FK)    |
                               | question_id (FK)       |
                               | selected_option_index  |
                               | answered_at            |
                               | is_correct             |
                               | time_taken_ms          |
                               | points_earned          |
                               +------------------------+
```

### Quiz Status Enum
- `draft` - Quiz is being created
- `waiting` - Lobby open, participants can join
- `active` - Quiz in progress
- `question_active` - Current question being answered
- `question_ended` - Showing results for current question
- `completed` - Quiz finished, showing final results

---

## Technical Implementation

### Phase 1: Database Setup
1. Create `quizzes` table with quiz metadata and status tracking
2. Create `quiz_questions` table with question content and options
3. Create `quiz_participants` table for tracking who joined
4. Create `quiz_participant_answers` table for answer tracking
5. Add RLS policies for proper access control
6. Enable Realtime on relevant tables for live updates

### Phase 2: Admin Quiz Management
Create new admin component `QuizManager.tsx`:
- Quiz creation form (title, description, link to event)
- Question builder with:
  - Multiple choice options (2-4 options)
  - Time limit per question (5-60 seconds)
  - Points value
  - Optional image upload
- Quiz settings (max participants, scheduled start time)
- Generated QR code and shareable link

### Phase 3: Quiz Host Control Panel
Create `QuizHostControl.tsx` component:
- Live participant counter with names
- Start quiz button (transitions from waiting to active)
- Next question control
- Current question display with timer
- Real-time answer distribution chart
- Live leaderboard (top 10)
- End quiz and view final results

### Phase 4: Participant Experience
Create new page `src/pages/Quiz.tsx`:
- Join screen with QR scanner or code input
- Name entry (no login required)
- Waiting lobby with participant count
- Question display with countdown timer
- Answer selection (disabled after time expires)
- Score animation after each question
- Position updates on leaderboard
- Final ranking screen

### Phase 5: Real-time Features
Leverage existing Supabase Realtime infrastructure:
- **Presence Tracking**: Show who is in the quiz lobby
- **Postgres Changes**: Broadcast question changes, score updates
- **Broadcast Channel**: Sync timer countdowns across all clients
- Use pattern from `useLiveChat.ts` as reference

### Phase 6: Certificate & Rewards Integration
- Top 3 winners receive certificates (reuse `LeaderboardCertificate` component)
- Store in `issued_certificates` table with `certificate_type: 'quiz_winner'`
- Award AITD Coins to participants based on ranking
- Email certificates using existing `send-certificate` edge function

---

## New Files to Create

### Pages
- `src/pages/Quiz.tsx` - Public quiz join and play page
- `src/pages/QuizHost.tsx` - Host control panel for running quizzes

### Components
- `src/components/admin/QuizManager.tsx` - Admin quiz CRUD
- `src/components/quiz/QuizLobby.tsx` - Waiting room before quiz starts
- `src/components/quiz/QuizQuestion.tsx` - Question display with options
- `src/components/quiz/QuizTimer.tsx` - Animated countdown timer
- `src/components/quiz/QuizLeaderboard.tsx` - Live rankings
- `src/components/quiz/QuizResults.tsx` - Final results and certificates
- `src/components/quiz/QuizJoinCard.tsx` - QR code + ID join form

### Hooks
- `src/hooks/useQuizHost.ts` - Host-side quiz control logic
- `src/hooks/useQuizParticipant.ts` - Participant-side state and actions
- `src/hooks/useQuizRealtime.ts` - Realtime subscriptions for quiz

---

## User Flow Diagrams

### Host Flow
```text
Admin Dashboard
      |
      v
[Quiz Manager Tab] --> Create Quiz --> Add Questions --> Generate QR/Code
      |                                                        |
      v                                                        v
[Start Session] --> Waiting Lobby (participants join) --> Start Quiz
      |
      v
Question Loop: Show Question --> Timer --> Reveal Answer --> Next
      |
      v
[End Quiz] --> Final Leaderboard --> Generate Certificates --> Email Winners
```

### Participant Flow
```text
Scan QR / Enter Code
      |
      v
Enter Display Name --> Join Lobby (wait for host)
      |
      v
Question Appears --> Select Answer (within timer)
      |
      v
See Result (correct/wrong + points) --> Updated Rank
      |
      v
[Repeat for all questions]
      |
      v
Final Ranking --> Certificate (if top 3)
```

---

## UI/UX Design

### Quiz Lobby (Waiting Room)
- Large quiz title and description
- Animated participant counter (pulsing number)
- List of joined participant names (scrolling ticker)
- "Waiting for host to start..." message
- Fun ambient animations

### Question Screen
- Large countdown timer (circular progress)
- Question text prominently displayed
- 2-4 colorful option buttons (Kahoot-style colors)
- Selected answer highlights
- Disabled state after answering

### Leaderboard Screen
- Animated rank changes
- Top 3 with gold/silver/bronze styling
- Current user highlighted
- Points earned this round shown

### Results Screen
- Podium-style top 3 display
- Confetti animation for winners
- Download certificate button
- Share to social media

---

## Security Considerations

1. **RLS Policies**:
   - Only quiz creator can modify quiz
   - Participants can only see questions when quiz is active
   - Answers are write-only for participants (can't read others' answers)
   - Final scores are public for leaderboard

2. **Anti-Cheat Measures**:
   - Server-side answer validation
   - Time-based scoring (faster = more points)
   - Device ID tracking to prevent duplicate joins
   - Answer submission locked after timer expires

3. **Rate Limiting**:
   - Limit answer submissions to one per question per participant

---

## Integration Points

1. **Events**: Link quiz to existing events for brand partnerships
2. **Certificates**: Use existing certificate infrastructure
3. **Gamification**: Award AITD Coins for participation
4. **Admin Dashboard**: New "Live Quiz" tab alongside existing features

---

## Technical Notes

- **No external dependencies needed**: Uses existing `qrcode.react` for QR codes
- **Realtime**: Supabase Realtime already configured in the project
- **Timer sync**: Broadcast channel ensures all clients see same countdown
- **Mobile-first**: Design optimized for phone participants
- **Offline resilience**: Reconnection handling for dropped connections

---

## Implementation Order

1. Database migration (tables + RLS + realtime)
2. Admin Quiz Manager component
3. Quiz join page for participants
4. Realtime hooks for synchronization
5. Host control panel
6. Question and answer flow
7. Leaderboard and scoring
8. Certificate integration
9. Add Quiz tab to Admin Dashboard
10. Testing and polish
