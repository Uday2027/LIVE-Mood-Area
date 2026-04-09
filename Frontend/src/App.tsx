// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/UI/Navbar';
import { ProtectedRoute } from '@/components/UI/ProtectedRoute';
import Home from '@/pages/Home';
import Trends from '@/pages/Trends';
import About from '@/pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="pt-14">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/trends"    element={<Trends />} />
          <Route path="/about"     element={<About />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
