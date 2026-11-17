import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
import QuickAssistant from '@/components/QuickAssistant';
import Reveal from '@/components/Reveal';
import Seo from '@/components/Seo';

const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const SALUD_WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=22992096463&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const NATURALE_WHATSAPP_URL = 'https://api.whatsapp.com/send/?phone=5522998508639&text&type=phone_number&app_absent=0';
const SEDACAO_URL = 'https://www.instagram.com/p/DbT4X1lhsaw/';
const navLinks = [
  ['Atendimento', '#atendimento-apple'],
  ['Sobre', '#sobre-apple'],
  ['Interesses', '#interesses-apple'],
  ['Histórias', '#historias-apple'],
  ['Projetos', '#projetos-apple'],
  ['Contato', '#contato-apple'],
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
    texto: 'Atendo pacientes e desenvolvo planejamentos clínicos, incluindo recursos digitais quando eles fazem sentido para cada caso.',
  },
  {
    titulo: 'Ciência',
    img: '/assets/photos/linguagem-ciencia.jpg',
    texto: 'No mestrado, passo parte da rotina no laboratório, estudando materiais odontológicos. A pesquisa me faz observar questões que nem sempre aparecem no consultório.',
  },
  {
    titulo: 'Desenho',
    img: '/assets/photos/linguagem-desenho.jpg',
    texto: 'Gosto de desenhar dentro e fora da Odontologia. Esse interesse também aparece quando estudo proporções e desenvolvo planejamentos estéticos.',
  },
  {
    titulo: 'Escrita',
    img: '/assets/photos/linguagem-escrita.jpg',
    texto: 'Escrevo textos acadêmicos e materiais educativos, mas também gosto de histórias. Unidos pela Bravura me permitiu explorar essas duas formas de escrita.',
  },
  {
    titulo: 'Design',
    img: '/assets/photos/linguagem-design-laptop-20260819.jpg',
    texto: 'Gosto de fotografia, de criar identidades visuais e de pensar na apresentação dos meus materiais. São atividades em que exploro o lado visual das ideias.',
  },
  {
    titulo: 'Tecnologia',
    img: '/assets/photos/linguagem-tecnologia.jpg',
    texto: 'Tenho interesse por impressão 3D, ferramentas digitais e interfaces. Muitas ideias começam com algo que gostaria de resolver, aprender ou testar.',
  },
];

const intersecao = [
  ['No papel.', '/assets/intersecao/no-papel.jpg'],
  ['No computador.', '/assets/intersecao/no-computador.jpg'],
  ['Na clínica, em uma restauração.', '/assets/intersecao/restauracao.jpg'],
  ['E em projetos que começam com uma tela em branco.', '/assets/intersecao/quadro-branco.gif'],
];

const historias = [
  {
    titulo: 'Clareamento de consultório',
    texto: 'O clareamento foi realizado em consultório. As fotografias permitem comparar o aspecto inicial dos dentes com o resultado registrado após o tratamento.',
    antes: '/assets/cases/clareamento-antes.jpg',
    depois: '/assets/cases/clareamento-depois.jpg',
  },
  {
    titulo: 'Planejamento Reabilitador',
    texto: 'O planejamento digital permite estudar proporções dentárias e discutir possibilidades de reabilitação antes da execução. As imagens apresentam uma comparação utilizada nessa etapa de planejamento.',
    antes: '/assets/cases/planejamento-reabilitador-antes.jpg',
    depois: '/assets/cases/planejamento-reabilitador-depois.jpg',
  },
];

