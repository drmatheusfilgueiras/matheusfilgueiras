import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import AccessTracker from './components/AccessTracker';
import ScrollToTop from './components/ScrollToTop';
import AppleTestPage from './pages/AppleTestPage';
import LogPage from './pages/LogPage';
import UnidosBravuraPage from './pages/UnidosBravuraPage';

function App() {
    return (
        <Router>
            <AccessTracker />
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<AppleTestPage />} />
                <Route path="/teste-apple" element={<AppleTestPage />} />
                <Route path="/unidos_pela_bravura" element={<UnidosBravuraPage />} />
                <Route path="/log" element={<LogPage />} />
            </Routes>
        </Router>
    );
}

export default App;
