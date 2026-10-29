import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { AboutPage } from './routes/AboutPage'
import { HomePage } from './routes/HomePage'
import { HowToPlayPage } from './routes/HowToPlayPage'
import { NotFoundPage } from './routes/NotFoundPage'
import { PlayPage } from './routes/PlayPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="play" element={<PlayPage />} />
        <Route path="how-to-play" element={<HowToPlayPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
