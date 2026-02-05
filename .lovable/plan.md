
# Quiz System Enhancement Implementation Plan

## Overview
Enhance the existing quiz system with Kahoot/Slido-inspired features: edit quizzes, shareable leaderboards, duplicate functionality, and analytics.

---

## Phase 1: Edit Quiz Functionality

### 1.1 Modify CreateQuiz to Support Edit Mode
**File:** `src/pages/CreateQuiz.tsx`

- Add `quizId` URL parameter support using `useParams()`
- Fetch existing quiz data when `quizId` is present
- Populate all form steps with existing data
- Change button text from "Create Quiz" to "Update Quiz"
- Handle update logic using `.update()` instead of `.insert()`

### 1.2 Update MyQuizzes Page
**File:** `src/pages/MyQuizzes.tsx`

- Add "Edit" button for draft/completed quizzes
- Add "Duplicate" button to clone quizzes
- Navigate to `/create-quiz?edit=quizId` for editing

---

## Phase 2: Shareable Leaderboard & Results

### 2.1 Create Public Results Page
**New File:** `src/pages/QuizResultsPublic.tsx`

- Fetch quiz and leaderboard by quiz code (no auth required)
- Display final standings with podium animation
- Show quiz title, date, participant count
- Professional layout for sharing

### 2.2 Add Share Functionality to QuizResults
**File:** `src/components/quiz/QuizResults.tsx`

- Add share buttons: WhatsApp, Twitter, LinkedIn, Copy Link
- Generate shareable URL: `/quiz-results/{quiz_code}`
- Use html2canvas for downloadable leaderboard image

### 2.3 Update Routing
**File:** `src/App.tsx`

- Add route: `/quiz-results/:quizCode`

---

## Phase 3: Duplicate Quiz Feature

### Implementation in MyQuizzes.tsx
- Create `duplicateQuiz()` function
- Copy quiz record with new ID and quiz_code
- Copy all questions to new quiz
- Navigate to edit mode for the duplicate

---

## Phase 4: Quiz Analytics Dashboard

### 4.1 Create Analytics Page
**New File:** `src/pages/QuizAnalytics.tsx`

- Question-by-question accuracy chart
- Average response time per question
- Participation rate visualization
- Export options (CSV download)

### 4.2 Add Analytics Button
**File:** `src/pages/MyQuizzes.tsx`

- Add "Analytics" button for completed quizzes
- Navigate to `/quiz-analytics/:quizId`

---

## Database Changes

### RLS Policy for Public Results
```sql
-- Allow public read access to completed quiz results
CREATE POLICY "Public can view completed quiz leaderboard"
ON quiz_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = quiz_participants.quiz_id 
    AND quizzes.status = 'completed' 
    AND quizzes.is_public = true
  )
);
```

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/pages/CreateQuiz.tsx` | Add edit mode support |
| Modify | `src/pages/MyQuizzes.tsx` | Add Edit, Duplicate, Analytics buttons |
| Modify | `src/components/quiz/QuizResults.tsx` | Add share functionality |
| Modify | `src/App.tsx` | Add new routes |
| Create | `src/pages/QuizResultsPublic.tsx` | Public shareable results |
| Create | `src/pages/QuizAnalytics.tsx` | Quiz analytics dashboard |

---

## Implementation Order

1. **Edit Quiz** - Modify CreateQuiz.tsx + MyQuizzes.tsx
2. **Duplicate Quiz** - Add function in MyQuizzes.tsx
3. **Shareable Results** - Create QuizResultsPublic.tsx + share buttons
4. **Analytics** - Create QuizAnalytics.tsx

All existing quiz functionality remains intact.
