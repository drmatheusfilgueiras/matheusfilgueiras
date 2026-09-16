import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TOTAL_PAGES = 61;
const TURN_MS = 620;
const TOTAL_SPREADS = Math.ceil((TOTAL_PAGES - 1) / 2) + 1;

const pageSrc = (page) => `/assets/unidos-pela-bravura/pages/page-${String(page).padStart(2, '0')}.jpg`;

function getSpread(spreadIndex) {
  if (spreadIndex === 0) {
    return { left: null, right: 1 };
  }

  const left = spreadIndex * 2;
  const right = left + 1 <= TOTAL_PAGES ? left + 1 : null;

  return { left, right };
}

function getDisplaySpread(turn, fallbackSpread) {
  if (!turn) {
    return fallbackSpread;
  }

  if (turn.direction === 'next') {
    if (!turn.from.left) {
      return turn.to;
    }

    return {
      left: turn.from.left,
      right: turn.to.right,
    };
  }

  if (!turn.to.left) {
    return turn.to;
  }

  return {
    left: turn.to.left,
    right: turn.from.right,
  };
}

function PageImage({ page, eager = false }) {
  if (!page) {
    return <div className="h-full w-full bg-[#f5f5f7]" aria-hidden="true" />;
  }

  return (
    <img
      src={pageSrc(page)}
      alt={`Página ${page} de Unidos pela Bravura`}
      width="945"
      height="945"
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

function BookPage({ page, side, eager = false }) {
  const radius = side === 'single' ? 'rounded-[10px]' : side === 'left' ? 'rounded-l-[10px]' : 'rounded-r-[10px]';
  const shade =
    side === 'single'
      ? ''
      : side === 'left'
      ? 'after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-gradient-to-l after:from-black/12 after:to-transparent'
      : 'after:absolute after:inset-y-0 after:left-0 after:w-8 after:bg-gradient-to-r after:from-black/14 after:to-transparent';

  return (
    <div className={`relative h-full overflow-hidden bg-white ${radius} ${shade}`}>
      <PageImage page={page} eager={eager} />
    </div>
  );
}

function TurningPage({ direction, frontPage, backPage, fullPage = false }) {
  const isNext = direction === 'next';
  const frontPlacement = fullPage
    ? 'inset-[1.2%] rounded-[10px]'
    : isNext
    ? 'inset-y-[1.2%] right-[1.2%] w-[48.8%] rounded-r-[10px]'
    : 'inset-y-[1.2%] left-[1.2%] w-[48.8%] rounded-l-[10px]';
  const backPlacement = fullPage
    ? 'inset-[1.2%] rounded-[10px]'
    : isNext
    ? 'inset-y-[1.2%] left-[1.2%] w-[48.8%] rounded-l-[10px]'
    : 'inset-y-[1.2%] right-[1.2%] w-[48.8%] rounded-r-[10px]';
  const frontOrigin = isNext ? 'origin-left' : 'origin-right';
  const backOrigin = isNext ? 'origin-right' : 'origin-left';

  return (
    <>
      <div
        className={`bravura-turn-front absolute z-40 overflow-hidden bg-white shadow-[0_18px_56px_rgba(0,0,0,0.18)] ${frontPlacement} ${frontOrigin}`}
        aria-hidden="true"
      >
        <PageImage page={frontPage} />
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
          <PageImage page={backPage} />
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

export default function UnidosBravuraFlipbook() {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const timeoutRef = useRef(null);

  const spread = useMemo(() => getSpread(spreadIndex), [spreadIndex]);

  const clearTurnTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const goToSpread = useCallback(
    (target, direction) => {
      const safeTarget = Math.min(Math.max(target, 0), TOTAL_SPREADS - 1);

      if (turn || safeTarget === spreadIndex) {
        return;
      }

      clearTurnTimer();
      setTurn({
        direction,
        from: getSpread(spreadIndex),
        to: getSpread(safeTarget),
      });

      timeoutRef.current = window.setTimeout(() => {
        setSpreadIndex(safeTarget);
        setTurn(null);
        timeoutRef.current = null;
      }, TURN_MS);
    },
    [clearTurnTimer, spreadIndex, turn],
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
      .filter((item) => item >= 0 && item < TOTAL_SPREADS)
      .flatMap((item) => Object.values(getSpread(item)))
      .filter(Boolean)
      .forEach((page) => {
        const image = new Image();
        image.src = pageSrc(page);
      });
  }, [spreadIndex]);

  useEffect(() => clearTurnTimer, [clearTurnTimer]);

  const displayedSpread = getDisplaySpread(turn, spread);
  const turningSpread = turn?.from;
  const isTurningFromCover = Boolean(turn && !turn.from.left);
  const isDisplayCover = !displayedSpread.left;
  const isTurningToCover = Boolean(turn && !turn.to.left);
  const canGoPrevious = spreadIndex > 0 && !turn;
  const canGoNext = spreadIndex < TOTAL_SPREADS - 1 && !turn;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#1d1d1f] sm:px-20">
      <SideButton direction="previous" disabled={!canGoPrevious} onClick={previousSpread} />
      <SideButton direction="next" disabled={!canGoNext} onClick={nextSpread} />

      <div
        className="relative mx-auto"
        style={{ width: isDisplayCover ? 'min(82vw, 560px)' : 'min(96vw, 1120px)' }}
      >
        <div className="absolute inset-x-[8%] bottom-0 h-12 translate-y-8 rounded-[50%] bg-black/20 blur-2xl" />
        <div
          className={`relative grid aspect-[2/1] overflow-visible rounded-[12px] bg-[#ede9e0] p-[1.2%] shadow-[0_28px_90px_rgba(0,0,0,0.18)] ring-1 ring-black/10 [perspective:2200px] ${
            isDisplayCover ? 'aspect-square grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {!isDisplayCover && (
            <div className="pointer-events-none absolute inset-y-[1.2%] left-1/2 z-30 w-[2.2%] -translate-x-1/2 bg-gradient-to-r from-black/16 via-black/6 to-white/18" />
          )}

          {!isDisplayCover && <BookPage page={displayedSpread.left} side="left" eager={spreadIndex <= 1} />}
          <BookPage page={displayedSpread.right} side={isDisplayCover ? 'single' : 'right'} eager={spreadIndex <= 1} />

          {turn?.direction === 'next' && turningSpread?.right && turn.to.left && (
            <TurningPage
              direction="next"
              frontPage={turningSpread.right}
              backPage={turn.to.left}
              fullPage={isTurningFromCover}
            />
          )}

          {turn?.direction === 'previous' && turningSpread?.left && turn.to.right && (
            <TurningPage
              direction="previous"
              frontPage={turningSpread.left}
              backPage={turn.to.right}
              fullPage={isTurningToCover}
            />
          )}
        </div>
      </div>
    </main>
  );
}
