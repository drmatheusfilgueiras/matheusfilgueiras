import React from 'react';
import { Helmet } from 'react-helmet';
import Seo from '@/components/Seo';
import UnidosBravuraFlipbook from '@/components/UnidosBravuraFlipbook';

export default function UnidosBravuraPage() {
  return (
    <>
      <h1 className="sr-only">Unidos pela Bravura</h1>
      <p className="sr-only">Livro infantil que apresenta experiências de crianças no atendimento odontológico e propõe uma conversa sobre medo e ansiedade. A leitura interativa utiliza imagens e navegação por páginas.</p>
      <Helmet>
        <title>Unidos pela Bravura | Matheus Filgueiras</title>
        <meta
          name="description"
          content="Leitura interativa em formato flipbook do livro Unidos pela Bravura."
        />
      </Helmet>
      <Seo
        title="Unidos pela Bravura | Matheus Filgueiras"
        description="Leitura interativa em formato flipbook do livro Unidos pela Bravura."
        image="/assets/unidos-pela-bravura/pages/page-01.jpg"
        siteName="Matheus Filgueiras"
        url="https://matheusfilgueiras.com/unidos_pela_bravura"
      />
      <UnidosBravuraFlipbook />
    </>
  );
}
