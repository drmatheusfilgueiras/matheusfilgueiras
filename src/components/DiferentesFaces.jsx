import React, { useState, useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

/**
 * Each face is rendered as its own `<img>` with a STATIC string-literal `src`
 * (not a variable/expression). That lets the visual editor assign each image
 * its own directly-editable id, so updating one face's photo never touches the
 * others. Do NOT refactor these back into a mapped/dynamic `src={...}` — that
 * regresses the bug where all six images change together.
 */
const DiferentesFaces = ({
  faces,
  scrollNarrative = false
}) => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!scrollNarrative || reduceMotion || faces.length === 0) return;
    const nextIndex = Math.min(faces.length - 1, Math.max(0, Math.floor(latest * faces.length)));
    setActive(nextIndex);
  });

  return <div ref={sectionRef} className={`mt-14 ${scrollNarrative ? 'lg:h-[520vh]' : ''}`}>
          <div className={`grid gap-10 border-t border-border pt-10 lg:grid-cols-[20rem_1fr] lg:gap-16 ${scrollNarrative ? 'lg:sticky lg:top-24 lg:min-h-[calc(100vh-6rem)] lg:items-center' : ''}`}>
            {/* Lista vertical */}
            <ul className="flex flex-col">
                {faces.map((item, i) => {
        const isActive = i === active;
        return <li key={item.titulo}>
                            <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className="group flex w-full items-center gap-4 border-b border-border py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-4 focus-visible:ring-offset-background" aria-expanded={isActive}>
                                <span className={`font-script text-2xl leading-none transition-all duration-300 sm:text-3xl ${isActive ? 'text-primary translate-x-1' : 'text-foreground/70 group-hover:text-foreground'}`}>
                                    {item.titulo}
                                </span>
                                <span aria-hidden="true" className={`ml-auto h-px transition-all duration-300 ${isActive ? 'w-8 bg-primary' : 'w-0 bg-primary/40'}`} />
                            </button>
                        </li>;
      })}
            </ul>

            {/* Imagem + texto — cada face é um bloco independente com src literal estático */}
            <div className="relative min-h-[20rem] sm:min-h-[24rem]">
                {faces.map((item, i) => {
        const isActive = i === active;
        return <div key={item.titulo} className="absolute inset-0 flex flex-col transition-opacity duration-500 ease-out" style={{
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? 'auto' : 'none'
        }} aria-hidden={!isActive}>
                            <div className="relative aspect-[4/3] w-full overflow-hidden border border-border/80 bg-secondary">
                                {i === 0 && <img src="/assets/photos/linguagem-odontologia.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                                {i === 1 && <img src="/assets/photos/linguagem-ciencia.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                                {i === 2 && <img src="/assets/photos/linguagem-desenho.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                                {i === 3 && <img src="/assets/photos/linguagem-escrita.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                                {i === 4 && <img src="/assets/photos/linguagem-design-laptop-20260819.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                                {i === 5 && <img src="/assets/photos/linguagem-tecnologia.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]" />}
                            </div>
                            <div className="mt-6 max-w-[40rem]">
                                <h3 className="text-xl font-medium tracking-tight text-foreground">
                                    {item.titulo}
                                </h3>
                                <p className="mt-3 text-[1rem] leading-relaxed text-muted-foreground">
                                    {item.texto}
                                </p>
                            </div>
                        </div>;
      })}
            </div>
          </div>
        </div>;
};
export default DiferentesFaces;
