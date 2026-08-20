import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Instagram, Linkedin, Mail, FileText, Menu, X } from 'lucide-react';
import Reveal from '@/components/Reveal';
import DiferentesFaces from '@/components/DiferentesFaces';
import HistoriasClinicas from '@/components/HistoriasClinicas';
const IMG_PORTRAIT = '/assets/photos/retrato-editorial-hero.jpg';
const IMG_PRESENTATION = '/assets/photos/apresentacao-naturale.jpg';
const IMG_SEDACAO = '/assets/photos/sedacao-consciente.jpg';
const IMG_PROJECTS = {
  bravura: '/assets/projects/unidos-pela-bravura-wide.jpg',
  pesquisa: '/assets/projects/pesquisa-digital-wide.jpg',
  sedaflow: '/assets/projects/sedaflow-wide.jpg',
  visual: '/assets/projects/comunicacao-visual-brand-20260819.jpg'
};
const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const SEDACAO_URL = 'https://www.instagram.com/p/DbT4X1lhsaw/';
const navLinks = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Atendimento', href: '#atendimento' },
  { label: 'Caminho', href: '#caminho' },
  { label: 'Projeto', href: '#projetos' },
  { label: 'Contato', href: '#contato' },
];
const marqueeWords = ['Odontologia', 'Ciência', 'Arte', 'Design', 'Tecnologia'];
const caminho = [{
  titulo: 'Odontologia',
  lugar: 'Universidade Federal Fluminense',
  texto: 'Foi onde minha trajetória profissional começou, e onde descobri uma área que mistura ciência, habilidade manual, planejamento, estética e cuidado.'
}, {
  titulo: 'Pesquisa',
  lugar: 'Mestrado em Odontologia · UFF',
  texto: 'Hoje continuo minha formação investigando materiais, impressão 3D e novas tecnologias aplicadas à Odontologia. A pesquisa acrescentou uma pergunta que passou a acompanhar quase tudo o que faço: “Por que fazemos dessa maneira?”'
}, {
  titulo: 'Extensão, ensino e projetos',
  lugar: 'Ligas acadêmicas e iniciativas',
  texto: 'Ao longo dessa trajetória, participei da construção de ligas acadêmicas, projetos de extensão, atividades científicas e iniciativas que me aproximaram também do ensino e da comunicação. Mais do que preencher uma linha do currículo, foram experiências que me ensinaram a trabalhar com pessoas, organizar ideias e transformar projetos em algo que realmente acontecesse.'
}];
const faces = [{
  titulo: 'Odontologia',
  img: '/assets/photos/linguagem-odontologia.jpg',
  texto: 'Clínica, planejamento, reabilitação oral e odontologia digital. Tenho especial interesse nos momentos em que conhecimento técnico, tecnologia e sensibilidade precisam trabalhar juntos.'
}, {
  titulo: 'Ciência',
  img: '/assets/photos/linguagem-ciencia.jpg',
  texto: 'Pesquisa, escrita acadêmica, experimentação e comunicação científica. Mais do que encontrar respostas, gosto do processo de aprender a formular perguntas melhores, inclusive para tomar decisões clínicas com mais critério.'
}, {
  titulo: 'Desenho',
  img: '/assets/photos/linguagem-desenho.jpg',
  texto: 'Antes de algumas ideias virarem projetos, elas viram rabiscos. O desenho treina olhar, proporção e observação, e isso atravessa a forma como planejo, explico e construo soluções.'
}, {
  titulo: 'Escrita',
  img: '/assets/photos/linguagem-escrita.jpg',
  texto: 'Artigos, histórias, roteiros e ideias. Escrever é uma maneira de organizar pensamentos, traduzir temas complexos e comunicar melhor aquilo que precisa ser compreendido.'
}, {
  titulo: 'Design',
  img: '/assets/photos/linguagem-design-laptop-20260819.jpg',
  texto: 'Identidades visuais, apresentações, fotografia, conteúdo e experiência. Não penso em design como decoração, mas como uma forma de organizar informação, planejamento, experiência e comunicação.'
}, {
  titulo: 'Tecnologia',
  img: '/assets/photos/linguagem-tecnologia.jpg',
  texto: 'Fluxos digitais, impressão 3D, inteligência artificial, interfaces e desenvolvimento de novos projetos. A tecnologia me interessa quando amplia possibilidades clínicas, criativas e humanas.'
}];
const projetos = [{
  num: '01',
  titulo: 'Unidos pela Bravura',
  tags: 'Odontologia · Ciência · Escrita · Ilustração',
  sub: 'Quando uma pesquisa virou história.',
  texto: 'Uma pesquisa em Odontopediatria que se transformou em uma coleção de livros infantis para ajudar crianças a compreender e se preparar melhor para o atendimento odontológico.',
  destaque: 'Ciência, narrativa, ilustração e design reunidos em algo que uma criança pudesse segurar nas mãos.',
  cta: 'Conhecer o projeto',
  href: 'https://www.amazon.com.br/Unidos-pela-Bravura-Matheus-Filgueiras/dp/6501438985',
  img: IMG_PROJECTS.bravura
}, {
  num: '02',
  titulo: 'Pesquisa em Odontologia Digital',
  tags: 'Ciência · Materiais · Impressão 3D',
  sub: 'O que acontece depois que apertamos “imprimir”?',
  texto: 'Minha pesquisa de mestrado investiga materiais utilizados na impressão 3D em Odontologia, aproximando resinas, processos de pós-cura e laboratório da realidade biológica.',
  destaque: 'Um encontro entre Odontologia, ciência e tecnologia.',
  cta: 'Conhecer a pesquisa',
  href: 'https://drive.google.com/file/d/1E6mpmWfzIINpfhY_fl_9ORLJiXTamUrb/view?usp=sharing',
  img: IMG_PROJECTS.pesquisa
}, {
  num: '03',
  titulo: 'SedaFlow',
  tags: 'Odontologia · Produto · Design · Tecnologia',
  sub: 'E se um fluxo clínico pudesse ser repensado?',
  texto: 'SedaFlow nasceu para organizar e simplificar processos relacionados à sedação consciente em Odontologia, reunindo experiência clínica, design de interface e tecnologia.',
  destaque: 'Necessidades clínicas transformadas em decisões de produto.',
  cta: 'Conhecer o projeto',
  href: 'https://sedaflow.com.br/',
  img: IMG_PROJECTS.sedaflow
}, {
  num: '04',
  titulo: 'Comunicação visual',
  tags: 'Design · Fotografia · Ciência',
  sub: 'Nem toda pesquisa precisa parecer uma pesquisa.',
  texto: 'Apresentações, ilustrações, fotografias, vídeos e identidades visuais passaram a fazer parte da maneira como desenvolvo e apresento ideias.',
  destaque: 'Porque comunicar também faz parte de construir.',
  cta: 'Ver trabalhos',
  href: 'https://www.behance.net/matheuscarvalh32',
  img: IMG_PROJECTS.visual
}];
const sedacaoPontos = [{
  titulo: 'Ansiedade',
  texto: 'Para quem sente medo, desconforto ou dificuldade em relaxar durante o atendimento.'
}, {
  titulo: 'Procedimentos longos',
  texto: 'Uma possibilidade para tornar consultas mais extensas mais confortáveis.'
}, {
  titulo: 'Sedação consciente',
  texto: 'Você permanece consciente e responsivo durante todo o atendimento.'
}];
const atendimentoResumo = [{
  titulo: 'Onde atendo',
  texto: 'Nova Friburgo/RJ, na ',
  locais: [{
    rotulo: 'Salud Odontologia',
    href: 'https://maps.app.goo.gl/3Nh823BXRHRjNq5t7'
  }, {
    rotulo: 'Naturale Dental Studio',
    href: 'https://maps.app.goo.gl/36ZhTdptqXVGiW4V7'
  }]
}, {
  titulo: 'Como posso ajudar',
  servicos: [
    'Clareamento dental',
    'Restaurações estéticas',
    'Reabilitação oral',
    'Planejamento digital',
    'Atendimento para pacientes ansiosos',
    'Sedação consciente'
  ]
}, {
  titulo: 'Como agendar',
  texto: 'O primeiro contato acontece pelo WhatsApp. A partir dele, direcionamos o atendimento para o local mais adequado.'
}];
const intersecaoItens = [{
  texto: 'Alguns no papel.',
  img: '/assets/intersecao/no-papel.jpg',
  alt: 'Desenho de um dente feito no papel'
}, {
  texto: 'Outros no computador.',
  img: '/assets/intersecao/no-computador.jpg',
  alt: 'Modelo digital de um dente no computador'
}, {
  texto: 'Alguns através de uma restauração.',
  img: '/assets/intersecao/restauracao.jpg',
  alt: 'Restauração dental segurada com luvas'
}, {
  texto: 'Outros através de um projeto que começa com uma tela em branco.',
  linhasDesktop: ['Outros através de um projeto', 'que começa com uma tela em branco.'],
  img: '/assets/intersecao/quadro-branco.gif',
  alt: 'Fluxo digital de reabilitação em tela branca'
}];
const ondeAtendo = [{
  rotulo: 'Salud Odontologia',
  href: 'https://api.whatsapp.com/send?phone=22992096463&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras'
}, {
  rotulo: 'Naturale Dental Studio',
  href: 'https://api.whatsapp.com/send/?phone=5522998508639&text&type=phone_number&app_absent=0'
}];
const historiasClinicas = [{
  titulo: 'Clareamento de consultório',
  procedimento: null,
  nota: 'Um tratamento planejado para devolver luminosidade ao sorriso de forma gradual, respeitando as características naturais dos dentes e buscando um resultado harmônico, sem excessos.',
  antes: '/assets/cases/clareamento-antes.jpg',
  depois: '/assets/cases/clareamento-depois.jpg'
}, {
  titulo: 'Planejamento Reabilitador',
  procedimento: null,
  nota: 'Um planejamento pensado para melhorar função, estética e proporções do sorriso antes de qualquer intervenção, permitindo visualizar o resultado e conduzir cada etapa com mais previsibilidade.',
  antes: '/assets/cases/planejamento-reabilitador-antes.jpg',
  depois: '/assets/cases/planejamento-reabilitador-depois.jpg'
}, {
  titulo: 'Fechamento de diastema',
  procedimento: 'Resina composta adesiva · 2 elementos',
  nota: 'O espaço entre os incisivos centrais foi fechado sem desgaste dental, preservando a estrutura natural do paciente.',
  antes: 'https://images.hostinger.com/1350fb0d-2215-4a35-bbf0-49cbc5bc7c90.png',
  depois: 'https://images.hostinger.com/5170f588-6a11-4cdb-9605-0c55317d195f.png'
}];
const sobrePalavras = [
  'Pesquisador.',
  'Autor.',
  'Desenhista.',
  'Criador.',
  'Comunicador.',
  'Curioso.',
  'Matheus.',
];

