<div align="center">

# 🚀 AITD Events Platform

### India's Largest Student Opportunity Hub

*Connecting students with career-defining opportunities including hackathons, internships, jobs, scholarships, and mentorship.*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58.0-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

[Live Demo](https://aitd.events) • [Documentation](./docs) • [Report Bug](https://github.com/Piyushsahu99/aitdvents/issues) • [Request Feature](https://github.com/Piyushsahu99/aitdvents/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Platform Highlights](#-platform-highlights)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🏗️ Project Structure](#️-project-structure)
- [🎨 UI Components](#-ui-components)
- [📱 Features Deep Dive](#-features-deep-dive)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎓 **For Students**
- **Events & Hackathons**: Discover and participate in 500+ competitions
- **Job & Internship Board**: Access 1000+ opportunities from top companies
- **Learning Hub**: 200+ courses, study materials, and practice resources
- **Mentorship**: Connect with 100+ industry mentors
- **Campus Ambassador Program**: Lead and grow with exclusive benefits
- **Gamification**: Earn coins, level up, and compete on leaderboards
- **AI Tools**: Resume builder, AI chat assistant, and career guidance

### 🏢 **For Organizations**
- **Event Management**: Host and manage events with RSVP tracking
- **Job Posting**: Reach 50,000+ students with one post
- **Recruitment Tools**: Filter candidates, track applications
- **Analytics Dashboard**: Real-time insights and metrics
- **Content Management**: Manage scholarships, courses, and resources

### 🎮 **Interactive Features**
- **Live Games**: IPL Auction, Spin Wheel, Lucky Draw
- **Quiz Platform**: Host live quizzes with real-time leaderboards
- **Bounties System**: Post and claim technical challenges
- **Reels & Blogs**: Share knowledge and experiences
- **Community Groups**: Join interest-based communities
- **Live Chat**: Real-time messaging with emoji support

---

## 🎯 Platform Highlights

| Feature | Description | Status |
|---------|-------------|--------|
| 🎪 **Events** | 500+ hackathons, workshops, webinars | ✅ Live |
| 💼 **Jobs** | 1000+ internships and full-time positions | ✅ Live |
| 📚 **Learning** | Courses, study materials, practice tests | ✅ Live |
| 🏆 **Games** | IPL Auction, Quizzes, Lucky Draw | ✅ Live |
| 💰 **Bounties** | Technical challenges with rewards | ✅ Live |
| 🎓 **Scholarships** | Financial aid opportunities | ✅ Live |
| 👥 **Mentorship** | 1-on-1 mentor sessions | ✅ Live |
| 🛍️ **Store** | Exclusive merchandise and goodies | ✅ Live |
| 🤖 **AI Tools** | Resume builder, chat assistant | ✅ Live |
| 📊 **Analytics** | Personal dashboard and insights | ✅ Live |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 (Lightning-fast HMR)
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui components
- **Animations**: Framer Motion 12.29.2
- **State Management**: TanStack Query 5.83.0
- **Routing**: React Router DOM 6.30.1
- **Form Handling**: React Hook Form 7.61.1 + Zod validation
- **Icons**: Lucide React (462 icons)

### **Backend & Services**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, OAuth)
- **Storage**: Supabase Storage (Images, files)
- **Real-time**: Supabase Realtime (Live updates)
- **API**: RESTful with Supabase Client

### **UI Component Library**
- **Base**: Radix UI primitives (30+ components)
- **Design System**: Custom shadcn/ui implementation
- **Accessibility**: ARIA compliant, keyboard navigation
- **Responsive**: Mobile-first design (iOS/Android/Desktop)

### **Additional Tools**
- **Charts**: Recharts 2.15.4
- **Date Handling**: date-fns 3.6.0
- **Notifications**: Sonner 1.7.4 (Toast notifications)
- **QR Codes**: qrcode.react 4.2.0
- **Confetti**: canvas-confetti 1.9.4
- **Theme**: next-themes 0.3.0 (Dark mode)

---

## 🚀 Getting Started

### **Prerequisites**

Ensure you have the following installed:
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

**Recommended:**
- [nvm](https://github.com/nvm-sh/nvm) for Node version management
- [VS Code](https://code.visualstudio.com/) with recommended extensions

---

## 📦 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/Piyushsahu99/aitdvents.git
cd aitdvents
```

### **2. Install Dependencies**

```bash
npm install
```

This will install all 50+ dependencies including React, TypeScript, Tailwind CSS, and more.

### **3. Set Up Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics, etc.
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

> **Note**: Contact the project admin for production environment variables.

### **4. Start Development Server**

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

---

## 🔧 Configuration

### **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |
| `npm run gcp:deploy` | Deploy to Google Cloud Platform |
| `npm run gcp:logs` | View GCP logs |

### **Development Environment**

```bash
# Start with auto-reload
npm run dev

# Build for development (with source maps)
npm run build:dev

# Build for production (optimized)
npm run build:prod
```

---

## 🏗️ Project Structure

```
aitdvents/
├── public/                  # Static assets
│   └── assets/             # Images, fonts, etc.
├── src/
│   ├── assets/             # Dynamic assets
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components (50+)
│   │   ├── admin/         # Admin panel components
│   │   ├── ambassador/    # Campus ambassador features
│   │   ├── animated/      # Framer Motion animations
│   │   ├── auth/          # Authentication components
│   │   ├── blog/          # Blog system
│   │   ├── certificates/  # Certificate generation
│   │   ├── chat/          # Live chat system
│   │   ├── crm/           # CRM & team management
│   │   ├── games/         # Gaming components
│   │   ├── home/          # Homepage sections
│   │   ├── profile/       # User profile
│   │   ├── quiz/          # Quiz system (15+ components)
│   │   └── reels/         # Reels/video feature
│   ├── data/              # Static data and mocks
│   ├── hooks/             # Custom React hooks (20+)
│   ├── integrations/      # Supabase integration
│   │   └── supabase/
│   │       ├── client.ts  # Supabase client config
│   │       └── types.ts   # Database types (auto-generated)
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components (50+)
│   ├── App.tsx            # Root component
│   ├── index.css          # Global styles + Tailwind
│   └── main.tsx           # Entry point
├── .env.local             # Environment variables (create this)
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── cloudbuild.yaml        # GCP Cloud Build config
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies and scripts
```

---

## 🎨 UI Components

### **Component Library (70+ Components)**

<details>
<summary><b>Core UI Components (shadcn/ui)</b></summary>

- **Layout**: Card, Sheet, Dialog, Drawer, Tabs, Accordion
- **Navigation**: NavigationMenu, Dropdown, Menubar, Breadcrumb
- **Forms**: Input, Textarea, Select, Checkbox, Radio, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Data Display**: Table, Badge, Avatar, Tooltip, HoverCard
- **Overlays**: Popover, AlertDialog, ContextMenu
- **Media**: Carousel, AspectRatio, Scroll Area
- **Charts**: Recharts integration with custom components

</details>

<details>
<summary><b>Custom Components</b></summary>

- **Animated Components**: AnimatedSection, AnimatedCard (6 variants)
- **Skeleton Loaders**: 10 specialized loaders
- **Blog System**: Enhanced editor with markdown support
- **Quiz Platform**: Live quiz with 15+ components
- **Games**: IPL Auction, Spin Wheel, Lucky Draw
- **Certificates**: Dynamic certificate generator
- **CRM**: 10+ team management components
- **Admin**: 20+ admin panel components

</details>

---

## 📱 Features Deep Dive

### **1. Events & Hackathons**
- Browse 500+ events with advanced filters
- RSVP tracking and reminders
- Event gallery with image uploads
- Category-based organization
- Real-time participant count

### **2. Jobs & Internships**
- 1000+ opportunities from top companies
- Advanced search (location, type, category)
- One-click apply functionality
- Application tracking dashboard
- Email notifications

### **3. Learning Management System (LMS)**
- 200+ courses across multiple domains
- Video lectures and study materials
- Practice tests and quizzes
- Progress tracking
- Certificate generation

### **4. Gamification System**
- Earn coins for platform activities
- Level progression (1-100)
- Global and weekly leaderboards
- Achievements and badges
- Reward redemption store

### **5. Quiz Platform**
- Host live quizzes with real-time participation
- Auto-advance questions with countdown
- Live leaderboard updates
- Participant avatars and reactions
- Results analytics and certificates

### **6. Campus Ambassador Program**
- Exclusive dashboard for ambassadors
- Task management system
- Points and rewards tracking
- Event coordination tools
- Leaderboard competition

### **7. Mentorship**
- Browse 100+ verified mentors
- Filter by expertise and availability
- Schedule 1-on-1 sessions
- Video call integration ready
- Mentor reviews and ratings

### **8. AI Tools**
- **AI Chat Assistant**: 24/7 career guidance
- **Resume Builder**: ATS-friendly templates
- **AI Tools Directory**: 50+ curated AI tools
- Smart recommendations

### **9. Bounties System**
- Post technical challenges with rewards
- Skill-based filtering
- Submission tracking
- Escrow-ready payment system
- Reputation scoring

### **10. Community Features**
- Interest-based groups
- Discussion forums
- Live chat with emoji picker
- Reels for short-form content
- Blog platform with markdown support

---

## 🔐 Authentication & Authorization

### **Authentication Methods**
- ✅ Email/Password with verification
- ✅ Magic Link (passwordless)
- ✅ OAuth (Google, GitHub) - Ready
- ✅ Multi-factor Authentication (2FA) - Ready

### **User Roles**
1. **Student** - Full platform access
2. **Recruiter** - Job posting and management
3. **Mentor** - Mentorship features
4. **Campus Ambassador** - Ambassador dashboard
5. **Admin** - Full admin panel access

### **Security Features**
- Row Level Security (RLS) in Supabase
- JWT-based authentication
- Secure session management
- CORS protection
- Rate limiting ready
- XSS protection

---

## 🌐 Deployment

### **Option 1: Google Cloud Platform (Recommended)**

```bash
# Deploy to GCP Cloud Run
npm run gcp:deploy

# View logs
npm run gcp:logs
```

**Features:**
- Auto-scaling
- HTTPS by default
- CDN integration
- 99.95% SLA

### **Option 2: Docker**

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

### **Option 3: Static Hosting**

#### Vercel (Recommended for quick deployment)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Drag and drop ./dist to Netlify
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
npm run build
firebase init hosting
firebase deploy
```

### **Production Build**

```bash
# Create optimized production build
npm run build

# Output: dist/ directory (optimized, minified, tree-shaken)
# Bundle size: ~800KB gzipped JS, ~31KB gzipped CSS
```

---

## 🧪 Testing

### **Manual Testing Checklist**
- ✅ All pages load correctly
- ✅ Forms validate properly
- ✅ Authentication flows work
- ✅ Real-time features update
- ✅ Mobile responsive design
- ✅ Cross-browser compatibility
- ✅ Dark mode toggles correctly

### **Browser Support**
- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Performance

### **Build Metrics**
- Build time: ~14 seconds
- Bundle size: ~800KB gzipped
- CSS size: ~31KB gzipped
- 3,492 modules optimized
- Lighthouse score: 95+ (Performance)

### **Optimizations**
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ Tree shaking
- ✅ Minification and compression
- ✅ CDN-ready static assets
- ✅ Service worker ready

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### **1. Fork the Repository**
```bash
# Click the "Fork" button on GitHub
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/AmazingFeature
```

### **3. Make Your Changes**
- Write clean, documented code
- Follow existing code style
- Test thoroughly

### **4. Commit Your Changes**
```bash
git commit -m "Add: Amazing new feature

- Feature description
- Related changes

Co-Authored-By: Your Name <your.email@example.com>"
```

### **5. Push to Your Fork**
```bash
git push origin feature/AmazingFeature
```

### **6. Open a Pull Request**
- Describe your changes clearly
- Link any related issues
- Wait for review

### **Code Style Guidelines**
- Use TypeScript for all new code
- Follow ESLint rules (`npm run lint`)
- Use Tailwind CSS for styling
- Document complex logic
- Write meaningful commit messages

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?

1. Check [existing issues](https://github.com/Piyushsahu99/aitdvents/issues)
2. If not found, [create a new issue](https://github.com/Piyushsahu99/aitdvents/issues/new)
3. Provide detailed description with screenshots if applicable

---

## 📝 Recent Updates

### **v1.0.0 (February 2026)**
- ✅ Fixed dropdown scrolling issues on Windows
- ✅ Enhanced event submission form with validation
- ✅ Improved job posting with character counters
- ✅ Added blog system with rich text editor
- ✅ Implemented comments system
- ✅ Removed duplicate skeleton components
- ✅ Optimized bundle size
- ✅ Enhanced mobile responsiveness
- ✅ Added comprehensive documentation

See [PLATFORM_IMPROVEMENTS_2026.md](./PLATFORM_IMPROVEMENTS_2026.md) for detailed changelog.

---

## 📧 Contact & Support

- **Website**: [aitd.events](https://aitd.events)
- **Email**: support@aitd.events
- **GitHub**: [@Piyushsahu99](https://github.com/Piyushsahu99)
- **Issues**: [Report a bug](https://github.com/Piyushsahu99/aitdvents/issues)

---

## 📄 License

This project is proprietary software. All rights reserved.

© 2026 AITD Events Platform. Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The amazing UI library
- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Lucide](https://lucide.dev/) - Beautiful icon set
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

---

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub! It helps others discover the project and motivates continued development.

[![GitHub Stars](https://img.shields.io/github/stars/Piyushsahu99/aitdvents?style=social)](https://github.com/Piyushsahu99/aitdvents)

---

<div align="center">

**Made with ❤️ by the AITD Events Team**

[Website](https://aitd.events) • [GitHub](https://github.com/Piyushsahu99/aitdvents) • [Support](mailto:support@aitd.events)

</div>
