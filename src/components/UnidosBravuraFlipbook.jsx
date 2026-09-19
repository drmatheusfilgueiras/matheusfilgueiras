import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TURN_MS = 620;

const DEFAULT_BOOK = {
  assetBasePath: '/assets/unidos-pela-bravura/pages',
  assetVersion: '20260916-volume-unico-62p',
  imageSize: 1575,
  title: 'Unidos pela Bravura',
  totalPages: 62,
};

function totalSpreads(totalPages) {
  return Math.ceil((totalPages - 2) / 2) + 2;
}

function getSpread(spreadIndex, totalPages) {
  if (spreadIndex === 0) {
    return { left: null, right: 1 };
  }

  if (spreadIndex === totalSpreads(totalPages) - 1) {
    return { left: null, right: totalPages };
  }

  const left = spreadIndex * 2;
  const right = left + 1 < totalPages ? left + 1 : null;

  return { left, right };
}

function isSinglePageSpread(spread) {
  return !spread.left && Boolean(spread.right);
}

function getDisplaySpread(turn, fallbackSpread) {
  if (!turn) {
    return fallbackSpread;
  }

  if (turn.direction === 'next') {
    if (isSinglePageSpread(turn.from) || isSinglePageSpread(turn.to)) {
      return turn.to;
    }

    return {
      left: turn.from.left,
      right: turn.to.right,
    };
  }

  if (isSinglePageSpread(turn.from) || isSinglePageSpread(turn.to)) {
    return turn.to;
  }

  return {
    left: turn.to.left,
    right: turn.from.right,
  };
}

function PageImage({ page, pageSrc, title, imageSize, eager = false }) {
  if (!page) {
    return <div className="h-full w-full bg-[#f5f5f7]" aria-hidden="true" />;
  }

  return (
    <img
      src={pageSrc(page)}
      alt={`Página ${page} de ${title}`}
      width={imageSize}
      height={imageSize}
      draggable="false"
      loading={eager ? 'eager' : 'lazy'}
      className="h-full w-full select-none object-cover"
    />
  );
}

function SideButton({ direction, disabled, onClick }) {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={isPrevious ? 'Página anterior' : 'Próxima página'}
      disabled={disabled}
      onClick={onClick}
      className={`fixed top-1/2 z-40 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#1d1d1f] shadow-[0_14px_40px_rgba(0,0,0,0.16)] ring-1 ring-black/10 backdrop-blur transition hover:scale-105 hover:text-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 disabled:pointer-events-none disabled:opacity-20 sm:h-14 sm:w-14 ${
        isPrevious ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
      }`}
    >
      <Icon className="h-7 w-7" strokeWidth={1.8} />
    </button>
  );
}

function BackToSiteButton() {
  return (
    <a
      href="/"
      aria-label="Voltar ao site"
      className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/82 text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-black/10 backdrop-blur transition hover:scale-105 hover:text-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 sm:left-6 sm:top-6"
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={1.9} />
    </a>
  );
}

function KeyboardCue() {
  return (
    <div
      aria-label="Use as setas do teclado para navegar"
      className="pointer-events-none fixed right-4 top-4 z-30 hidden items-center gap-1 rounded-full bg-white/70 px-2.5 py-2 text-[11px] font-semibold text-[#1d1d1f]/55 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur sm:right-6 sm:top-6 sm:flex"
    >
      <span className="rounded-full bg-black/5 px-2 py-1">←</span>
      <span className="rounded-full bg-black/5 px-2 py-1">→</span>
    </div>
  );
}

function BookPage({ page, side, pageSrc, title, imageSize, eager = false }) {
  const radius = side === 'single' ? 'rounded-[10px]' : side === 'left' ? 'rounded-l-[10px]' : 'rounded-r-[10px]';
  const shade =
    side === 'single'
      ? ''
      : side === 'left'
      ? 'after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-gradient-to-l after:from-black/12 after:to-transparent'
      : 'after:absolute after:inset-y-0 after:left-0 after:w-8 after:bg-gradient-to-r after:from-black/14 after:to-transparent';

  return (
    <div className={`relative h-full overflow-hidden bg-white ${radius} ${shade}`}>
      <PageImage page={page} pageSrc={pageSrc} title={title} imageSize={imageSize} eager={eager} />
    </div>
  );
}

