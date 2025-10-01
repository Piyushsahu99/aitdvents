import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
