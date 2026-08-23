import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import SEO from '@/components/SEO';
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
import AdminLore from '@/pages/AdminLore';

export const ANDROMEDA_BUILD = 'supabase-reader-v3-2026-08-23';
if (typeof window !== 'undefined') console.info(`[Andromeda Archives] ${ANDROMEDA_BUILD}`);

const publicSeo = {
  '/': {
    title: 'Original Fiction, Stories & Worldbuilding',
    description: 'Read original sci-fi, romance, fantasy, paranormal, contemporary, and dark fiction on The Andromeda Archive, with new chapters, stories, and behind-the-ink blogs.',
  },
  '/stories': {
    title: 'Stories | Original Fiction Catalogue',
    description: 'Browse the Andromeda Archive catalogue of original novels, novellas, and short stories across romance, fantasy, sci-fi, paranormal, crime, horror, and contemporary fiction.',
  },
  '/blog': {
    title: 'Blog | Behind the Ink & Worldbuilding',
    description: 'Explore writing updates, character studies, lore vaults, worldbuilding deep dives, site news, and behind-the-ink posts from The Andromeda Archive.',
  },
  '/about': {
    title: 'About The Andromeda Archive',
    description: 'Learn about The Andromeda Archive, the writers behind it, and the fictional worlds, stories, and creative projects collected here.',
  },
  '/contact': {
    title: 'Contact The Andromeda Archive',
    description: 'Find out how to contact The Andromeda Archive about stories, feedback, collaborations, and site questions.',
  },
  '/search': {
    title: 'Search Stories & Blog Posts',
    description: 'Search The Andromeda Archive for original stories, chapters, blog posts, characters, genres, tags, and other archive content.',
  },
};

function RouteSEO() {
  const location = useLocation();
  const basePath = Object.keys(publicSeo).find((path) => location.pathname === path) || null;
  const meta = basePath ? publicSeo[basePath] : null;
  const privatePath = ['/library', '/admin/chapters', '/admin/content', '/admin/lore'];
  const noindex = privatePath.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return <SEO
    title={meta?.title}
    description={meta?.description}
    path={location.pathname}
    noindex={noindex || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password'}
    breadcrumbs={meta ? [{ name: 'Home', path: '/' }, ...(basePath !== '/' ? [{ name: meta.title.split(' | ')[0], path: basePath }] : [])] : [{ name: 'Home', path: '/' }]}
  />;
}

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
    <>
      <RouteSEO />
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
          <Route path="/admin/lore" element={<AdminLore />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="andromeda-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
