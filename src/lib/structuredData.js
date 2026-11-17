const origin = 'https://matheusfilgueiras.com';
export const personId = origin + '/#matheus-filgueiras';
export const websiteId = origin + '/#website';

export const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'Matheus Filgueiras',
  url: origin + '/',
  image: origin + '/assets/photos/retrato-editorial-hero.jpg',
  description: 'Cirurgião-dentista e mestrando em Odontologia pela Universidade Federal Fluminense, com atuação clínica e projetos de pesquisa, ensino e criação.',
  jobTitle: 'Cirurgião-dentista',
  hasCredential: { '@type': 'EducationalOccupationalCredential', credentialCategory: 'CRO/RJ 59298' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidade Federal Fluminense' },
  knowsAbout: ['Odontologia', 'Pesquisa científica', 'Impressão 3D odontológica', 'Planejamento estético digital', 'Desenho', 'Fotografia'],
  sameAs: [
    'https://instagram.com/dr.matheusfilgueiras',
    'https://www.linkedin.com/in/matheusfilgueiras',
    'https://lattes.cnpq.br/5800213853757398'
  ],
  email: 'mailto:matheusfilgueiras.dr@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Nova Friburgo', addressRegion: 'RJ', addressCountry: 'BR' }
};

export const website = {
  '@type': 'WebSite',
  '@id': websiteId,
  name: 'Matheus Filgueiras',
  url: origin + '/',
  inLanguage: 'pt-BR',
  description: 'Site pessoal e profissional com pesquisas, projetos, interesses e informações de atendimento.',
  publisher: { '@id': personId }
};

export const braveryBook = {
  '@type': 'Book',
  '@id': origin + '/unidos_pela_bravura#livro',
  name: 'Unidos pela Bravura',
  inLanguage: 'pt-BR',
  url: origin + '/unidos_pela_bravura',
  image: origin + '/assets/projects/unidos-pela-bravura-wide.jpg',
  description: 'Livro infantil voltado à comunicação sobre medo e ansiedade na experiência odontológica.',
  author: { '@id': personId }
};

export const digitalPlanningMaterial = {
  '@type': 'CreativeWork',
  name: 'Planejamento Estético Digital 2D',
  inLanguage: 'pt-BR',
  description: 'E-book e atividades educativas sobre planejamento estético digital em Odontologia.',
  creator: { '@id': personId }
};

export function getStructuredData(pathname = '/') {
  const graph = [person, website];
  if (pathname === '/') {
    graph.push(braveryBook, digitalPlanningMaterial);
  } else if (pathname === '/unidos_pela_bravura') {
    graph.push(braveryBook);
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': origin + pathname + '#webpage',
      url: origin + pathname,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': websiteId },
      about: { '@id': personId }
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
