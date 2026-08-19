import React, { useState } from 'react';

/**
 * Each face is rendered as its own `<img>` with a STATIC string-literal `src`
 * (not a variable/expression). That lets the visual editor assign each image
 * its own directly-editable id, so updating one face's photo never touches the
 * others. Do NOT refactor these back into a mapped/dynamic `src={...}` — that
 * regresses the bug where all six images change together.
 */
const DiferentesFaces = ({
  faces
}) => {
  const [active, setActive] = useState(0);
  return <div className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
            {/* Lista vertical */}
            <ul className="flex flex-col">
                {faces.map((item, i) => {
        const isActive = i === active;
        return <li key={item.titulo}>
                            <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className="group flex w-full items-center gap-4 border-b border-border py-4 text-left transition-colors" aria-expanded={isActive}>
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
                            <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-secondary">
                                {i === 0 && <img src="https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/odontologia-wxT0H.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
                                {i === 1 && <img src="https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/ciaancia-2M5HW.png" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
                                {i === 2 && <img src="https://images.hostinger.com/ebf733ce-ad35-47fe-850a-d9d3da61d898.png" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
                                {i === 3 && <img src="https://images.hostinger.com/26c84a28-e864-479d-af6a-47b6dcf322ab.png" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
                                {i === 4 && <img src="https://images.hostinger.com/9226ec8f-0dcd-453f-a5cb-c7fc7c111da4.png" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
                                {i === 5 && <img src="https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/tecnologia-L23xY.jpg" alt={item.titulo} loading="lazy" className="h-full w-full object-cover" />}
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
        </div>;
};
export default DiferentesFaces;
