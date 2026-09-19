import React from 'react';
import { Link, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import AccessTracker from './components/AccessTracker';
import ScrollToTop from './components/ScrollToTop';
import AppleTestPage from './pages/AppleTestPage';
import ChatControlPage from './pages/ChatControlPage';
import LogPage from './pages/LogPage';
import PreValidationBookPage from './pages/PreValidationBookPage';
import UnidosBravuraPage from './pages/UnidosBravuraPage';

function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-6 py-16 text-[#1d1d1f]">
            <section className="w-full max-w-2xl text-center">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0066cc]">404</p>
                <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Página não encontrada.</h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6e6e73] sm:text-lg">
                    O caminho acessado não existe ou foi movido.
                </p>
                <Link
                    to="/"
                    className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-[#0066cc] px-6 text-[0.95rem] font-semibold text-white transition-colors hover:bg-[#004f9f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7]"
                >
                    Voltar para o início
                </Link>
            </section>
        </main>
    );
}

function App() {
    return (
        <Router>
            <AccessTracker />
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<AppleTestPage />} />
                <Route path="/teste-apple" element={<AppleTestPage />} />
                <Route path="/unidos_pela_bravura" element={<UnidosBravuraPage />} />
                <Route path="/pre_validation_book" element={<PreValidationBookPage />} />
                <Route path="/log" element={<LogPage />} />
                <Route path="/chat_control" element={<ChatControlPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;
