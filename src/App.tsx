import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ErrorDecoder from './pages/ErrorDecoder'
import ErrorDetail from './pages/ErrorDetail'
import ErrorCategories from './pages/ErrorCategories'
import Converter from './pages/Converter'
import Schemas from './pages/Schemas'
import SchemaDetail from './pages/SchemaDetail'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/amazon-error-decode" element={<ErrorDecoder />} />
        <Route path="/amazon-error/:code" element={<ErrorDetail />} />
        <Route path="/amazon-errors/" element={<ErrorCategories />} />
        <Route path="/tools/marketplace-csv-converter" element={<Converter />} />
        <Route path="/schemas" element={<Schemas />} />
        <Route path="/schemas/:platformId" element={<SchemaDetail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
