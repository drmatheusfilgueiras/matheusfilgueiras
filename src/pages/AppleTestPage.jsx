import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Instagram, Linkedin, Mail, X } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Seo from '@/components/Seo';

const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const SALUD_WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=22992096463&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const NATURALE_WHATSAPP_URL = 'https://api.whatsapp.com/send/?phone=5522998508639&text&type=phone_number&app_absent=0';
const SEDACAO_URL = 'https://www.instagram.com/p/DbT4X1lhsaw/';
const navLinks = [
  ['Apresentação', '#apresentacao-apple'],
  ['Atendimento', '#atendimento-apple'],
  ['Caminho', '#caminho-apple'],
  ['Linguagens', '#linguagens-apple'],
  ['Histórias', '#historias-apple'],
  ['Projetos', '#projetos-apple'],
  ['Contato', '#contato-apple'],
];

const caminho = [
  {
    titulo: 'Odontologia',
    lugar: 'Universidade Federal Fluminense',
    texto: 'Foi onde minha trajetória profissional começou, e onde descobri uma área que mistura ciência, habilidade manual, planejamento, estética e cuidado.',
  },
  {
    titulo: 'Pesquisa',
    lugar: 'Mestrado em Odontologia · UFF',
    texto: 'Hoje continuo minha formação investigando materiais, impressão 3D e novas tecnologias aplicadas à Odontologia. A pesquisa acrescentou uma pergunta que passou a acompanhar quase tudo o que faço: por que fazemos dessa maneira?',
  },
  {
    titulo: 'Extensão, ensino e projetos',
    lugar: 'Ligas acadêmicas e iniciativas',
    texto: 'Ao longo dessa trajetória, participei da construção de ligas acadêmicas, projetos de extensão, atividades científicas e iniciativas que me aproximaram também do ensino e da comunicação.',
  },
];

const atendimento = [
  {
    titulo: 'Onde atendo',
    texto: 'Nova Friburgo/RJ, na Salud Odontologia e na Naturale Dental Studio.',
  },
  {
    titulo: 'Como posso ajudar',
    texto: 'Clareamento dental, restaurações estéticas, planejamento digital e sedação consciente.',
  },
  {
    titulo: 'Como agendar',
    texto: 'O primeiro contato acontece pelo WhatsApp, com direcionamento para o local mais adequado.',
  },
];

const linguagens = [
  {
    titulo: 'Odontologia',
    img: '/assets/photos/linguagem-odontologia.jpg',
    texto: 'Clínica, planejamento e odontologia digital. O ponto em que conhecimento técnico, tecnologia e sensibilidade precisam trabalhar juntos.',
  },
  {
    titulo: 'Ciência',
    img: '/assets/photos/linguagem-ciencia.jpg',
    texto: 'Pesquisa, escrita acadêmica, experimentação e comunicação científica para formular perguntas melhores e decidir com mais critério.',
  },
  {
    titulo: 'Desenho',
    img: '/assets/photos/linguagem-desenho.jpg',
    texto: 'O desenho treina olhar, proporção e observação, e atravessa a forma como planejo, explico e tomo decisões clínicas.',
  },
  {
    titulo: 'Escrita',
    img: '/assets/photos/linguagem-escrita.jpg',
    texto: 'Artigos, histórias e roteiros. Escrever organiza pensamentos e traduz temas complexos para quem precisa compreender.',
  },
  {
    titulo: 'Design',
    img: '/assets/photos/linguagem-design-laptop-20260819.jpg',
    texto: 'Identidades visuais, apresentações, fotografia, conteúdo e experiência como modos de organizar informação e comunicação.',
  },
  {
    titulo: 'Tecnologia',
    img: '/assets/photos/linguagem-tecnologia.jpg',
    texto: 'Fluxos digitais, impressão 3D, inteligência artificial, interfaces e novos projetos quando ampliam possibilidades clínicas e humanas.',
  },
];