function SobreRotator() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const palavra = sobrePalavras[index];
  const isMatheus = palavra === 'Matheus.';

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % sobrePalavras.length);
    }, 1750);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.78rem] uppercase tracking-[0.28em] text-primary">Eu sou dentista.</p>
        <p className="mt-3 text-[0.78rem] uppercase tracking-[0.28em] text-primary/70">E também...</p>
      </div>
      <div className="relative min-h-[3.8rem] overflow-hidden text-[2.45rem] font-light leading-tight tracking-tight text-foreground sm:text-[2.7rem]">
        <AnimatePresence mode="wait">
          <motion.span
            key={palavra}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={isMatheus ? 'font-script text-primary' : 'block'}
          >
            {palavra}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return <div className="min-h-screen bg-background text-foreground antialiased">
            <Helmet>
                <title>Matheus Filgueiras | Cirurgião-Dentista em Nova Friburgo</title>
                <meta name="description" content="Matheus Filgueiras é cirurgião-dentista e mestrando em Odontologia em Nova Friburgo/RJ. Clínica, planejamento, reabilitação oral, odontologia digital e sedação consciente, com pesquisa, design e tecnologia integrados à prática." />
            </Helmet>

            {/* HEADER */}
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
                <div className="relative mx-auto flex w-full max-w-[90rem] items-center justify-between px-6 py-4 lg:px-12">
                    <a href="#inicio" className="font-script text-2xl italic leading-none text-primary transition-colors hover:text-foreground sm:text-[1.7rem]">
                        Matheus Filgueiras
                    </a>
                    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground lg:flex">
                        {navLinks.map((link) => (
                          <a key={link.href} className="transition-colors hover:text-primary" href={link.href}>{link.label}</a>
                        ))}
                    </nav>
                    <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="hidden min-h-[44px] items-center gap-2 bg-primary px-5 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98] lg:inline-flex">
                        Agendar consulta
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                    </a>
                    <button
                      type="button"
                      aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                      aria-expanded={mobileMenuOpen}
                      onClick={() => setMobileMenuOpen((open) => !open)}
                      className="inline-flex h-11 w-11 items-center justify-center border border-border text-primary transition-colors hover:border-primary lg:hidden"
                    >
                      {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.6} /> : <Menu className="h-5 w-5" strokeWidth={1.6} />}
                    </button>
                </div>
                <AnimatePresence>
                  {mobileMenuOpen && (
                    <motion.nav
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="border-t border-border bg-background px-6 py-6 shadow-[0_18px_40px_-30px_hsl(214_72%_24%/0.4)] lg:hidden"
                      aria-label="Navegação mobile"
                    >
                      <div className="mx-auto flex max-w-[90rem] flex-col gap-5 text-[0.78rem] uppercase tracking-[0.24em] text-muted-foreground">
                        {navLinks.map((link) => (
                          <a key={link.href} className="py-1 transition-colors hover:text-primary" href={link.href} onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
                        ))}
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" onClick={() => setMobileMenuOpen(false)} className="mt-2 inline-flex min-h-[48px] items-center justify-center gap-2 bg-primary px-5 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground">
                          Agendar consulta
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                        </a>
                      </div>
                    </motion.nav>
                  )}
                </AnimatePresence>
            </header>

            {/* 01 — HOME / HERO */}
            <section id="inicio" className="relative overflow-hidden">
                <div className="mx-auto grid w-full max-w-[90rem] items-start gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:pb-24 lg:pt-20">
                    <div className="lg:pt-6">
                        <motion.div initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            ease: 'easeOut'
          }} className="mb-8 text-primary">
                            <p className="text-[0.95rem] font-medium uppercase tracking-[0.34em]">Matheus Filgueiras</p>
                            <p className="mt-2 text-[0.73rem] font-medium tracking-[0.24em]">Cirurgião-dentista</p>
                            <p className="mt-1 text-[0.59rem] font-medium uppercase tracking-[0.24em]">CRO/RJ 59298</p>
                        </motion.div>
                        <h1 className="text-[3.1rem] font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.8rem]">
                            <motion.span initial={{
              opacity: 0,
              y: 18
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.7,
              ease: 'easeOut',
              delay: 0.05
            }} className="block">
                                <span className="font-script italic text-primary">Dentista</span> por formação.
                            </motion.span>
                            <motion.span initial={{
              opacity: 0,
              y: 18
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.7,
              ease: 'easeOut',
              delay: 0.16
            }} className="block">
                                <span className="font-script italic text-primary">Curioso</span> por natureza.
                            </motion.span>
                        </h1>
                        <motion.p initial={{
            opacity: 0,
            y: 18
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            ease: 'easeOut',
            delay: 0.28
          }} className="mt-8 max-w-[40rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                            Entre odontologia, ciência, arte, design e tecnologia, encontrei diferentes maneiras de
                            fazer aquilo de que mais gosto:
                        </motion.p>
                        <motion.p initial={{
            opacity: 0,
            y: 18
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            ease: 'easeOut',
            delay: 0.38
          }} className="mt-5 text-[1.08rem] leading-relaxed text-foreground">
                            transformar ideias em algo real.
                        </motion.p>
                    </div>

                    <div className="relative lg:-mt-4">
                        <motion.img initial={{
            opacity: 0,
            scale: 1.03
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.9,
            ease: 'easeOut'
          }} src={IMG_PORTRAIT} alt="Matheus Filgueiras, cirurgião-dentista e criador" className="relative h-[26rem] w-full object-cover object-[center_18%] sm:h-[34rem] lg:h-[40rem]" loading="eager" />
                    </div>
                </div>
            </section>

            {/* MARQUEE */}
            <section aria-hidden="true" className="border-y border-border bg-secondary/60 py-4">
                <div className="flex w-max marquee-track">
                    {[0, 1].map(copy => <div key={copy} className="flex shrink-0">
                            {marqueeWords.map(word => <span key={`${copy}-${word}`} className="flex items-center gap-8 whitespace-nowrap px-8 text-[0.75rem] uppercase tracking-[0.42em] text-primary/70">
                                    {word}
                                    <span className="h-1 w-1 rounded-full bg-primary/50" />
                                </span>)}
                        </div>)}
                </div>
            </section>

            {/* 02 — APRESENTAÇÃO */}
            <section id="apresentacao" className="mx-auto grid w-full max-w-[90rem] px-6 lg:min-h-[36rem] lg:grid-cols-[0.82fr_1fr] lg:items-stretch lg:px-12">
                <Reveal className="overflow-hidden lg:h-full">
                    <img
                        src={IMG_PRESENTATION}
                        alt="Matheus Filgueiras na Naturale Dental Studio"
                        className="h-[26rem] w-full object-cover object-[center_44%] sm:h-[30rem] lg:h-full lg:min-h-[36rem] lg:object-[center_46%]"
                        loading="lazy"
                    />
                </Reveal>
                <div className="flex items-center py-14 lg:py-16 lg:pl-14 xl:pl-20">
                    <div>
                        <Reveal>
                            <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Apresentação</p>
                            <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                                Olá, sou o <span className="font-script text-primary">Matheus.</span>
                            </h2>
                        </Reveal>
                        <div className="mt-10 max-w-[44rem] space-y-6 text-[1.08rem] leading-relaxed text-muted-foreground">
                            <Reveal delay={0.05}>
                                <p>
                                    Sou cirurgião-dentista e mestrando em Odontologia. Essa provavelmente é a maneira mais
                                    simples de me apresentar.
                                </p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="text-xl font-light leading-relaxed text-foreground">
                                    Só não é a mais completa.
                                </p>
                            </Reveal>
                            <Reveal delay={0.15}>
                                <p>
                                    Também desenho. Escrevo. Fotografo. Desenvolvo projetos. Gosto de design,
                                    comunicação e tecnologia.
                                </p>
                            </Reveal>
                            <Reveal delay={0.2}>
                                <p>
                                    Durante algum tempo, achei que interesses tão diferentes precisavam ocupar lugares
                                    separados. Hoje penso exatamente o contrário.
                                </p>
                            </Reveal>
                            <Reveal delay={0.25}>
                                <p className="text-foreground">
                                    Grande parte do que aprendo fora da clínica acaba mudando a maneira como penso
                                    dentro dela.
                                </p>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* 03 — SOBRE */}
            <section id="sobre" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Sobre</p>
                        <h2 className="mt-6 max-w-[20ch] text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Eu nunca soube ser uma coisa só.
                        </h2>
                    </Reveal>
                    <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-12">
                        <Reveal delay={0.05} className="text-[1.05rem] leading-relaxed text-muted-foreground">
                            <p>
                                Minha formação começou na Odontologia, mas minha curiosidade sempre encontrou outros
                                caminhos. Hoje, não vejo esses interesses como trajetórias separadas. São diferentes
                                maneiras de observar, pensar e criar, e todas acabam encontrando espaço na forma como
                                exerço a Odontologia.
                            </p>
                        </Reveal>
                        <Reveal delay={0.12} className="flex border-t border-border pt-10 text-[1.05rem] leading-relaxed text-muted-foreground lg:min-h-full lg:items-center lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0 xl:pl-16">
                            <div className="w-full space-y-6">
                                <SobreRotator />
                                <p className="border-l-2 border-primary/60 pl-5 text-lg font-light leading-relaxed text-foreground">
                                    Talvez eu não precise ser uma coisa só.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 04 — ATENDIMENTO CLÍNICO */}
            <section id="atendimento" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Atendimento clínico</p>
                        <h2 className="mt-6 max-w-[24ch] text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Cuidado, técnica e <span className="font-script text-primary">planejamento.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <p className="mt-6 max-w-[44rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                            Cada atendimento começa entendendo a pessoa antes de decidir o procedimento. A primeira
                            consulta é o espaço para conversar, avaliar necessidades e construir um planejamento
                            individualizado.
                        </p>
                    </Reveal>
                    <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
                        {atendimentoResumo.map((item, i) => (
                            <Reveal key={item.titulo} delay={i * 0.06} y={20}>
                                <div className="h-full bg-background p-7 lg:p-8">
                                    <h3 className="text-xl font-light tracking-tight text-foreground">{item.titulo}</h3>
                                    {item.locais ? (
                                        <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-foreground">
                                            {item.texto}
                                            <a href={item.locais[0].href} target="_blank" rel="noreferrer noopener" className="text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                                                {item.locais[0].rotulo}
                                            </a>
                                            {' e na '}
                                            <a href={item.locais[1].href} target="_blank" rel="noreferrer noopener" className="text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                                                {item.locais[1].rotulo}
                                            </a>
                                            .
                                        </p>
                                    ) : item.servicos ? (
                                        <ul className="mt-5 grid gap-2 text-[0.92rem] leading-snug text-muted-foreground">
                                            {item.servicos.map((servico) => (
                                                <li key={servico} className="border-l border-primary/30 pl-3 text-foreground/85">
                                                    {servico}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-foreground">{item.texto}</p>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    <Reveal delay={0.12}>
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="mt-8 inline-flex min-h-[50px] items-center gap-2 bg-primary px-7 text-[0.78rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                            Agendar consulta
                            <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                        </a>
                    </Reveal>
                </div>
            </section>

            {/* 05 — CAMINHO */}
            <section id="caminho" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-14 lg:px-8 lg:py-20">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Caminho</p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            O caminho até <span className="font-script text-primary">aqui.</span>
                        </h2>
                    </Reveal>
                    <div className="mt-14 divide-y divide-border border-t border-border">
                        {caminho.map((item, i) => <Reveal key={item.titulo} delay={i * 0.08}>
                                <div className="grid gap-4 py-9">
                                    <div>
                                        <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                                            {item.titulo}
                                        </h3>
                                        <p className="mt-1 font-script text-lg text-primary">{item.lugar}</p>
                                        <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted-foreground">
                                            {item.texto}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>)}
                    </div>
                </div>
            </section>

            {/* 06 — DIFERENTES FACES */}
            <section id="faces" className="mx-auto w-full max-w-[90rem] px-6 py-20 lg:px-12 lg:py-32">
                <Reveal>
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Linguagens</p>
                    <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                        Diferentes formas de <span className="font-script text-primary">criar.</span>
                    </h2>
                </Reveal>
                <Reveal delay={0.05}>
                    <p className="mt-6 max-w-[40rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                        Não gosto muito da palavra “habilidades”. Prefiro pensar em linguagens. São diferentes formas
                        de observar, pensar e criar, ferramentas que ampliam meu repertório e que, de maneiras
                        diferentes, acabam encontrando espaço na minha Odontologia.
                    </p>
                </Reveal>
                <DiferentesFaces faces={faces} />
            </section>

            {/* 07 — UMA PEQUENA INTERSEÇÃO */}
            <section id="intersecao" className="relative overflow-hidden border-y border-border bg-primary text-primary-foreground">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-28">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary-foreground/70">
                            Uma pequena interseção
                        </p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Também desenho <span className="font-script">sorrisos.</span>
                        </h2>
                    </Reveal>
                    <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.18fr] lg:gap-6">
                        {intersecaoItens.map((item, i) => <Reveal key={item.texto} delay={i * 0.08}>
                                <div className="flex h-full flex-col">
                                    <p className="flex min-h-[4.6rem] flex-col text-lg font-light leading-relaxed text-primary-foreground/90 lg:min-h-[4.25rem]">
                                        {item.linhasDesktop ? <>
                                            <span className="lg:hidden">{item.texto}</span>
                                            {item.linhasDesktop.map((line) => <span key={line} className="hidden lg:block lg:whitespace-nowrap">
                                                    {line}
                                                </span>)}
                                        </> : item.texto}
                                    </p>
                                    <figure className="mt-4 h-40 w-full overflow-hidden border border-primary-foreground/20 bg-primary-foreground/8 sm:h-44 lg:h-[10.25rem] lg:max-w-[16.25rem]">
                                        <img src={item.img} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                                    </figure>
                                </div>
                            </Reveal>)}
                    </div>
                    <Reveal delay={0.2}>
                        <p className="mt-10 max-w-[44rem] text-[1.08rem] leading-relaxed text-primary-foreground/85">
                            Talvez “designer de sorrisos” não seja exatamente uma profissão. Mas gosto da ideia.
                            Porque desenhar, para mim, sempre significou a mesma coisa:
                        </p>
                        <p className="mt-4 font-script text-2xl text-primary-foreground">
                            imaginar antes de construir.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* 08 — HISTÓRIAS CLÍNICAS */}
            <section id="historias" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[90rem] px-6 py-16 lg:px-12 lg:py-24">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Histórias clínicas</p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Entre o planejamento
                            <br />
                            e o <span className="font-script text-primary">resultado.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <p className="mt-6 max-w-[44rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                            Casos reais, diferentes caminhos e resultados construídos a partir de planejamento,
                            cuidado e atenção aos detalhes.
                        </p>
                    </Reveal>
                    <HistoriasClinicas casos={historiasClinicas} />
                </div>
            </section>

            {/* 09 — SEDAÇÃO CONSCIENTE */}
            <section id="sedacao" className="mx-auto w-full max-w-[72rem] px-6 py-16 lg:px-8 lg:py-24">
                <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
                    <div>
                        <Reveal>
                            <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Sedação consciente</p>
                            <h2 className="mt-6 text-[1.38rem] font-light leading-tight min-[360px]:text-[1.55rem] min-[380px]:text-[1.8rem] sm:text-[2.8rem]">
                                <span className="block whitespace-nowrap">Nem todo mundo se sente</span>
                                <span className="block whitespace-nowrap font-script text-primary">à vontade no dentista.</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <p className="mt-6 max-w-[38rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                                Para algumas pessoas, o desconforto começa antes mesmo do procedimento. A sedação
                                consciente pode tornar essa experiência mais tranquila, confortável e acolhedora.
                            </p>
                        </Reveal>
                        <div className="mt-8 divide-y divide-border border-y border-border">
                            {sedacaoPontos.map((ponto, i) => (
                                <Reveal key={ponto.titulo} delay={i * 0.06}>
                                    <div className="grid gap-3 py-5 sm:grid-cols-[13rem_1fr] sm:items-baseline">
                                        <h3 className="text-xl font-light tracking-tight text-foreground">{ponto.titulo}</h3>
                                        <p className="text-[0.98rem] leading-relaxed text-muted-foreground">{ponto.texto}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                        <Reveal delay={0.12}>
                            <a href={SEDACAO_URL} target="_blank" rel="noreferrer noopener" className="mt-7 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-foreground">
                                Saiba mais sobre sedação →
                            </a>
                        </Reveal>
                    </div>
                    <Reveal delay={0.1}>
                        <figure className="relative overflow-hidden">
                            <img src={IMG_SEDACAO} alt="Matheus Filgueiras preparando equipamento de sedação consciente" className="aspect-[5/6] w-full object-cover object-center" loading="lazy" />
                        </figure>
                    </Reveal>
                </div>
            </section>

            {/* 10 — IDEIAS QUE GANHARAM FORMA */}
            <section id="projetos" className="mx-auto w-full max-w-[90rem] px-6 py-20 lg:px-12 lg:py-32">
                <Reveal>
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Ideias que ganharam forma</p>
                    <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                        Algumas ideias que <span className="font-script text-primary">ganharam forma.</span>
                    </h2>
                </Reveal>
                <Reveal delay={0.05}>
                    <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-muted-foreground">
                        A Odontologia é o ponto de partida de grande parte do que faço. Algumas perguntas, porém,
                        acabam ultrapassando a clínica e ganhando outras formas: pesquisa, livros, tecnologia ou
                        comunicação.
                    </p>
                </Reveal>

                <div className="mt-14 space-y-14 lg:space-y-16">
                    {projetos.map((p, i) => <Reveal key={p.num} y={28}>
                            <article className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? 'lg:[&>figure:first-child]:order-2' : ''}`}>
                                <figure className="relative overflow-hidden">
                                    <img src={p.img} alt={p.titulo} className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
                                </figure>
                                <div>
                                    <h3 className="text-2xl font-light tracking-tight text-foreground sm:text-[2rem]">
                                        {p.titulo}
                                    </h3>
                                    <p className="mt-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary">
                                        {p.tags}
                                    </p>
                                    <p className="mt-5 font-script text-xl text-foreground/80">{p.sub}</p>
                                    <p className="mt-5 text-[1rem] leading-relaxed text-muted-foreground">{p.texto}</p>
                                    {p.destaque && <p className="mt-5 border-l-2 border-primary/60 pl-5 text-[1.05rem] font-light leading-relaxed text-foreground">
                                            {p.destaque}
                                        </p>}
                                    <a href={p.href} target="_blank" rel="noreferrer noopener" className="mt-7 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-foreground">
                                        {p.cta}
                                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                                    </a>
                                </div>
                            </article>
                        </Reveal>)}
                </div>
            </section>

            {/* 11 — CONTATO */}
            <section id="contato" className="border-t border-border bg-primary text-primary-foreground">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-16 lg:px-8 lg:py-24">
                    <div className="grid gap-10 md:grid-cols-2">
                        <div>
                            <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary-foreground/70">
                                Contato
                            </p>
                            <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                                Podemos começar por uma <span className="font-script">ideia.</span>
                            </h2>
                            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-primary-foreground/85">
                                Projetos, pesquisa, Odontologia, livros, design, tecnologia, ou alguma coisa que
                                ainda não tenha nome. Se você encontrou algo por aqui que despertou uma conversa,
                                será um prazer continuar.
                            </p>
                            <p className="mt-8 font-script text-2xl text-primary-foreground">Matheus Filgueiras</p>
                            <Reveal delay={0.1}>
                                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="mt-7 inline-flex min-h-[52px] items-center gap-2 bg-primary-foreground px-8 text-[0.8rem] uppercase tracking-[0.22em] text-primary transition-transform hover:-translate-y-px active:scale-[0.98]">
                                    Vamos conversar
                                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                                </a>
                            </Reveal>
                        </div>
                        <div className="space-y-6">
                            <ul className="space-y-5">
                                {[{
              Icon: Instagram,
              rotulo: 'Instagram',
              valor: '@dr.matheusfilgueiras',
              href: 'https://instagram.com/dr.matheusfilgueiras'
            }, {
              Icon: Linkedin,
              rotulo: 'LinkedIn',
              valor: 'Matheus Filgueiras',
              href: 'https://www.linkedin.com/in/matheusfilgueiras'
            }, {
              Icon: FileText,
              rotulo: 'Lattes',
              valor: 'Currículo Lattes',
              href: 'https://lattes.cnpq.br/5800213853757398'
            }, {
              Icon: Mail,
              rotulo: 'E-mail',
              valor: 'matheusfilgueiras.dr@gmail.com',
              href: 'mailto:matheusfilgueiras.dr@gmail.com'
            }].map(({
              Icon,
              rotulo,
              valor,
              href
            }) => <li key={rotulo} className="border-b border-primary-foreground/20 pb-5">
                                    <a href={href} target="_blank" rel="noreferrer noopener" className="flex min-h-[44px] items-start gap-4 group">
                                        <Icon className="mt-1 h-5 w-5 shrink-0 text-primary-foreground/80" strokeWidth={1.5} />
                                        <span>
                                            <span className="block text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground/60">
                                                {rotulo}
                                            </span>
                                            <span className="mt-1 block text-[1.02rem] text-primary-foreground transition-colors group-hover:text-background">
                                                {valor}
                                            </span>
                                        </span>
                                    </a>
                                </li>)}
                            </ul>
                            <div>
                                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground/60">
                                    Onde atendo?
                                </p>
                                <div className="mt-4 space-y-3">
                                    {ondeAtendo.map((local) => (
                                        <a key={local.rotulo} href={local.href} target="_blank" rel="noreferrer noopener" className="block min-h-[44px] border-b border-primary-foreground/20 pb-3 text-[1.02rem] text-primary-foreground transition-colors hover:text-background">
                                            {local.rotulo} ↗
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-border bg-background">
                <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-6 py-8 text-[0.75rem] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-12">
                    <span className="font-script text-lg normal-case tracking-normal text-primary">
                        Matheus Filgueiras
                    </span>
                    <span>Dentista · Pesquisador · Criador</span>
                    <span>© {new Date().getFullYear()} Todos os direitos reservados</span>
                </div>
            </footer>
        </div>;
}
export default HomePage;
