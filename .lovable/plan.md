
# Improve Jobs Section with External Links

## Overview
Add the ability to include external job application links so users can apply directly on the company's website. Also improve the overall UI and add a job detail view.

## Current Issues Found
- The code references `job.apply_link` but this column doesn't exist in the database
- Jobs don't have a way to link to external application pages
- No detailed view modal for job listings

## Implementation Plan

### 1. Database Migration
Add an `apply_link` column to the `jobs` table to store external job URLs:

```text
ALTER TABLE public.jobs 
ADD COLUMN apply_link text;

COMMENT ON COLUMN public.jobs.apply_link IS 'External URL where users can apply for the job';
```

### 2. Update Job Submission Modal
Modify `src/components/JobSubmissionModal.tsx`:
- Add a new "Application Link" input field with link icon
- Add validation to ensure it's a valid URL (optional field)
- Include the `apply_link` in the insert statement
- Add helpful placeholder text (e.g., "https://company.com/careers/job-123")

### 3. Update Admin Job Editor
Modify `src/components/admin/JobEditor.tsx`:
- Add the Job interface to include `apply_link`
- Add an "Application Link" input field
- Include `apply_link` in the update statement

### 4. Create Job Detail Modal
Create new `src/components/JobDetailModal.tsx`:
- Show full job description and requirements
- Display company info, location, stipend prominently
- Show deadline with visual indicator if urgent
- Primary "Apply Now" button that opens external link in new tab
- Share buttons for the job
- Clean, modern modal design matching the platform aesthetic

### 5. Improve Jobs Page UI
Update `src/pages/Jobs.tsx`:
- Add click-to-view functionality on job cards (opens detail modal)
- Visual indicator when job has external link (external link icon)
- Better mobile responsiveness
- Show "View Details" button alongside "Apply Now"
- Highlight jobs that are closing soon

## File Changes Summary

| File | Action |
|------|--------|
| Database migration | Add `apply_link` column |
| `src/components/JobSubmissionModal.tsx` | Add apply link field |
| `src/components/admin/JobEditor.tsx` | Add apply link field |
| `src/components/JobDetailModal.tsx` | **Create** - Job detail view |
| `src/pages/Jobs.tsx` | Integrate detail modal, improve UI |

## Technical Details

### Job Detail Modal Features
- Full-screen on mobile, centered modal on desktop
- Sections: Overview, Requirements, How to Apply
- If `apply_link` exists: Opens external site in new tab
- If no `apply_link`: Shows in-app application form (existing flow)
- Share functionality with personalized referral links

### UI Improvements
- Card hover effects with subtle elevation
- "Apply on Company Site" label when external link exists
- Deadline countdown (e.g., "3 days left to apply")
- Category color coding
- Improved mobile card layout
