

## Full Blog System Overhaul

### Problems Found
1. No blog detail/reading page -- clicking a blog card does nothing useful (links back to /blogs listing)
2. No sharing functionality (WhatsApp, Twitter, LinkedIn, Copy Link)
3. Missing categories like "AKTU Updates", "Roadmap", "Tips & Tricks"
4. The fetch query joins `events(title, date)` which can cause issues and isn't used
5. No `user_id` column on blogs table -- author ownership is matched by name string, which is fragile

### What Will Be Built

**1. Blog Detail Page (`/blogs/:id`)**
- Full reading experience with the blog content rendered nicely
- Shows title, author, category, date, read time
- Share buttons at top and bottom (WhatsApp, Twitter/X, LinkedIn, Copy Link)
- "Back to Blogs" navigation
- Related blogs sidebar/section (same category)

**2. Blog Sharing**
- Share panel on each blog detail page and on blog cards
- WhatsApp: pre-filled message with title + link
- Twitter/X: pre-filled tweet
- LinkedIn: share URL
- Copy Link with toast confirmation
- Uses the published URL format: `https://aitdevents.lovable.app/blogs/[id]`

**3. Improved Blog Cards (Listing Page)**
- Cards now link to `/blogs/[id]` (the detail page)
- Add a small share icon on each card
- Fix the fetch query: remove the broken `events(title, date)` join

**4. Enhanced Categories**
- Add: "AKTU Updates", "Roadmap", "Tips & Tricks", "University News", "Opportunities" to the write modal categories

**5. Database: Add `user_id` column**
- Add `user_id UUID` to `blogs` table (nullable, references nothing per Supabase guidelines)
- Update the write modal to save the current user's ID
- This enables proper "My Blogs" and ownership tracking in future

**6. New Route**
- Add `/blogs/:id` route in `App.tsx` pointing to new `BlogDetail` page

---

### Technical Details

| File | Change |
|---|---|
| **New: `src/pages/BlogDetail.tsx`** | Full blog reading page with content display, share buttons, author info, related blogs |
| `src/pages/Blogs.tsx` | Fix fetch query (remove events join), make cards link to `/blogs/[id]`, add share icon on cards |
| `src/components/BlogWriteModal.tsx` | Add new categories, save `user_id` on insert |
| `src/App.tsx` | Add `/blogs/:id` route |
| **Database migration** | Add `user_id` column to `blogs` table |

### No external services needed
This is fully self-contained using the existing database. No Google Blogger connection required -- the platform already has its own blogs table and write system. The fixes above will make it fully functional end-to-end.
