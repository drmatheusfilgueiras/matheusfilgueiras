import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AppleTestPage from './pages/AppleTestPage';
import UnidosBravuraPage from './pages/UnidosBravuraPage';
import PreValidationBookPage from './pages/PreValidationBookPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './components/PublicInfoPages';

const PUBLIC_PAGES = {
  '/': AppleTestPage,
  '/sobre': AboutPage,
  '/contato': ContactPage,
  '/privacidade': PrivacyPage,
  '/termos': TermsPage,
  '/unidos_pela_bravura': UnidosBravuraPage,
  '/pre_validation_book': PreValidationBookPage
};

export function renderPage(pathname) {
  const Component = PUBLIC_PAGES[pathname];
  if (!Component) throw new Error('Unknown static prerender route: ' + pathname);
  const markup = renderToString(
    <MemoryRouter initialEntries={[pathname]}>
      <Component />
    </MemoryRouter>
  );
  const helmet = Helmet.renderStatic();
  return {
    markup,
    head: [
      helmet.title.toString(),
      helmet.meta.toString(),
      helmet.link.toString(),
      helmet.script.toString()
    ].filter(Boolean).join('\n')
  };
}