const projetos = [
  {
    titulo: 'Unidos pela Bravura',
    tags: 'Odontopediatria · Escrita · Ilustração',
    sub: 'Um livro para conversar sobre o medo de ir ao dentista.',
    texto: 'O projeto começou com uma pesquisa sobre medo e ansiedade das crianças no atendimento odontológico. A proposta foi transformar esse conhecimento em uma história que elas pudessem ler e discutir com seus responsáveis.',
    detalhe: 'No livro, Jairo conhece outras crianças com experiências diferentes no consultório. Participei da escrita, das ilustrações e da diagramação, procurando aproximar o conteúdo científico de situações comuns na infância.',
    cta: 'Ler o livro',
    href: '/unidos_pela_bravura',
    img: '/assets/projects/unidos-pela-bravura-wide.jpg',
  },
  {
    titulo: 'Pesquisa de mestrado',
    tags: 'UFF · Pesquisa · Impressão 3D',
    sub: 'Estudando os materiais usados na impressão 3D.',
    texto: 'No mestrado, investigo a citotoxicidade de resinas utilizadas na impressão 3D de próteses totais. Busco compreender o comportamento biológico desses materiais e a influência das etapas de processamento.',
    detalhe: 'O estudo envolve ensaios laboratoriais e está em andamento. No link abaixo, compartilho uma revisão da literatura sobre o tema, não os resultados finais da pesquisa.',
    cta: 'Ler a revisão da literatura',
    href: 'https://drive.google.com/file/d/1E6mpmWfzIINpfhY_fl_9ORLJiXTamUrb/view?usp=sharing',
    img: '/assets/projects/pesquisa-digital-wide.jpg',
  },
  {
    titulo: 'Planejamento Estético Digital',
    tags: 'Odontologia · Desenho · Ensino',
    sub: 'Um interesse que também se tornou material de ensino.',
    texto: 'O planejamento estético digital reúne dois interesses meus: a Odontologia e o desenho. Comecei explorando maneiras de organizar referências e apresentar propostas de tratamento visualmente.',
    detalhe: 'Desenvolvi um e-book sobre planejamento estético digital 2D e preparei um workshop com atividades práticas. Procuro explicar o assunto de forma acessível, preservando os critérios e as limitações da aplicação clínica.',
    cta: null,
    href: null,
    img: '/assets/intersecao/no-computador.jpg',
  },
];

