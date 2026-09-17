import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const DOCUMENTS = {
  '/unidos_pela_bravura': {
    documentId: 'unidos_pela_bravura',
    documentTitle: 'Unidos pela Bravura',
  },
  '/pre_validation_book': {
    documentId: 'pre_validation_book',
    documentTitle: 'Unidos pela Bravura - Pre-validacao',
  },
};

function visitorId() {
  const storageKey = 'matheus_access_visitor_id';
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const generated =
    window.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(storageKey, generated);
  return generated;
}

function documentInfo(pathname) {
  if (DOCUMENTS[pathname]) {
    return DOCUMENTS[pathname];
  }

  return {
    documentId: pathname === '/' ? 'home' : pathname.replace(/^\/+/, '').replace(/\/+$/, '') || 'home',
    documentTitle: pathname === '/' ? 'Pagina inicial' : pathname,
  };
}

export default function AccessTracker() {
  const location = useLocation();
  const trackedPath = useMemo(() => `${location.pathname}${location.search}`, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname === '/log') {
      return;
    }

    if (new URLSearchParams(location.search).has('LSCWP_CTRL')) {
      return;
    }

    const info = documentInfo(location.pathname);
    const payload = {
      ...info,
      path: trackedPath,
      href: window.location.href,
      referrer: document.referrer,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
      screen: `${window.screen.width}x${window.screen.height}`,
      visitorId: visitorId(),
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/access-log.php', blob);
      return;
    }

    fetch('/api/access-log.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname, location.search, trackedPath]);

  return null;
}