function TurningPage({ direction, frontPage, backPage, pageSrc, title, imageSize, fullPage = false }) {
  const isNext = direction === 'next';
  const frontPlacement = fullPage
    ? 'inset-0 rounded-[10px]'
    : isNext
    ? 'inset-y-0 right-0 w-1/2 rounded-r-[10px]'
    : 'inset-y-0 left-0 w-1/2 rounded-l-[10px]';
  const backPlacement = fullPage
    ? 'inset-0 rounded-[10px]'
    : isNext
    ? 'inset-y-0 left-0 w-1/2 rounded-l-[10px]'
    : 'inset-y-0 right-0 w-1/2 rounded-r-[10px]';
  const frontOrigin = isNext ? 'origin-left' : 'origin-right';
  const backOrigin = isNext ? 'origin-right' : 'origin-left';

  return (
    <>
      <div
        className={`bravura-turn-front absolute z-40 overflow-hidden bg-white shadow-[0_18px_56px_rgba(0,0,0,0.18)] ${frontPlacement} ${frontOrigin}`}
        aria-hidden="true"
      >
        <PageImage page={frontPage} pageSrc={pageSrc} title={title} imageSize={imageSize} />
        <div
          className={`pointer-events-none absolute inset-0 mix-blend-multiply ${
            isNext
              ? 'bg-gradient-to-l from-black/22 via-transparent to-white/18'
              : 'bg-gradient-to-r from-black/22 via-transparent to-white/18'
          }`}
        />
      </div>
      {!fullPage && (
        <div
          className={`bravura-turn-back absolute z-40 overflow-hidden bg-white shadow-[0_18px_56px_rgba(0,0,0,0.16)] ${backPlacement} ${backOrigin}`}
          aria-hidden="true"
        >
          <PageImage page={backPage} pageSrc={pageSrc} title={title} imageSize={imageSize} />
          <div
            className={`pointer-events-none absolute inset-0 mix-blend-multiply ${
              isNext
                ? 'bg-gradient-to-r from-black/18 via-transparent to-white/12'
                : 'bg-gradient-to-l from-black/18 via-transparent to-white/12'
            }`}
          />
        </div>
      )}
    </>
  );
}

function ReadingProgress({ currentPage, totalPages }) {
  const progress = Math.min(Math.max((currentPage / totalPages) * 100, 0), 100);
  const remainingPages = Math.max(totalPages - currentPage, 0);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-8"
      aria-label={`Página ${currentPage} de ${totalPages}. Faltam ${remainingPages} páginas.`}
    >
      <div className="relative w-full max-w-[520px]">
        <div className="h-[3px] overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#1d1d1f]/45 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className="absolute -top-7 -translate-x-1/2 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium leading-none text-[#1d1d1f]/70 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur transition-[left] duration-300 ease-out"
          style={{ left: `clamp(2rem, ${progress}%, calc(100% - 2rem))` }}
        >
          {currentPage}/{totalPages}
        </div>
      </div>
    </div>
  );
}

