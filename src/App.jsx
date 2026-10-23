import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import SiteLayout from './layout/SiteLayout'
import HomePage from './pages/HomePage'
import ClassesPage from './pages/ClassesPage'
import BeginnersPage from './pages/BeginnersPage'
import KidsPage from './pages/KidsPage'
import AdultsPage from './pages/AdultsPage'
import LocationsPage from './pages/LocationsPage'
import AboutPage from './pages/AboutPage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'
import AppPage from './pages/AppPage'
import LocationDetailPage from './pages/LocationDetailPage'
import ClassDetailPage from './pages/ClassDetailPage'
const AdminPage = lazy(() => import('./admin/AdminPage'))

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Suspense fallback={<p role="status">Opening the club admin preview...</p>}><AdminPage /></Suspense>} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/:slug" element={<ClassDetailPage />} />
        <Route path="/beginners" element={<BeginnersPage />} />
        <Route path="/kids-karate" element={<KidsPage />} />
        <Route path="/adult-karate" element={<AdultsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/:slug" element={<LocationDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/app" element={<AppPage />} />
      </Route>
    </Routes>
  )
}

export default App
