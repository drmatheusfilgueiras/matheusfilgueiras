import React from 'react';
import { Helmet } from 'react-helmet';
import Seo from '@/components/Seo';
import UnidosBravuraFlipbook from '@/components/UnidosBravuraFlipbook';

const title = 'Unidos pela Bravura - Pre-validacao';
const description = 'Leitura interativa em formato flipbook da versao de pre-validacao de Unidos pela Bravura.';

export default function PreValidationBookPage() {
  return (
    <>
      <Helmet>
        <title>{title} | Matheus Filgueiras</title>
        <meta name="description" content={description} />
      </Helmet>
      <Seo
        title={`${title} | Matheus Filgueiras`}
        description={description}
        image="/assets/pre-validation-book/pages/page-01.jpg"
        siteName="Matheus Filgueiras"
      />
      <UnidosBravuraFlipbook
        assetBasePath="/assets/pre-validation-book/pages"
        assetVersion="20260916-pre-validation-51p"
        imageSize={1575}
        title={title}
        totalPages={51}
      />
    </>
  );
}