const intersecao = [
  ['Alguns no papel.', '/assets/intersecao/no-papel.jpg'],
  ['Outros no computador.', '/assets/intersecao/no-computador.jpg'],
  ['Alguns através de uma restauração.', '/assets/intersecao/restauracao.jpg'],
  ['Outros através de um projeto que começa com uma tela em branco.', '/assets/intersecao/quadro-branco.gif'],
];

const historias = [
  {
    titulo: 'Clareamento de consultório',
    texto: 'Um tratamento planejado para devolver luminosidade ao sorriso de forma gradual, respeitando as características naturais dos dentes e buscando um resultado harmônico, sem excessos.',
    antes: '/assets/cases/clareamento-antes.jpg',
    depois: '/assets/cases/clareamento-depois.jpg',
  },
  {
    titulo: 'Planejamento Reabilitador',
    texto: 'Um planejamento pensado para melhorar função, estética e proporções do sorriso antes de qualquer intervenção, permitindo visualizar o resultado e conduzir cada etapa com mais previsibilidade.',
    antes: '/assets/cases/planejamento-reabilitador-antes.jpg',
    depois: '/assets/cases/planejamento-reabilitador-depois.jpg',
  },
];

const projetos = [
  {
    titulo: 'Unidos pela Bravura',
    tags: 'Odontologia · Ciência · Escrita · Ilustração',
    sub: 'Quando uma pesquisa virou história.',
    texto: 'Uma pesquisa em Odontopediatria que se transformou em uma coleção de livros infantis para ajudar crianças a compreender e se preparar melhor para o atendimento odontológico.',
    destaque: 'Ciência, narrativa, ilustração e design reunidos em algo que uma criança pudesse segurar nas mãos.',
    cta: 'Conhecer o projeto',
    href: 'https://www.amazon.com.br/Unidos-pela-Bravura-Matheus-Filgueiras/dp/6501438985',
    img: '/assets/projects/unidos-pela-bravura-wide.jpg',
  },
  {
    titulo: 'Pesquisa em Odontologia Digital',
    tags: 'Ciência · Materiais · Impressão 3D',
    sub: 'O que acontece depois que apertamos imprimir?',
    texto: 'Minha pesquisa de mestrado investiga materiais utilizados na impressão 3D em Odontologia, aproximando resinas, processos de pós-cura e laboratório da realidade biológica.',
    destaque: 'Um encontro entre Odontologia, ciência e tecnologia.',
    cta: 'Conhecer a pesquisa',
    href: 'https://drive.google.com/file/d/1E6mpmWfzIINpfhY_fl_9ORLJiXTamUrb/view?usp=sharing',
    img: '/assets/projects/pesquisa-digital-wide.jpg',
  },
  {
    titulo: 'SedaFlow',
    tags: 'Odontologia · Produto · Design · Tecnologia',
    sub: 'E se um fluxo clínico pudesse ser repensado?',
    texto: 'SedaFlow nasceu para organizar e simplificar processos relacionados à sedação consciente em Odontologia, reunindo experiência clínica, design de interface e tecnologia.',
    destaque: 'Necessidades clínicas transformadas em decisões de produto.',
    cta: 'Conhecer o projeto',
    href: 'https://sedaflow.com.br/',
    img: '/assets/projects/sedaflow-wide.jpg',
  },
  {
    titulo: 'Comunicação visual',
    tags: 'Design · Fotografia · Ciência',
    sub: 'Nem toda pesquisa precisa parecer uma pesquisa.',
    texto: 'Apresentações, ilustrações, fotografias, vídeos e identidades visuais passaram a fazer parte da maneira como preparo e apresento projetos.',
    destaque: 'Porque comunicar também faz parte do método.',
    cta: 'Ver trabalhos',
    href: 'https://www.behance.net/matheuscarvalh32',
    img: '/assets/projects/comunicacao-visual-brand-20260819.jpg',
  },
];

