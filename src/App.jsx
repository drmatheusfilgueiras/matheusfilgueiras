import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import AppleTestPage from './pages/AppleTestPage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<AppleTestPage />} />
                <Route path="/teste-apple" element={<AppleTestPage />} />
            </Routes>
        </Router>
    );
}

export default App;
