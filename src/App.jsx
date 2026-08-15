import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Stories from '@/pages/Stories';
import StoryHub from '@/pages/StoryHub';
import ChapterReader from '@/pages/ChapterReader';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPostDetail from '@/pages/BlogPostDetail';
import About from '@/pages/About';
import Library from '@/pages/Library';
import SearchPage from '@/pages/SearchPage';
import AdminChapters from '@/pages/AdminChapters';
import AdminContent from '@/pages/AdminContent';

const AuthenticatedApp = () => {
  const { authError, navigateToLogin } = useAuth();

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/story/:storyCode" element={<StoryHub />} />
        <Route path="/story/:storyCode/chapter/:chapterId" element={<ChapterReader />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogId" element={<BlogPostDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/library" element={<Library />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin/chapters" element={<AdminChapters />} />
        <Route path="/admin/content" element={<AdminContent />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
