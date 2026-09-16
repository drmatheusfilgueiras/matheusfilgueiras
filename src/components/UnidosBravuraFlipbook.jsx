import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
} from 'lucide-react';

const TOTAL_PAGES = 61;
const TURN_MS = 620;

const pageSrc = (page) => `/assets/unidos-pela-bravura/pages/page-${String(page).padStart(2, '0')}.jpg`;

function IconButton({ children, label, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.10)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 hover:text-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 sm:h-12 sm:w-12"
    >
      {children}
    </button>
  );
}

function PageImage({ page, alt, eager = false }) {
  return (
    <img
      src={pageSrc(page)}
      alt={alt}
      width="945"
      height="945"
      draggable="false"
      loading={eager ? 'eager' : 'lazy'}
      className="h-full w-full select-none object-cover"
    />
  );
}

export default function UnidosBravuraFlipbook() {
  const [page, setPage] = useState(1);
  const [turn, setTurn] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const timeoutRef = useRef(null);

  const pageMarkers = useMemo(
    () => Array.from({ length: TOTAL_PAGES }, (_, index) => index + 1).filter(
      (item) => item === 1 || item === TOTAL_PAGES || item % 6 === 0,
    ),
    [],
  );

  const clearTurnTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (target, direction) => {
      const safeTarget = Math.min(Math.max(target, 1), TOTAL_PAGES);

      if (turn || safeTarget === page) {
        return;
      }

      const resolvedDirection = direction || (safeTarget > page ? 'next' : 'previous');

      clearTurnTimer();
      setTurn({ direction: resolvedDirection, from: page, to: safeTarget });
      timeoutRef.current = window.setTimeout(() => {
        setPage(safeTarget);
        setTurn(null);
        timeoutRef.current = null;

        if (safeTarget === TOTAL_PAGES) {
          setAutoPlay(false);
        }
      }, TURN_MS);
    },
    [clearTurnTimer, page, turn],
  );

  const previousPage = useCallback(() => {
    goTo(page - 1, 'previous');
  }, [goTo, page]);

  const nextPage = useCallback(() => {
    goTo(page + 1, 'next');
  }, [goTo, page]);

  useEffect(() => {
    if (!autoPlay || turn) {
      return undefined;
    }

    const id = window.setTimeout(nextPage, 1900);
    return () => window.clearTimeout(id);
  }, [autoPlay, nextPage, turn]);

  useEffect(() => {
    [page - 1, page + 1]
      .filter((item) => item >= 1 && item <= TOTAL_PAGES)
      .forEach((item) => {
        const image = new Image();
        image.src = pageSrc(item);
      });
  }, [page]);

  useEffect(() => clearTurnTimer, [clearTurnTimer]);

  const visiblePage = turn?.direction === 'previous' ? turn.to : page;
  const revealedPage = turn?.direction === 'next' ? turn.to : page;
  const turningPage = turn?.from || page;

  return (
    <section className="min-h-screen bg-[#fbfbfd] px-5 py-7 text-[#1d1d1f] sm:px-8 lg:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 text-[0.95rem] font-semibold text-[#424245] shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-colors hover:text-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Voltar
            </Link>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#0066cc]">Livro interativo</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
              Unidos pela Bravura
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-[#6e6e73]">
              Uma versão integrada ao site, com páginas renderizadas do PDF e uma virada inspirada na experiência dos flipbooks digitais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <IconButton label="Ir para a primeira página" disabled={page === 1 || Boolean(turn)} onClick={() => goTo(1, 'previous')}>
              <ChevronsLeft className="h-5 w-5" strokeWidth={2} />
            </IconButton>
            <IconButton label="Página anterior" disabled={page === 1 || Boolean(turn)} onClick={previousPage}>
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </IconButton>
            <button
              type="button"
              onClick={() => setAutoPlay((current) => !current)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0066cc] px-4 text-[0.95rem] font-semibold text-white shadow-[0_12px_34px_rgba(0,102,204,0.26)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4 active:scale-[0.98] sm:h-12 sm:px-5"
            >
              {autoPlay ? <Pause className="h-4 w-4" strokeWidth={2} /> : <Play className="h-4 w-4" strokeWidth={2} />}
              {autoPlay ? 'Pausar' : 'Auto'}
            </button>
            <IconButton label="Próxima página" disabled={page === TOTAL_PAGES || Boolean(turn)} onClick={nextPage}>
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </IconButton>
            <IconButton label="Ir para a última página" disabled={page === TOTAL_PAGES || Boolean(turn)} onClick={() => goTo(TOTAL_PAGES, 'next')}>
              <ChevronsRight className="h-5 w-5" strokeWidth={2} />
            </IconButton>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="absolute inset-x-10 bottom-0 h-12 translate-y-7 rounded-[50%] bg-black/20 blur-2xl" />
            <div className="relative aspect-square w-full rounded-[24px] bg-[#f2e7d9] p-[2.4%] shadow-[0_28px_90px_rgba(0,0,0,0.16)] ring-1 ring-black/5 [perspective:1800px]">
              <div className="pointer-events-none absolute inset-y-[4%] left-[2.4%] z-20 w-8 rounded-l-[18px] bg-gradient-to-r from-black/18 to-transparent" />
              <div className="pointer-events-none absolute inset-y-[4%] right-[2.4%] z-20 w-8 rounded-r-[18px] bg-gradient-to-l from-black/12 to-transparent" />
              <div className="absolute inset-[2.4%] overflow-hidden rounded-[18px] bg-white">
                <PageImage page={revealedPage} alt={`Página ${revealedPage} de Unidos pela Bravura`} eager={page === 1} />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/12 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent" />
              </div>
              <div className="absolute inset-[2.4%] overflow-hidden rounded-[18px] bg-white">
                <PageImage page={visiblePage} alt={`Página ${visiblePage} de Unidos pela Bravura`} eager={page === 1} />
              </div>
              {turn && (
                <div
                  className={`absolute inset-[2.4%] z-30 overflow-hidden rounded-[18px] bg-white shadow-[0_18px_56px_rgba(0,0,0,0.22)] [transform-style:preserve-3d] ${
                    turn.direction === 'next' ? 'bravura-flip-next origin-left' : 'bravura-flip-previous origin-right'
                  }`}
                >
                  <PageImage page={turningPage} alt="" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/18 via-transparent to-white/20 mix-blend-multiply" />
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.07)] ring-1 ring-black/5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4 text-[#515154]">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-[#0066cc]" strokeWidth={1.8} />
                Página {page} de {TOTAL_PAGES}
              </span>
              <span className="text-sm font-semibold text-[#0066cc]">{Math.round((page / TOTAL_PAGES) * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max={TOTAL_PAGES}
              value={page}
              disabled={Boolean(turn)}
              onChange={(event) => goTo(Number(event.target.value))}
              className="mt-5 h-2 w-full cursor-pointer accent-[#0066cc] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Selecionar página"
            />
            <div className="mt-5 grid grid-cols-4 gap-2">
              {pageMarkers.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={Boolean(turn)}
                  onClick={() => goTo(item)}
                  className={`min-h-[36px] rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 disabled:cursor-not-allowed disabled:opacity-45 ${
                    item === page
                      ? 'bg-[#0066cc] text-white'
                      : 'bg-[#f5f5f7] text-[#515154] hover:bg-[#e8f1fb] hover:text-[#0066cc]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed tracking-[-0.01em] text-[#6e6e73]">
              Use os botões, o seletor ou o modo automático para navegar pelo volume único.
            </p>
          </aside>
        </main>
      </div>
    </section>
  );
}