export default function UnidosBravuraFlipbook({
  assetBasePath = DEFAULT_BOOK.assetBasePath,
  assetVersion = DEFAULT_BOOK.assetVersion,
  imageSize = DEFAULT_BOOK.imageSize,
  title = DEFAULT_BOOK.title,
  totalPages = DEFAULT_BOOK.totalPages,
} = {}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const timeoutRef = useRef(null);
  const totalSpreadCount = useMemo(() => totalSpreads(totalPages), [totalPages]);
  const pageSrc = useCallback(
    (page) => `${assetBasePath}/page-${String(page).padStart(2, '0')}.jpg?v=${assetVersion}`,
    [assetBasePath, assetVersion],
  );

  const spread = useMemo(() => getSpread(spreadIndex, totalPages), [spreadIndex, totalPages]);

  const clearTurnTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const goToSpread = useCallback(
    (target, direction) => {
      const safeTarget = Math.min(Math.max(target, 0), totalSpreadCount - 1);

      if (turn || safeTarget === spreadIndex) {
        return;
      }

      clearTurnTimer();
      setTurn({
        direction,
        from: getSpread(spreadIndex, totalPages),
        to: getSpread(safeTarget, totalPages),
      });

      timeoutRef.current = window.setTimeout(() => {
        setSpreadIndex(safeTarget);
        setTurn(null);
        timeoutRef.current = null;
      }, TURN_MS);
    },
    [clearTurnTimer, spreadIndex, totalPages, totalSpreadCount, turn],
  );

  const previousSpread = useCallback(() => {
    goToSpread(spreadIndex - 1, 'previous');
  }, [goToSpread, spreadIndex]);

  const nextSpread = useCallback(() => {
    goToSpread(spreadIndex + 1, 'next');
  }, [goToSpread, spreadIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSpread();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousSpread();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSpread, previousSpread]);

  useEffect(() => {
    [spreadIndex - 1, spreadIndex, spreadIndex + 1]
      .filter((item) => item >= 0 && item < totalSpreadCount)
      .flatMap((item) => Object.values(getSpread(item, totalPages)))
      .filter(Boolean)
      .forEach((page) => {
        const image = new Image();
        image.src = pageSrc(page);
      });
  }, [pageSrc, spreadIndex, totalPages, totalSpreadCount]);

  useEffect(() => clearTurnTimer, [clearTurnTimer]);

  const displayedSpread = getDisplaySpread(turn, spread);
  const turningSpread = turn?.from;
  const isTurningFromCover = Boolean(turn && !turn.from.left);
  const isDisplayCover = !displayedSpread.left;
  const isTurningToCover = Boolean(turn && !turn.to.left);
  const canGoPrevious = spreadIndex > 0 && !turn;
  const canGoNext = spreadIndex < totalSpreadCount - 1 && !turn;
  const currentPage = displayedSpread.right ?? displayedSpread.left ?? 1;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#1d1d1f] sm:px-20">
      <BackToSiteButton />
      <KeyboardCue />
      <SideButton direction="previous" disabled={!canGoPrevious} onClick={previousSpread} />
      <SideButton direction="next" disabled={!canGoNext} onClick={nextSpread} />
      <ReadingProgress currentPage={currentPage} totalPages={totalPages} />

      <div
        className="relative mx-auto"
        style={{ width: isDisplayCover ? 'min(82vw, 560px)' : 'min(96vw, 1120px)' }}
      >
        <div
          className={`relative grid aspect-[2/1] overflow-visible rounded-[10px] [perspective:2200px] ${
            isDisplayCover ? 'aspect-square grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {!isDisplayCover && (
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[2.2%] -translate-x-1/2 bg-gradient-to-r from-black/16 via-black/6 to-white/18" />
          )}

          {!isDisplayCover && (
            <BookPage
              page={displayedSpread.left}
              side="left"
              pageSrc={pageSrc}
              title={title}
              imageSize={imageSize}
              eager={spreadIndex <= 1}
            />
          )}
          <BookPage
            page={displayedSpread.right}
            side={isDisplayCover ? 'single' : 'right'}
            pageSrc={pageSrc}
            title={title}
            imageSize={imageSize}
            eager={spreadIndex <= 1}
          />

          {turn?.direction === 'next' && turningSpread?.right && turn.to.left && (
            <TurningPage
              direction="next"
              frontPage={turningSpread.right}
              backPage={turn.to.left}
              pageSrc={pageSrc}
              title={title}
              imageSize={imageSize}
              fullPage={isTurningFromCover}
            />
          )}

          {turn?.direction === 'previous' && turningSpread?.left && turn.to.right && (
            <TurningPage
              direction="previous"
              frontPage={turningSpread.left}
              backPage={turn.to.right}
              pageSrc={pageSrc}
              title={title}
              imageSize={imageSize}
              fullPage={isTurningToCover}
            />
          )}
        </div>
      </div>
    </main>
  );
}
