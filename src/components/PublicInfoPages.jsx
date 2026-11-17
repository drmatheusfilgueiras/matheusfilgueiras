import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ArrowUpRight, BookOpen, Camera, GraduationCap, Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
import Seo from '@/components/Seo';
import QuickAssistant from '@/components/QuickAssistant';

const BASE = 'https://matheusfilgueiras.com';
const EMAIL = 'mailto:matheusfilgueiras.dr@gmail.com';
const SALUD = 'https://api.whatsapp.com/send?phone=22992096463&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const NATURALE = 'https://api.whatsapp.com/send/?phone=5522998508639&text&type=phone_number&app_absent=0';

const mainNavigation = [
  ['Sobre', '/#sobre-apple'],
  ['Projetos', '/#projetos-apple'],
  ['Interesses', '/#interesses-apple'],
  ['Atendimento', '/#atendimento-apple'],
  ['Histórias', '/#historias-apple'],
  ['Contato', '/#contato-apple'],
];

const institutionalNavigation = [
  ['Sobre', '/sobre'],
  ['Contato', '/contato'],
  ['Privacidade', '/privacidade'],
  ['Termos de uso', '/termos'],
  ['Informações para agentes', '/llms.txt'],
];

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur-xl">
      <nav aria-label="Navegação principal" className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <a href="/" className="shrink-0 text-base font-semibold tracking-[-0.01em] transition-colors hover:text-[#0066cc]">
          Matheus Filgueiras
        </a>
        <div className="hidden items-center gap-6 text-[0.9rem] font-medium text-[#424245] lg:flex">
          {mainNavigation.map(([label, href]) => (
            <a key={href} href={href} className="editorial-nav-link transition-colors hover:text-[#0066cc]">
              {label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a href="/#contato-apple" className="inline-flex min-h-10 items-center rounded-full bg-[#0066cc] px-5 text-[0.88rem] font-semibold text-white transition-colors hover:bg-[#0054ad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4">
            Agendar
          </a>
          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-institucional-mobile"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div id="menu-institucional-mobile" className="mx-5 mb-4 rounded-[22px] bg-white p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/10 sm:mx-8 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {mainNavigation.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-[16px] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[#0066cc]/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/30">
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SiteFooter({ pathname }) {
  return (
    <footer className="bg-[#0066cc] px-5 py-12 text-white sm:px-8" aria-label="Informações institucionais">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-8">
          <a href="/" className="text-xl font-semibold tracking-[-0.04em] text-white hover:text-white/80">
            Matheus Filgueiras
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </a>
        </div>
        <nav aria-label="Links institucionais" className="flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-6 text-sm font-semibold text-white/85">
          {institutionalNavigation.map(([label, href]) => (
            <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className="transition-colors hover:text-white focus-visible:underline">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function Layout({ pageTitle, heading, description, pathname, theme = 'light', image, children, heroExtra }) {
  const blue = theme === 'blue';
  const headingText = heading || pageTitle;
  const titleClass = blue ? 'text-white' : 'text-[#1d1d1f]';
  const descriptionClass = blue ? 'text-white/80' : 'text-[#515154]';

  return (
    <div className="apple-test min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <Helmet>
        <title>{pageTitle} | Matheus Filgueiras</title>
        <meta name="description" content={description} />
      </Helmet>
      <Seo title={pageTitle + ' | Matheus Filgueiras'} description={description} url={BASE + pathname} siteName="Matheus Filgueiras" />
      <SiteHeader />
      <main>
        <section className={(blue ? 'bg-[#0066cc]' : 'bg-[#fbfbfd]') + ' px-5 py-16 sm:px-8 sm:py-20 lg:py-24'}>
          <div className="mx-auto max-w-6xl">
            <div className={image ? 'grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]' : 'max-w-4xl'}>
              <div>
                <p className={'text-xs font-semibold uppercase tracking-[0.24em] ' + (blue ? 'text-white/65' : 'text-[#0066cc]')}>{pageTitle}</p>
                <h1 className={'mt-5 text-[2.8rem] font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-7xl ' + titleClass}>{headingText}</h1>
                <p className={'mt-7 max-w-2xl text-lg leading-relaxed tracking-[-0.02em] sm:text-xl ' + descriptionClass}>{description}</p>
                <a href="/" className={'mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ' + (blue ? 'border-white/30 text-white hover:bg-white/10 focus-visible:ring-white/50' : 'border-[#0066cc]/20 text-[#0066cc] hover:border-[#0066cc]/50 hover:bg-[#0066cc]/5 focus-visible:ring-[#0066cc]/35')}>
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao início
                </a>
              </div>
              {image && (
                <figure className="overflow-hidden rounded-[24px] bg-[#e8e8ed]">
                  <img src={image} alt="Matheus Filgueiras" className="aspect-[4/4] h-full w-full object-cover object-[center_20%]" loading="eager" />
                </figure>
              )}
            </div>
            {heroExtra && <div className="mt-12">{heroExtra}</div>}
          </div>
        </section>
        {children}
      </main>
      <SiteFooter pathname={pathname} />
      <QuickAssistant />
    </div>
  );
}

function TextCard({ eyebrow, title, children, blue = false, className = '' }) {
  return (
    <section className={'rounded-[24px] p-7 sm:p-10 ' + (blue ? 'bg-[#0066cc] text-white' : 'bg-white text-[#1d1d1f]') + ' ' + className}>
      {eyebrow && <p className={'text-xs font-semibold uppercase tracking-[0.2em] ' + (blue ? 'text-white/65' : 'text-[#0066cc]')}>{eyebrow}</p>}
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">{title}</h2>
      <div className={'mt-5 space-y-4 text-[1.06rem] leading-relaxed ' + (blue ? 'text-white/85' : 'text-[#515154]')}>
        {children}
      </div>
    </section>
  );
}

const projectCards = [
  {
    title: 'Unidos pela Bravura',
    label: 'Livro infantil',
    description: 'Uma história construída a partir de uma pesquisa sobre medo e ansiedade na Odontopediatria.',
    href: '/unidos_pela_bravura',
    icon: BookOpen,
  },
  {
    title: 'Pesquisa de mestrado',
    label: 'Pesquisa científica',
    description: 'Investigação de resinas impressas para próteses totais removíveis.',
    href: '/#projetos-apple',
    icon: GraduationCap,
  },
  {
    title: 'Planejamento Estético Digital',
    label: 'Ensino e criação',
    description: 'Materiais educativos e workshop sobre planejamento estético digital 2D.',
    href: '/#projetos-apple',
    icon: Camera,
  },
];

export function AboutPage() {
  return (
    <Layout
      pageTitle="Sobre"
      heading="Um pouco sobre mim."
      pathname="/sobre"
      description="Sou cirurgião-dentista, formado pela Universidade Federal Fluminense, em Nova Friburgo, e mestrando em Odontologia pela UFF."
      image="/assets/photos/retrato-editorial-hero.jpg"
    >
      <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <TextCard eyebrow="O que faço" title="Clínica, pesquisa e ensino.">
            <p>Divido minha rotina entre clínica, pesquisa e materiais educativos.</p>
            <p>Durante minha formação, essas experiências me aproximaram de diferentes maneiras de exercer a Odontologia.</p>
          </TextCard>
          <TextCard eyebrow="Outros interesses" title="Também gosto de criar." blue>
            <p>Desenho, fotografia, escrita, design e tecnologia fazem parte da minha rotina, mesmo fora da atividade profissional.</p>
          </TextCard>
        </div>
      </section>
      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Projetos</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-6xl">Alguns trabalhos que desenvolvo.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#515154]">Entre eles estão um livro infantil, a pesquisa sobre materiais impressos e atividades de ensino em planejamento estético digital.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {projectCards.map(({ title, label, description, href, icon: Icon }) => (
              <a key={title} href={href} className="editorial-project-card group flex flex-col rounded-[24px] bg-[#f5f5f7] p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/40 focus-visible:ring-offset-4">
                <Icon className="h-6 w-6 text-[#0066cc]" strokeWidth={1.7} />
                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">{label}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-[#515154]">{description}</p>
                <span className="editorial-inline-link mt-6 inline-flex items-center font-semibold text-[#0066cc]">
                  Ver projeto <ArrowUpRight className="editorial-link-arrow ml-2 h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function ContactPage() {
  return (
    <Layout
      pageTitle="Contato"
      heading="Vamos conversar?"
      pathname="/contato"
      theme="blue"
      description="Atendo em Nova Friburgo, na Salud Odontologia e na Naturale Dental Studio. Para agendar uma consulta, escolha uma unidade."
      heroExtra={
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: 'Salud Odontologia', href: SALUD },
            { name: 'Naturale Dental Studio', href: NATURALE },
          ].map(({ name, href }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer noopener" className="editorial-contact-card group rounded-[24px] bg-white p-7 text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Marque sua consulta</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{name}</h2>
              <p className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#0066cc]">
                Agendar pelo WhatsApp <ArrowUpRight className="h-4 w-4" />
              </p>
            </a>
          ))}
        </div>
      }
    >
      <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e6e73]">Outros contatos</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Outras formas de entrar em contato.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#515154]">Para assuntos profissionais, escreva por e-mail ou encontre meus perfis oficiais.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              { label: 'E-mail', value: 'matheusfilgueiras.dr@gmail.com', href: EMAIL, Icon: Mail },
              { label: 'Instagram', value: '@dr.matheusfilgueiras', href: 'https://instagram.com/dr.matheusfilgueiras', Icon: Instagram },
              { label: 'LinkedIn', value: 'Perfil profissional', href: 'https://www.linkedin.com/in/matheusfilgueiras', Icon: Linkedin },
              { label: 'Currículo Lattes', value: 'Formação e atividades acadêmicas', href: 'https://lattes.cnpq.br/5800213853757398', Icon: GraduationCap },
            ].map(({ label, value, href, Icon }) => (
              <a key={label} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel={href.startsWith('mailto:') ? undefined : 'noreferrer noopener'} className="editorial-contact-card group flex min-h-36 items-start gap-5 rounded-[24px] bg-white p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/40">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-[#0066cc]" strokeWidth={1.7} />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">{label}</span>
                  <span className="mt-3 block text-lg font-semibold leading-snug tracking-[-0.02em] text-[#1d1d1f] [overflow-wrap:anywhere]">{value}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0066cc]">Abrir contato <ArrowUpRight className="h-4 w-4" /></span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function PrivacyPage() {
  return (
    <Layout
      pageTitle="Privacidade"
      heading="Privacidade e dados."
      pathname="/privacidade"
      description="Informações sobre os dados de navegação e contato utilizados neste site e sobre como solicitar esclarecimentos."
    >
      <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="max-w-3xl text-lg leading-relaxed text-[#515154]">Este site disponibiliza informações profissionais, projetos, livros digitais e canais de contato. Alguns recursos registram dados para funcionamento, segurança e acompanhamento de uso.</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <TextCard eyebrow="Navegação" title="Dados de navegação">
              <p>O registro de acessos pode incluir página visitada, endereço de origem, idioma, fuso horário, dimensões de tela e um identificador armazenado no navegador.</p>
              <p>A hospedagem também pode registrar informações técnicas necessárias ao serviço.</p>
            </TextCard>
            <TextCard eyebrow="Atendimento" title="Conversas e contatos">
              <p>Ao utilizar o assistente de mensagens ou entrar em contato, podem ser registrados o nome e as mensagens que você fornecer, além dos dados técnicos necessários à continuidade da conversa.</p>
              <p>O agendamento por WhatsApp ocorre no serviço da plataforma escolhida, sujeito à política de privacidade correspondente.</p>
            </TextCard>
            <TextCard eyebrow="LGPD" title="Seus direitos" blue>
              <p>Você pode solicitar informações, acesso, correção ou exclusão de dados pessoais, quando aplicável, pelo e-mail <a href={EMAIL} className="font-semibold underline underline-offset-4 hover:text-white/80">matheusfilgueiras.dr@gmail.com</a>.</p>
              <p>As solicitações serão avaliadas conforme a legislação brasileira e as obrigações de conservação aplicáveis.</p>
            </TextCard>
            <TextCard eyebrow="Atualizações" title="Sobre esta página">
              <p>Esta página descreve os mecanismos identificados no site e deve ser revisada sempre que houver mudanças na coleta, nos prestadores de serviço ou na política de retenção dos dados.</p>
            </TextCard>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function TermsPage() {
  return (
    <Layout
      pageTitle="Termos de uso"
      heading="Termos de uso."
      pathname="/termos"
      description="Condições de utilização do site pessoal e profissional de Matheus Filgueiras."
    >
      <section className="bg-[#f5f5f7] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextCard eyebrow="Informações" title="Sobre os conteúdos">
              <p>Os conteúdos disponíveis neste site têm finalidades informativas, acadêmicas e de apresentação profissional.</p>
              <p>Não substituem avaliação clínica individual, diagnóstico ou orientação personalizada.</p>
            </TextCard>
            <TextCard eyebrow="Direitos autorais" title="Materiais publicados">
              <p>Imagens, textos, projetos e materiais publicados pertencem a seus respectivos titulares. A disponibilidade para leitura não implica autorização para reprodução ou utilização comercial.</p>
            </TextCard>
            <TextCard eyebrow="Serviços externos" title="Agendamentos e links">
              <p>Os canais de agendamento e os serviços externos acessados a partir deste site estão sujeitos às próprias condições de uso.</p>
              <p>A confirmação de consultas depende do contato com a unidade escolhida.</p>
            </TextCard>
            <TextCard eyebrow="Dúvidas" title="Precisa entrar em contato?" blue>
              <p>Em caso de dúvidas sobre o conteúdo, escreva para <a href={EMAIL} className="font-semibold underline underline-offset-4 hover:text-white/80">matheusfilgueiras.dr@gmail.com</a>.</p>
            </TextCard>
          </div>
        </div>
      </section>
    </Layout>
  );
}