const projetosComplementares = [
  {
    titulo: 'SedaFlow',
    texto: 'Um software que comecei a desenvolver a partir das necessidades da sedação consciente. A proposta é organizar registros e etapas do atendimento em uma interface pensada para uso clínico.',
    cta: 'Conhecer o projeto',
    href: 'https://sedaflow.com.br/',
    img: '/assets/projects/sedaflow-wide.jpg',
  },
  {
    titulo: 'Design e comunicação visual',
    texto: 'Também desenvolvo trabalhos de identidade visual, fotografia, ilustração e apresentação de conteúdos. Essas atividades fazem parte dos meus interesses e de vários materiais que produzo.',
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

function AppointmentModalApple({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-[80] bg-[#05101f]/48 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild aria-labelledby="appointment-apple-title">
          <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4 outline-none">
            <motion.div
              className="pointer-events-auto relative max-h-[calc(100vh-2rem)] w-full max-w-[34rem] overflow-y-auto rounded-[28px] border border-white/28 bg-[#0066cc] p-5 text-white shadow-[0_32px_110px_rgba(0,36,96,0.36)] backdrop-blur-2xl sm:p-6"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,112,224,0.98) 0%, rgba(0,98,196,0.98) 58%, rgba(0,86,174,0.98) 100%)',
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Dialog.Close
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white/82 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors hover:bg-white/24 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </Dialog.Close>

              <p className="pr-12 text-xs font-semibold uppercase tracking-[0.24em] text-white/72">Agendar consulta</p>
              <Dialog.Title id="appointment-apple-title" className="mt-4 max-w-[16ch] text-3xl font-semibold leading-[1] tracking-[-0.05em] text-white sm:text-5xl">
                Onde você prefere ser atendido?
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl text-base leading-relaxed tracking-[-0.015em] text-white/82">
                Escolha uma clínica para seguir ao WhatsApp, ou fale comigo antes de decidir o melhor caminho.
              </Dialog.Description>

              <div className="mt-6 grid gap-3">
                {appointmentOptions.map((option) => (
                  <a
                    key={option.title}
                    href={option.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group grid gap-3 rounded-[20px] bg-white/12 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.34)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <span>
                      <span className="block text-lg font-semibold tracking-[-0.035em] text-white">{option.title}</span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-white/62">{option.subtitle}</span>
                      <span className="mt-2 block text-[0.92rem] leading-relaxed tracking-[-0.01em] text-white/78">{option.description}</span>
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-colors group-hover:bg-white group-hover:text-[#0066cc]">
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
      aria-label={typeof children === 'string' ? children : 'Abrir opções de agendamento'}
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % sobreRotator.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[8.5rem]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Sou dentista e também...</p>
      <div className="relative mt-5 min-h-[5rem] overflow-hidden" aria-live="off">
        <AnimatePresence mode="wait">
          <motion.p
            key={word}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl"
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
    <section id="interesses-apple" className="bg-[#f5f5f7] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Interesses</p>
          <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
            Outros interesses.
          </h2>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-[#515154]">
            Além da clínica e da universidade, dedico tempo ao desenho, à fotografia, à escrita e a outros projetos. Alguns desses interesses se aproximam da Odontologia; outros permanecem na minha rotina simplesmente porque gosto deles.
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
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0066cc]">Um dos meus interesses</p>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          content="Site pessoal e profissional de Matheus Filgueiras, cirurgião-dentista e mestrando pela UFF, com projetos em pesquisa, ensino, desenho e tecnologia."
        />
      </Helmet>
      <Seo
        title="Matheus Filgueiras · Cirurgião-dentista"
        description="Site pessoal e profissional de Matheus Filgueiras, cirurgião-dentista e mestrando pela UFF, com projetos em pesquisa, ensino, desenho e tecnologia."
        siteName="Matheus Filgueiras"
      />

      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${headerOnBlue ? 'border-white/15 bg-[#0066cc]/88' : 'border-black/10 bg-white/78'}`}>
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-5">
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
            onClick={() => {
              setMobileMenuOpen(false);
              setAppointmentOpen(true);
            }}
            className={`ml-auto rounded-full px-5 py-2 text-[0.88rem] font-semibold transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4 md:ml-0 ${headerOnBlue ? 'bg-white text-[#0066cc]' : 'bg-[#0066cc] text-white'}`}
          >
            Agendar
          </button>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 md:hidden ${
              headerOnBlue ? 'bg-white/12 text-white ring-white/24' : 'bg-white text-[#1d1d1f] ring-black/10'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
          </button>
        </nav>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={`mx-5 mb-4 rounded-[22px] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] ring-1 md:hidden ${
                headerOnBlue ? 'bg-white text-[#1d1d1f] ring-white/20' : 'bg-white/96 text-[#1d1d1f] ring-black/10'
              }`}
            >
              <div className="grid grid-cols-2 gap-1">
                {navLinks.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-[16px] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[#0066cc]/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/30"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section id="inicio-apple" className="bg-[#fbfbfd] px-5 pt-24 sm:px-8">
          <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl items-center gap-8 py-8 sm:gap-10 sm:py-10 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.96fr_1.04fr] lg:py-16">
            <Reveal>
              <div className="lg:-mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0066cc]">CIRURGIÃO-DENTISTA · CRO/RJ 59298</p>
                <h1 className="mt-5 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] sm:text-6xl lg:text-7xl">
                  Olá, sou o Matheus.
                </h1>
                <div className="mt-7 max-w-2xl space-y-4 text-[1.08rem] leading-relaxed tracking-[-0.015em] text-[#515154] sm:text-xl lg:space-y-3">
                  <p>Sou cirurgião-dentista e mestrando em Odontologia pela UFF. Atendo em Nova Friburgo e também me dedico à pesquisa e ao ensino.</p>
                  <p>Gosto de desenhar, fotografar, escrever e explorar outros assuntos. Aqui, compartilho alguns dos projetos que desenvolvo e um pouco dos meus interesses.</p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3 lg:mt-6">
                  <ScheduleButton onClick={() => setAppointmentOpen(true)}>Agendar consulta</ScheduleButton>
                  <a href="#projetos-apple" className="inline-flex min-h-[48px] items-center rounded-full border border-[#0066cc]/15 px-6 text-[0.95rem] font-semibold text-[#0066cc] transition-colors hover:border-[#0066cc]/35 hover:bg-[#0066cc]/5 hover:text-[#1d1d1f]">
                    Ver projetos
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <figure className="overflow-hidden rounded-[24px] bg-[#e8e8ed]">
                <img
                  src="/assets/photos/retrato-editorial-hero.jpg"
                  alt="Matheus Filgueiras"
                  className="h-[24rem] w-full object-cover object-[center_17%] sm:h-[42rem] lg:h-[45rem]"
                  loading="eager"
                />
              </figure>
            </Reveal>
          </div>
        </section>

        <section id="sobre-apple" className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Sobre</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">Um pouco sobre mim.</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal className="flex items-center rounded-[24px] bg-white p-7 sm:p-10">
                <div className="space-y-5 text-[1.08rem] leading-relaxed text-[#515154] sm:text-xl">
                  <p>Sou formado em Odontologia pela Universidade Federal Fluminense, em Nova Friburgo. Na graduação, participei de atividades de pesquisa, extensão e ensino, que me aproximaram de diferentes maneiras de exercer a profissão.</p>
                  <p>Hoje, divido minha rotina entre os atendimentos clínicos, o mestrado e a produção de materiais educativos. Os assuntos que estudo e as experiências da prática influenciam os projetos que desenvolvo.</p>
                </div>
              </Reveal>
              <Reveal delay={0.08} className="rounded-[24px] bg-[#0066cc] p-7 text-white sm:p-10">
                <SobreAppleRotator />
                <p className="mt-4 text-lg leading-relaxed text-white/85">Gosto de desenho, fotografia, design e tecnologia. Percebo conexões entre áreas diferentes, mas nem tudo precisa ter aplicação profissional. Algumas atividades continuo fazendo pelo prazer de aprender e criar.</p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="projetos-apple" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Projetos</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Projetos e pesquisas.
              </h2>
              <p className="mt-7 max-w-3xl text-xl leading-relaxed text-[#515154]">
                Reuni aqui alguns trabalhos que desenvolvi nos últimos anos. Há pesquisas, livros e materiais de ensino, cada um com uma história e um processo de criação diferentes.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6">
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
                      <p className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">{item.sub}</p>
                      <p className="mt-5 text-[1.06rem] leading-relaxed text-[#515154]">{item.texto}</p>
                      <p className="mt-4 text-[1.06rem] leading-relaxed text-[#515154]">{item.detalhe}</p>
                      {item.href && (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                          className="mt-7 inline-flex items-center text-[0.98rem] font-semibold text-[#0066cc] transition-colors hover:text-[#1d1d1f]"
                        >
                          {item.cta}
                          <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.8} />
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <h3 className="mt-16 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Outros trabalhos</h3>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#515154]">
                Também desenvolvo projetos de tecnologia e comunicação visual. Estes são dois exemplos que continuam fazendo parte do meu trabalho.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {projetosComplementares.map((item, index) => (
                <Reveal key={item.titulo} delay={index * 0.05} className="overflow-hidden rounded-[24px] bg-[#f5f5f7]">
                  <img src={item.img} alt={item.titulo} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  <div className="p-7 sm:p-9">
                    <h4 className="text-3xl font-semibold tracking-[-0.04em]">{item.titulo}</h4>
                    <p className="mt-4 text-lg leading-relaxed text-[#515154]">{item.texto}</p>
                    <a href={item.href} target="_blank" rel="noreferrer noopener" className="mt-6 inline-flex items-center font-semibold text-[#0066cc] hover:text-[#1d1d1f]">
                      {item.cta}
                      <ArrowUpRight className="ml-2 h-4 w-4" strokeWidth={1.8} />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <AppleLanguagesSection />

        <section className="bg-[#fbfbfd] px-5 py-20 text-[#1d1d1f] sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Desenho e Odontologia</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                O desenho também aparece no meu trabalho.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {intersecao.map(([texto, img], index) => (
                <Reveal key={texto} delay={index * 0.04} className="overflow-hidden rounded-[24px] bg-[#f5f5f7] ring-1 ring-black/5">
                  <img src={img} alt={texto} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                  <p className="min-h-[5.5rem] p-5 text-lg font-medium leading-snug tracking-[-0.02em] text-[#515154]">{texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="atendimento-apple" data-blue-section="true" className="bg-[#0066cc] px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Atendimento clínico</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Como trabalho na clínica.
              </h2>
              <p className="mt-7 max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-white/68">
                Cada paciente chega com uma história e uma necessidade diferente. Procuro ouvir, avaliar e explicar as possibilidades antes de definir o tratamento. Apresento as opções com clareza para que as decisões sejam tomadas em conjunto.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {atendimento.map((item, index) => (
                <Reveal key={item.titulo} delay={index * 0.05} className="rounded-[24px] bg-white/[0.1] p-7 ring-1 ring-white/14">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{item.titulo}</h3>
                  <p className="mt-4 leading-relaxed text-white/76">{item.texto}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-10">
              <ScheduleButton onClick={() => setAppointmentOpen(true)} dark>Agendar consulta</ScheduleButton>
            </div>
          </div>
        </section>

        <section id="historias-apple" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Histórias clínicas</p>
              <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">
                Alguns casos clínicos.
              </h2>
            </Reveal>
            <ClinicalGalleryApple />
          </div>
        </section>

        <FeedbackApple />

        <section className="bg-[#f5f5f7] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal className="flex items-center rounded-[24px] bg-white p-8 sm:p-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Sedação consciente</p>
                <h2 className="mt-4 text-[2.45rem] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[2.85rem] lg:text-[2.9rem] xl:text-[3rem]">
                  Para quem sente medo do atendimento.
                </h2>
                <p className="mt-7 text-xl leading-relaxed tracking-[-0.02em] text-[#6e6e73]">
                  A sedação consciente com óxido nitroso pode ajudar a reduzir a ansiedade durante determinados procedimentos. A indicação depende da avaliação individual.
                </p>
                <div className="mt-8 grid gap-4 text-lg text-[#515154]">
                  <p><strong className="text-[#1d1d1f]">Ansiedade.</strong> Pode ser considerada para pacientes que apresentam medo ou dificuldade de relaxar durante a consulta.</p>
                  <p><strong className="text-[#1d1d1f]">Procedimentos prolongados.</strong> Em algumas situações, pode contribuir para o conforto durante consultas mais longas.</p>
                  <p><strong className="text-[#1d1d1f]">Durante o atendimento.</strong> O paciente permanece consciente e pode conversar com a equipe.</p>
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
                Vamos conversar?
              </h2>
              <p className="mt-7 max-w-xl text-xl leading-relaxed tracking-[-0.02em] text-white/68">
                Atendo em Nova Friburgo, na Salud Odontologia e na Naturale Dental Studio. Para agendar, escolha uma das unidades abaixo. Você também pode entrar em contato pelos meus canais profissionais.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="grid gap-3 sm:grid-cols-2">
              <a href={SALUD_WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="rounded-[24px] bg-white p-7 text-[#1d1d1f] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Marque sua consulta</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Salud Odontologia</h3>
                <p className="mt-4 text-[#0066cc]">Agendar pelo WhatsApp ↗</p>
              </a>
              <a href={NATURALE_WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="rounded-[24px] bg-white p-7 text-[#1d1d1f] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
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

      <QuickAssistant />
      <AppointmentModalApple open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </div>
  );
}

export default AppleTestPage;
