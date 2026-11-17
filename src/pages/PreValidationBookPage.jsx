import React from 'react';
import { Helmet } from 'react-helmet';
import Seo from '@/components/Seo';
import UnidosBravuraFlipbook from '@/components/UnidosBravuraFlipbook';

const title = 'Unidos pela Bravura - Pre-validacao';
const description = 'Leitura interativa em formato flipbook da versao de pre-validacao de Unidos pela Bravura.';

export default function PreValidationBookPage() {
  return (
    <>
      <h1 className="sr-only">Unidos pela Bravura — pré-validação</h1>
      <p className="sr-only">Versão de pré-validação do livro infantil Unidos pela Bravura, disponibilizada em formato de leitura interativa por páginas. Trata-se de material de avaliação e não da publicação definitiva.</p>
      <Helmet>
        <title>{title} | Matheus Filgueiras</title>
        <meta name="description" content={description} />
      </Helmet>
      <Seo
        title={`${title} | Matheus Filgueiras`}
        description={description}
        image="/assets/pre-validation-book/pages/page-01.jpg"
        siteName="Matheus Filgueiras"
        url="https://matheusfilgueiras.com/pre_validation_book"
      />
      <UnidosBravuraFlipbook
        assetBasePath="/assets/pre-validation-book/pages"
        assetVersion="20260918-pre-validation-51p"
        imageSize={1575}
        title={title}
        totalPages={51}
      />
    </>
  );
}