const feedbacks = [
  {
    nome: 'Paciente',
    texto: 'Atendimento cuidadoso, tranquilo e explicado com muita clareza.',
  },
  {
    nome: 'Paciente',
    texto: 'Me senti acolhida desde a primeira conversa. Isso fez toda a diferença.',
  },
  {
    nome: 'Paciente',
    texto: 'O planejamento foi apresentado com calma e segurança, sem pressa.',
  },
];

const sobreRotator = ['Pesquisador.', 'Autor.', 'Desenhista.', 'Criador.', 'Comunicador.', 'Curioso.'];

const socialLinks = [
  {
    Icon: Instagram,
    label: 'Instagram',
    value: '@dr.matheusfilgueiras',
    href: 'https://instagram.com/dr.matheusfilgueiras',
  },
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    value: 'Matheus Filgueiras',
    href: 'https://www.linkedin.com/in/matheusfilgueiras',
  },
  {
    Icon: FileText,
    label: 'Lattes',
    value: 'Currículo Lattes',
    href: 'https://lattes.cnpq.br/5800213853757398',
  },
  {
    Icon: Mail,
    label: 'E-mail',
    value: 'matheusfilgueiras.dr@gmail.com',
    href: 'mailto:matheusfilgueiras.dr@gmail.com',
  },
];

const appointmentOptions = [
  {
    title: 'Salud Odontologia',
    subtitle: 'Nova Friburgo/RJ',
    description: 'Agendar consulta na Salud pelo WhatsApp.',
    href: SALUD_WHATSAPP_URL,
  },
  {
    title: 'Naturale Dental Studio',
    subtitle: 'Nova Friburgo/RJ',
    description: 'Agendar consulta na Naturale pelo WhatsApp.',
    href: NATURALE_WHATSAPP_URL,
  },
  {
    title: 'Falar com Matheus',
    subtitle: 'Atendimento direto',
    description: 'Tirar dúvidas antes de escolher a clínica.',
    href: WHATSAPP_URL,
  },
];

