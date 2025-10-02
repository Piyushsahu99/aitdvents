# AITD Events CRM - Admin Setup Guide

## Welcome to Your New CRM System! 🎉

Your platform now has a complete admin/user CRM system with AI-powered content generation.

## 🚀 Quick Start

### 1. Create Your Admin Account

First, sign up for a regular account at `/auth`. Then, make yourself an admin by running this SQL in your backend:

```sql
-- Replace 'your@email.com' with your actual email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your@email.com';
```

<lov-actions>
<lov-open-backend>Open Backend to Run SQL</lov-open-backend>
</lov-actions>

### 2. Access Admin Dashboard

Once you've added the admin role, visit `/admin` to access the admin dashboard.

## ✨ Features

### For Admins

**Admin Dashboard** (`/admin`)
- Create events, workshops, jobs, and scholarships
- AI automatically generates:
  - Professional blog posts
  - Social media hashtags
  - Event posters
- Manage all content before publishing
- Control what users see

**Content Creation Workflow**
1. Fill in event details
2. Click "Create Event with AI Content"
3. AI generates blog, hashtags, and poster
4. Review generated content
5. Publish when ready (status: draft → live)

### For Users

Users can only see:
- **Live events** (status = 'live')
- **Published blogs** (published = true)
- **Active jobs and scholarships**

## 📊 Database Tables

- **user_roles**: Admin/user role management
- **events**: Events with AI-generated content
- **blogs**: AI-generated or manual blog posts
- **jobs**: Job postings with status
- **scholarships**: Scholarship opportunities

## 🤖 AI Features

The system uses **Lovable AI** (Gemini 2.5 Flash) to generate:

1. **Blog Posts**: 800-1000 word articles with:
   - Engaging introductions
   - Key benefits
   - Practical tips
   - Call-to-action

2. **Hashtags**: 8-10 trending hashtags mixing:
   - Event-specific tags
   - Category tags
   - Student/career tags
   - Location tags

3. **Event Posters**: Professional poster images using:
   - AI image generation (Gemini Flash Image Preview)
   - Modern, vibrant designs
   - Student-friendly aesthetics

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only read live/published content
- Admins have full CRUD access
- Proper input validation

## 📝 Content Management Tips

1. **Start with drafts**: All new content starts as 'draft'
2. **Review AI content**: Always review AI-generated content before publishing
3. **Edit as needed**: AI content is a starting point - customize it!
4. **Publish strategically**: Set content to 'live' or 'published' when ready

## 🎯 Next Steps

1. Create your first admin account (see step 1 above)
2. Visit `/admin` and create a test event
3. See the AI magic happen!
4. Review and publish the content
5. Check the user-facing pages to see only live content

## 💡 Pro Tips

- Use descriptive event titles for better AI-generated content
- Provide detailed descriptions for richer blog posts
- The AI learns from your input - more context = better output
- Hashtags are automatically optimized for Indian student audiences

## 🆘 Need Help?

- Check the backend for database logs
- View edge function logs for AI generation issues  
- All AI requests are logged for debugging

<lov-actions>
<lov-open-backend>Open Backend</lov-open-backend>
</lov-actions>

---

**Built with**: React + Vite + Lovable Cloud + Lovable AI
