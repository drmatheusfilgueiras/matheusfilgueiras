import React from 'react';
import { Helmet } from 'react-helmet';

function PprPlannerPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <Helmet>
        <title>Planejador de PPR | Matheus Filgueiras</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Área reservada para o planejador de Prótese Parcial Removível." />
      </Helmet>

      <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0066cc]">Planejador de PPR</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Em reconstrução.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6e6e73] sm:text-lg">
            Este caminho está reservado para a próxima versão do planejador.
          </p>
        </div>
      </section>
    </main>
  );
}

export default PprPlannerPage;