function FeedbackApple() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % feedbacks.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  const feedback = feedbacks[index];

  return (
    <section className="bg-[#f5f5f7] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Feedback</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#1d1d1f] sm:text-6xl">
          Depois da consulta.
        </h2>
        <div className="relative mx-auto mt-12 max-w-3xl rounded-[24px] bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:p-12">
          <p className="absolute left-7 top-5 text-7xl leading-none text-[#0066cc]/20 sm:left-10 sm:top-8">“</p>
          <p className="relative z-10 mx-auto max-w-2xl px-4 pt-8 text-2xl font-medium leading-tight tracking-[-0.02em] text-[#1d1d1f] sm:text-4xl">
            {feedback.texto}
          </p>
          <p className="absolute bottom-16 right-7 text-7xl leading-none text-[#0066cc]/20 sm:bottom-20 sm:right-10">”</p>
          <p className="relative z-10 mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">{feedback.nome}</p>
          <div className="mt-7 flex justify-center gap-2" aria-label="Feedback atual">
            {feedbacks.map((item, itemIndex) => (
              <button
                key={item.texto}
                type="button"
                className={`h-2 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-[#0066cc]' : 'w-2 bg-[#d2d2d7]'}`}
                aria-label={`Mostrar feedback ${itemIndex + 1}`}
                onClick={() => setIndex(itemIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClinicalGalleryApple() {
  const scrollerRef = useRef(null);

  const scrollGallery = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.82,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative mt-12">
      <div
        ref={scrollerRef}
        className="apple-gallery-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scroll-smooth"
        aria-label="Galeria de histórias clínicas"
      >
        {historias.map((item, index) => (
          <article
            key={item.titulo}
            className="min-w-[88%] snap-center overflow-hidden rounded-[24px] bg-[#f5f5f7] shadow-[0_18px_60px_rgba(0,0,0,0.07)] md:min-w-[72%] xl:min-w-[58%]"
          >
            <div className="grid gap-px bg-white sm:grid-cols-2">
              <figure className="bg-white">
                <img src={item.antes} alt={`${item.titulo} antes`} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                <figcaption className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Antes</figcaption>
              </figure>
              <figure className="bg-white">
                <img src={item.depois} alt={`${item.titulo} depois`} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                <figcaption className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Depois</figcaption>
              </figure>
            </div>
            <div className="grid gap-6 border-t border-[#e8e8ed] p-7 sm:p-9 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0066cc]">
                  Caso {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#1d1d1f] sm:text-4xl">{item.titulo}</h3>
              </div>
              <p className="text-lg leading-relaxed tracking-[-0.015em] text-[#515154]">{item.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollGallery(-1)}
        className="absolute left-0 top-1/2 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_12px_34px_rgba(0,0,0,0.14)] backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 lg:flex"
        aria-label="Ver caso anterior"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => scrollGallery(1)}
        className="absolute right-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_12px_34px_rgba(0,0,0,0.14)] backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 lg:flex"
        aria-label="Ver próximo caso"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}

function AppointmentModalApple({ open, onOpenChange, onBlue = false }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-[80] bg-[#f5f5f7]/18 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild aria-labelledby="appointment-apple-title">
          <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4 outline-none">
            <motion.div
              className={`pointer-events-auto relative max-h-[calc(100vh-2rem)] w-full max-w-[34rem] overflow-y-auto rounded-[28px] border p-5 shadow-[0_28px_90px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors sm:p-6 ${
                onBlue ? 'border-white/42 bg-white/14 text-white shadow-[0_28px_90px_rgba(0,20,70,0.26)]' : 'border-white/55 bg-white/78 text-[#1d1d1f]'
              }`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Dialog.Close
                className={`absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 ${
                  onBlue ? 'bg-white/18 text-white/78 hover:bg-white/28 hover:text-white' : 'bg-white/70 text-[#6e6e73] hover:bg-white hover:text-[#1d1d1f]'
                }`}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </Dialog.Close>

              <p className={`pr-12 text-xs font-semibold uppercase tracking-[0.24em] ${onBlue ? 'text-white/66' : 'text-[#0066cc]'}`}>Agendar consulta</p>
              <Dialog.Title id="appointment-apple-title" className={`mt-4 max-w-[16ch] text-3xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl ${onBlue ? 'text-white' : 'text-[#1d1d1f]'}`}>
                Onde você prefere ser atendido?
              </Dialog.Title>
              <Dialog.Description className={`mt-3 max-w-xl text-base leading-relaxed tracking-[-0.015em] ${onBlue ? 'text-white/78' : 'text-[#424245]'}`}>
                Escolha uma clínica para seguir ao WhatsApp, ou fale comigo antes de decidir o melhor caminho.
              </Dialog.Description>

              <div className="mt-5 grid gap-2.5">
                {appointmentOptions.map((option) => (
                  <a
                    key={option.title}
                    href={option.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`group grid gap-3 rounded-[20px] p-4 backdrop-blur-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 sm:grid-cols-[1fr_auto] sm:items-center ${
                      onBlue
                        ? 'bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)] hover:bg-white/16'
                        : 'bg-white/58 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] hover:bg-white/76'
                    }`}
                  >
                    <span>
                      <span className={`block text-lg font-semibold tracking-[-0.035em] ${onBlue ? 'text-white' : 'text-[#1d1d1f]'}`}>{option.title}</span>
                      <span className={`mt-1 block text-xs font-semibold uppercase tracking-[0.18em] ${onBlue ? 'text-white/54' : 'text-[#0066cc]'}`}>{option.subtitle}</span>
                      <span className={`mt-2 block text-[0.92rem] leading-relaxed tracking-[-0.01em] ${onBlue ? 'text-white/74' : 'text-[#424245]'}`}>{option.description}</span>
                    </span>
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-colors ${
                      onBlue ? 'bg-white/14 text-white group-hover:bg-white group-hover:text-[#0066cc]' : 'bg-white/86 text-[#0066cc] group-hover:bg-[#0066cc] group-hover:text-white'
                    }`}>
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ScheduleButton({ children, dark = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[48px] items-center justify-center rounded-full px-7 text-[1rem] font-semibold transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4 active:scale-[0.98] ${
        dark ? 'bg-white text-[#1d1d1f]' : 'bg-[#0066cc] text-white'
      }`}
    >
      {children}
      <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}

function SobreAppleRotator() {
  const [index, setIndex] = useState(0);
  const word = sobreRotator[index];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % sobreRotator.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[8.5rem]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Eu sou dentista. E também...</p>
      <div className="relative mt-5 min-h-[4.8rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={word}
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`text-5xl font-semibold tracking-[-0.06em] sm:text-6xl ${word === 'Matheus.' ? 'italic' : ''}`}
          >
            {word}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppleLanguagesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = linguagens[activeIndex];

  return (
    <section id="linguagens-apple" className="bg-[#f5f5f7] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Linguagens</p>
          <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
            Diferentes formas de criar.
          </h2>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-[#515154]">
            Cada uma treina uma atenção diferente: olhar, escutar, perguntar, organizar e explicar melhor o que precisa ser compreendido.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <Reveal className="divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
            {linguagens.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={item.titulo}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className="group flex w-full items-center justify-between gap-6 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7]"
                >
                  <span className={`text-3xl font-semibold tracking-[-0.045em] transition-colors sm:text-4xl ${isActive ? 'text-[#0066cc]' : 'text-[#1d1d1f] group-hover:text-[#0066cc]'}`}>
                    {item.titulo}
                  </span>
                  <span className={`h-2 w-2 rounded-full transition-all ${isActive ? 'scale-125 bg-[#0066cc]' : 'bg-[#c7c7cc]'}`} />
                </button>
              );
            })}
          </Reveal>

          <Reveal delay={0.08} className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_18px_70px_rgba(0,0,0,0.08)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.titulo}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={active.img} alt={active.titulo} className="aspect-[16/7] w-full object-cover" loading="lazy" />
                  <div className="p-6 sm:p-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0066cc]">Linguagem ativa</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#1d1d1f] sm:text-4xl">{active.titulo}</h3>
                    <p className="mt-4 text-base leading-relaxed tracking-[-0.015em] text-[#515154] sm:text-lg">{active.texto}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function AppleTestPage() {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [headerOnBlue, setHeaderOnBlue] = useState(false);

  useEffect(() => {
    const updateHeaderTone = () => {
      const blueSections = Array.from(document.querySelectorAll('[data-blue-section="true"]'));
      const probeY = 52;

      setHeaderOnBlue(
        blueSections.some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= probeY && rect.bottom >= probeY;
        }),
      );
    };

    updateHeaderTone();
    window.addEventListener('scroll', updateHeaderTone, { passive: true });
    window.addEventListener('resize', updateHeaderTone);

    return () => {
      window.removeEventListener('scroll', updateHeaderTone);
      window.removeEventListener('resize', updateHeaderTone);
    };
  }, []);

  return (
    <div className="apple-test min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Helmet>
        <title>Matheus Filgueiras · Cirurgião-dentista</title>
        <meta
          name="description"
          content="Site oficial de Matheus Filgueiras, cirurgião-dentista em Nova Friburgo/RJ, com atuação em clínica, ciência, design e tecnologia."
        />
      </Helmet>
      <Seo
        title="Matheus Filgueiras · Cirurgião-dentista"
        description="Site oficial de Matheus Filgueiras, cirurgião-dentista em Nova Friburgo/RJ, com atuação em clínica, ciência, design e tecnologia."
        siteName="Matheus Filgueiras"
      />

      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${headerOnBlue ? 'border-white/15 bg-[#0066cc]/88' : 'border-black/10 bg-white/78'}`}>
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5">
          <a href="#inicio-apple" className={`shrink-0 text-base font-semibold tracking-[-0.01em] transition-colors ${headerOnBlue ? 'text-white' : 'text-[#1d1d1f]'}`}>
            Matheus Filgueiras
          </a>
          <div className={`hidden items-center gap-7 text-[0.9rem] font-medium transition-colors md:flex ${headerOnBlue ? 'text-white/82' : 'text-[#424245]'}`}>
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className={`transition-colors ${headerOnBlue ? 'hover:text-white' : 'hover:text-[#0066cc]'}`}>
                {label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAppointmentOpen(true)}
            className={`rounded-full px-5 py-2 text-[0.88rem] font-semibold transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4 ${headerOnBlue ? 'bg-white text-[#0066cc]' : 'bg-[#0066cc] text-white'}`}
          >
            Agendar
          </button>
        </nav>
      </header>

      <main>
        <section id="inicio-apple" className="bg-[#fbfbfd] px-5 pt-24 sm:px-8">
          <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[0.96fr_1.04fr] lg:py-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0066cc]">CIRURGIÃO-DENTISTA · CRO/RJ 59298</p>
              <h1 className="mt-5 text-[3.5rem] font-semibold leading-[0.96] tracking-[-0.065em] text-[#1d1d1f] sm:text-7xl lg:text-8xl">
                Dentista por formação. Curioso por natureza.
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-relaxed tracking-[-0.02em] text-[#6e6e73] sm:text-2xl">
                Entre odontologia, ciência, arte, design e tecnologia, encontrei diferentes maneiras de fazer aquilo de que mais gosto:
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">transformar ideias em algo real.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ScheduleButton onClick={() => setAppointmentOpen(true)}>Agendar consulta</ScheduleButton>
                <a href="#projetos-apple" className="inline-flex min-h-[44px] items-center rounded-full px-6 text-[0.95rem] font-semibold text-[#0066cc] transition-colors hover:text-[#1d1d1f]">
                  Ver projetos
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <figure className="overflow-hidden rounded-[24px] bg-[#e8e8ed]">
                <img
                  src="/assets/photos/retrato-editorial-hero.jpg"
                  alt="Matheus Filgueiras"
                  className="h-[34rem] w-full object-cover object-[center_17%] sm:h-[42rem] lg:h-[45rem]"
                  loading="eager"
                />
              </figure>
            </Reveal>
          </div>
        </section>

        <section id="apresentacao-apple" className="bg-white px-5 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <Reveal className="overflow-hidden rounded-[24px] bg-[#f5f5f7]">
              <img
                src="/assets/photos/apresentacao-naturale.jpg"
                alt="Matheus Filgueiras na Naturale Dental Studio"
                className="h-[28rem] w-full object-cover object-[center_46%] lg:h-[34rem]"
                loading="lazy"
              />
            </Reveal>
            <Reveal delay={0.08} className="flex items-center rounded-[24px] bg-[#f5f5f7] p-7 sm:p-10 lg:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Apresentação</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Olá, sou o Matheus.</h2>
                <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed tracking-[-0.015em] text-[#515154]">
                  <p>Sou cirurgião-dentista e mestrando em Odontologia. Essa provavelmente é a maneira mais simples de me apresentar.</p>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">Só não é a mais completa.</p>
                  <p>Também desenho. Escrevo. Fotografo. Desenvolvo projetos. Gosto de design, comunicação e tecnologia.</p>
                  <p>Grande parte do que aprendo fora da clínica acaba mudando a maneira como penso dentro dela.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Sobre</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                <span className="block">Eu nunca soube</span>
                <span className="block">ser uma coisa só.</span>
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal className="flex items-center rounded-[24px] bg-white p-7 sm:p-9">
                <p className="text-[1.08rem] leading-relaxed tracking-[-0.02em] text-[#515154] sm:text-xl">
                  Minha formação começou na Odontologia, mas minha curiosidade sempre encontrou outros caminhos. Hoje, não vejo esses interesses como trajetórias separadas. São diferentes maneiras de observar, pensar e criar, e todas acabam encontrando espaço na forma como exerço a Odontologia.
                </p>
              </Reveal>
              <Reveal delay={0.08} className="rounded-[24px] bg-[#0066cc] p-7 text-white sm:p-9">
                <SobreAppleRotator />
                <p className="mt-5 text-xl leading-relaxed text-white/72">Talvez eu não precise ser uma coisa só.</p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="atendimento-apple" data-blue-section="true" className="bg-[#0066cc] px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Atendimento clínico</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Cuidado, técnica e planejamento.
              </h2>
              <p className="mt-7 max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-white/68">
                Cada atendimento começa entendendo a pessoa antes de decidir o procedimento. A primeira consulta é o espaço para conversar, avaliar necessidades e construir um planejamento individualizado.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {atendimento.map((item, index) => (
                <Reveal key={item.titulo} delay={index * 0.05} className="rounded-[24px] bg-white/[0.08] p-7 ring-1 ring-white/10">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.titulo}</h3>
                  <p className="mt-4 leading-relaxed text-white/68">{item.texto}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-10">
              <ScheduleButton onClick={() => setAppointmentOpen(true)} dark>Agendar consulta</ScheduleButton>
            </div>
          </div>
        </section>

        <section id="caminho-apple" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Caminho</p>
              <h2 className="mt-4 text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">O caminho até aqui.</h2>
            </Reveal>
            <div className="mt-12 divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
              {caminho.map((item, index) => (
                <Reveal key={item.titulo} delay={index * 0.04}>
                  <article className="grid gap-5 py-8 md:grid-cols-[0.38fr_0.62fr]">
                    <div>
                      <p className="text-sm font-semibold text-[#0066cc]">{item.lugar}</p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{item.titulo}</h3>
                    </div>
                    <p className="text-lg leading-relaxed tracking-[-0.015em] text-[#515154]">{item.texto}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <AppleLanguagesSection />

        <section data-blue-section="true" className="bg-[#0066cc] px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Uma pequena interseção</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Também desenho sorrisos.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {intersecao.map(([texto, img], index) => (
                <Reveal key={texto} delay={index * 0.04} className="overflow-hidden rounded-[24px] bg-white/10 ring-1 ring-white/15">
                  <img src={img} alt={texto} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                  <p className="min-h-[5.5rem] p-5 text-lg font-medium leading-snug tracking-[-0.02em] text-white/80">{texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="historias-apple" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Histórias clínicas</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Entre o planejamento e o resultado.
              </h2>
            </Reveal>
            <ClinicalGalleryApple />
          </div>
        </section>

        <FeedbackApple />

        <section id="projetos-apple" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Ideias que ganharam forma</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Projetos que atravessam a clínica.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5">
              {projetos.map((item, index) => (
                <Reveal key={item.titulo} delay={index * 0.05}>
                  <article className="grid overflow-hidden rounded-[24px] bg-[#f5f5f7] lg:grid-cols-2">
                    <img
                      src={item.img}
                      alt={item.titulo}
                      className={`h-full min-h-[20rem] w-full object-cover ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                      loading="lazy"
                    />
                    <div className={`p-8 sm:p-12 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0066cc]">{item.tags}</p>
                      <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{item.titulo}</h3>
                      <p className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">{item.sub}</p>
                      <p className="mt-5 text-lg leading-relaxed tracking-[-0.015em] text-[#515154]">{item.texto}</p>
                      <p className="mt-6 border-l-2 border-[#0066cc] pl-5 text-lg font-semibold leading-relaxed tracking-[-0.015em]">{item.destaque}</p>
                      <a href={item.href} target="_blank" rel="noreferrer noopener" className="mt-7 inline-flex items-center text-[0.98rem] font-semibold text-[#0066cc] transition-colors hover:text-[#1d1d1f]">
                        {item.cta}
                        <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.8} />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal className="flex items-center rounded-[24px] bg-white p-8 sm:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Sedação consciente</p>
                <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                  Nem todo mundo se sente à vontade no dentista.
                </h2>
                <p className="mt-7 text-xl leading-relaxed tracking-[-0.02em] text-[#6e6e73]">
                  A sedação consciente pode tornar essa experiência mais tranquila, confortável e acolhedora.
                </p>
                <div className="mt-8 grid gap-4 text-lg text-[#515154]">
                  <p><strong className="text-[#1d1d1f]">Ansiedade.</strong> Para quem sente medo, desconforto ou dificuldade em relaxar durante o atendimento.</p>
                  <p><strong className="text-[#1d1d1f]">Procedimentos longos.</strong> Uma possibilidade para tornar consultas mais extensas mais confortáveis.</p>
                  <p><strong className="text-[#1d1d1f]">Sedação consciente.</strong> Você permanece consciente e responsivo durante todo o atendimento.</p>
                </div>
                <a href={SEDACAO_URL} target="_blank" rel="noreferrer noopener" className="mt-8 inline-flex items-center text-[0.98rem] font-semibold text-[#0066cc] transition-colors hover:text-[#1d1d1f]">
                  Saiba mais sobre sedação
                  <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.8} />
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="overflow-hidden rounded-[24px] bg-white">
              <img src="/assets/photos/sedacao-consciente.jpg" alt="Matheus preparando equipamento de sedação consciente" className="h-full min-h-[34rem] w-full object-cover object-center" loading="lazy" />
            </Reveal>
          </div>
        </section>

        <section id="contato-apple" data-blue-section="true" className="flex min-h-screen items-center bg-[#0066cc] px-5 py-20 text-white sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Contato</p>
              <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Escolha onde deseja ser atendido.
              </h2>
              <p className="mt-7 max-w-xl text-xl leading-relaxed tracking-[-0.02em] text-white/68">
                Atendo em Nova Friburgo/RJ. Selecione uma unidade para iniciar o agendamento pelo WhatsApp e direcionar sua consulta para o local mais adequado.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="grid gap-3 sm:grid-cols-2">
              <a href={SALUD_WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="rounded-[24px] bg-white p-7 text-[#1d1d1f] transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Marque sua consulta</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Salud Odontologia</h3>
                <p className="mt-4 text-[#0066cc]">Agendar pelo WhatsApp ↗</p>
              </a>
              <a href={NATURALE_WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="rounded-[24px] bg-white p-7 text-[#1d1d1f] transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Marque sua consulta</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Naturale Dental Studio</h3>
                <p className="mt-4 text-[#0066cc]">Agendar pelo WhatsApp ↗</p>
              </a>
              <div className="rounded-[24px] border border-white/20 p-7 sm:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Outros contatos</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {socialLinks.map(({ Icon, label, value, href }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
                      className="group flex min-h-[64px] min-w-0 items-center gap-4 rounded-[24px] bg-white/10 px-4 py-3 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.7} />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{label}</span>
                        <span className={`mt-1 block font-semibold leading-snug text-white transition-colors group-hover:text-white ${label === 'E-mail' ? 'whitespace-nowrap text-[0.78rem] tracking-[-0.02em] xl:text-[0.84rem]' : 'text-[0.95rem] [overflow-wrap:anywhere]'}`}>{value}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <AppointmentModalApple open={appointmentOpen} onOpenChange={setAppointmentOpen} onBlue={headerOnBlue} />
    </div>
  );
}

export default AppleTestPage;
