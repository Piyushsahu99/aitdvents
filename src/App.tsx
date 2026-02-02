import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Sponsors from "./pages/Sponsors";
import Tasks from "./pages/Tasks";
import Jobs from "./pages/Jobs";
import Resume from "./pages/Resume";
import Blogs from "./pages/Blogs";
import Reels from "./pages/Reels";
import Alumni from "./pages/Alumni";
import AITools from "./pages/AITools";
import AIChat from "./pages/AIChat";
import Mentorship from "./pages/Mentorship";
import Practice from "./pages/Practice";
import More from "./pages/More";
import About from "./pages/About";
import Scholarships from "./pages/Scholarships";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Bounties from "./pages/Bounties";
import Hackathons from "./pages/Hackathons";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Dashboard from "./pages/Dashboard";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";
import Community from "./pages/Community";
import Network from "./pages/Network";
import Groups from "./pages/Groups";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CampusAmbassador from "./pages/CampusAmbassador";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import StudyMaterials from "./pages/StudyMaterials";
import Certificates from "./pages/Certificates";
import RSVP from "./pages/RSVP";
import LiveChatPage from "./pages/LiveChatPage";
import Quiz from "./pages/Quiz";
import TeamPanel from "./pages/TeamPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-20 lg:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/more" element={<More />} />
              <Route path="/about" element={<About />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/bounties" element={<Bounties />} />
              <Route path="/hackathons" element={<Hackathons />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/community" element={<Community />} />
              <Route path="/network" element={<Network />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/campus-ambassador" element={<CampusAmbassador />} />
              <Route path="/ambassador-dashboard" element={<AmbassadorDashboard />} />
              <Route path="/study-materials" element={<StudyMaterials />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/rsvp" element={<RSVP />} />
              <Route path="/live-chat" element={<LiveChatPage />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/team-panel" element={<TeamPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <div className="hidden lg:block">
            <Footer />
          </div>
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
