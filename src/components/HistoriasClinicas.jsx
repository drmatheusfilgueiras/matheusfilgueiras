import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Histórias Clínicas — galeria horizontal de casos clínicos.
 *
 * Cada caso é renderizado como um bloco independente com imagens ANTES/DEPOIS
 * usando src literais estáticos (não dinâmicos), permitindo edição individual
 * de cada foto no editor visual.
 *
 * Navegação por setas, arrasto (mouse/toque) e teclado. Transições suaves.
 */
const HistoriasClinicas = ({ casos = [] }) => {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const trackRef = useRef(null);
    const dragStartX = useRef(null);
    const dragging = useRef(false);

    const total = casos.length;

    const paginate = useCallback((dir) => {
        setDirection(dir);
        setIndex((prev) => (prev + dir + total) % total);
    }, [total]);

    // Teclado
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'ArrowRight') paginate(1);
        };
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('keydown', onKey);
        return () => el.removeEventListener('keydown', onKey);
    }, [paginate]);

    // Arrasto (mouse + toque)
    const onPointerDown = (e) => {
        dragging.current = true;
        dragStartX.current = e.clientX;
    };
    const onPointerMove = (e) => {
        if (!dragging.current || dragStartX.current === null) return;
        const dx = e.clientX - dragStartX.current;
        if (Math.abs(dx) > 60) {
            paginate(dx < 0 ? 1 : -1);
            dragging.current = false;
            dragStartX.current = null;
        }
    };
    const onPointerUp = () => {
        dragging.current = false;
        dragStartX.current = null;
    };

    const current = casos[index];

    return (
        <div className="mt-14 border-t border-border pt-10">
            {/* Janela da galeria */}
            <div
                ref={trackRef}
                tabIndex={0}
                role="region"
                aria-roledescription="carrossel"
                aria-label="Histórias clínicas"
                className="relative select-none outline-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                style={{ cursor: 'grab' }}
            >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={index}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Identificação do caso */}
                        <div className="flex flex-wrap items-baseline justify-between gap-4">
                            <div>
                                <span className="text-[0.7rem] tracking-[0.3em] text-primary/60">
                                    {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                                </span>
                                <h3 className="mt-2 text-2xl font-light tracking-tight text-foreground sm:text-[1.9rem]">
                                    {current.titulo}
                                </h3>
                                {current.procedimento && (
                                    <p className="mt-2 text-[0.74rem] uppercase tracking-[0.22em] text-primary">
                                        {current.procedimento}
                                    </p>
                                )}
                            </div>
                            {current.nota && (
                                <p className="max-w-[26rem] text-[0.95rem] font-light leading-relaxed text-muted-foreground">
                                    {current.nota}
                                </p>
                            )}
                        </div>

                        {/* ANTES / DEPOIS — lado a lado no desktop, empilhado no mobile */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
                            <figure className="relative overflow-hidden border border-border bg-secondary">
                                <span className="absolute left-3 top-3 z-10 bg-background/90 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-primary">
                                    Antes
                                </span>
                                <img
                                    src={current.antes}
                                    alt={`${current.titulo}, antes`}
                                    loading="lazy"
                                    draggable={false}
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </figure>
                            <figure className="relative overflow-hidden border border-border bg-secondary">
                                <span className="absolute left-3 top-3 z-10 bg-background/90 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-primary">
                                    Depois
                                </span>
                                <img
                                    src={current.depois}
                                    alt={`${current.titulo}, depois`}
                                    loading="lazy"
                                    draggable={false}
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </figure>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controles */}
            <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2" aria-hidden="true">
                    {casos.map((c, i) => (
                        <button
                            key={c.titulo}
                            type="button"
                            onClick={() => {
                                setDirection(i > index ? 1 : -1);
                                setIndex(i);
                            }}
                            aria-label={`Ir para o caso ${i + 1}: ${c.titulo}`}
                            className={`h-1.5 transition-all duration-300 ${i === index ? 'w-8 bg-primary' : 'w-3 bg-primary/25 hover:bg-primary/50'}`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => paginate(-1)}
                        aria-label="Caso anterior"
                        className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.96]"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                    <button
                        type="button"
                        onClick={() => paginate(1)}
                        aria-label="Próximo caso"
                        className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.96]"
                    >
                        <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoriasClinicas;
