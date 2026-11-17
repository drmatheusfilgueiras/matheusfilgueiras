import React from 'react';
import { Helmet } from 'react-helmet';
import Seo from '@/components/Seo';

const BASE = 'https://matheusfilgueiras.com';
const EMAIL = 'mailto:matheusfilgueiras.dr@gmail.com';
const SALUD = 'https://api.whatsapp.com/send?phone=22992096463&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const NATURALE = 'https://api.whatsapp.com/send/?phone=5522998508639&text&type=phone_number&app_absent=0';

function Layout({ title, description, pathname, children }) {
  return (
    <div className="min-h-screen bg-[#fbfbfd] px-5 py-12 font-sans text-[#1d1d1f] sm:px-8">
      <Helmet>
        <title>{title} | Matheus Filgueiras</title>
        <meta name="description" content={description} />
      </Helmet>
      <Seo title={title + ' | Matheus Filgueiras'} description={description} url={BASE + pathname} siteName="Matheus Filgueiras" />
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Navegação" className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d2d2d7] pb-5">
          <a className="font-semibold hover:text-[#0066cc]" href="/">Matheus Filgueiras</a>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/sobre" className="hover:text-[#0066cc]">Sobre</a>
            <a href="/contato" className="hover:text-[#0066cc]">Contato</a>
            <a href="/privacidade" className="hover:text-[#0066cc]">Privacidade</a>
          </div>
        </nav>
        <main className="py-14">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{title}</h1>
          <div className="mt-9 space-y-6 text-lg leading-relaxed text-[#515154]">{children}</div>
        </main>
        <footer className="flex flex-wrap gap-5 border-t border-[#d2d2d7] py-7 text-sm text-[#515154]">
          <a href="/" className="hover:text-[#0066cc]">Início</a>
          <a href="/sobre" className="hover:text-[#0066cc]">Sobre</a>
          <a href="/contato" className="hover:text-[#0066cc]">Contato</a>
          <a href="/privacidade" className="hover:text-[#0066cc]">Privacidade</a>
          <a href="/termos" className="hover:text-[#0066cc]">Termos de uso</a>
        </footer>
      </div>
    </div>
  );
}

export function AboutPage() {
  return <Layout title="Sobre" pathname="/sobre" description="Conheça a formação, a pesquisa e os projetos de Matheus Filgueiras.">
    <p>Sou cirurgião-dentista, formado pela Universidade Federal Fluminense, em Nova Friburgo, e mestrando em Odontologia pela UFF.</p>
    <p>Divido minha rotina entre clínica, pesquisa e materiais educativos. Também me interesso por desenho, fotografia, escrita, design e tecnologia.</p>
    <p>Entre os projetos que desenvolvo estão o livro infantil <a className="text-[#0066cc] underline" href="/unidos_pela_bravura">Unidos pela Bravura</a>, a pesquisa sobre resinas impressas para próteses totais e materiais de ensino sobre planejamento estético digital.</p>
    <p><a href="/#projetos-apple" className="font-semibold text-[#0066cc] underline">Conheça os projetos na página inicial.</a></p>
  </Layout>;
}

export function ContactPage() {
  return <Layout title="Contato" pathname="/contato" description="Canais profissionais e informações de agendamento com Matheus Filgueiras em Nova Friburgo.">
    <p>Atendo em Nova Friburgo, na Salud Odontologia e na Naturale Dental Studio. Para agendar uma consulta, escolha uma unidade.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <a className="rounded-2xl bg-[#0066cc] p-5 font-semibold text-white" href={SALUD} target="_blank" rel="noopener noreferrer">Agendar na Salud Odontologia</a>
      <a className="rounded-2xl bg-[#0066cc] p-5 font-semibold text-white" href={NATURALE} target="_blank" rel="noopener noreferrer">Agendar na Naturale Dental Studio</a>
    </div>
    <p>Para outros assuntos profissionais, escreva para <a className="text-[#0066cc] underline" href={EMAIL}>matheusfilgueiras.dr@gmail.com</a>.</p>
    <p>Perfis oficiais: <a className="text-[#0066cc] underline" href="https://instagram.com/dr.matheusfilgueiras" target="_blank" rel="noopener noreferrer">Instagram</a>, <a className="text-[#0066cc] underline" href="https://www.linkedin.com/in/matheusfilgueiras" target="_blank" rel="noopener noreferrer">LinkedIn</a> e <a className="text-[#0066cc] underline" href="https://lattes.cnpq.br/5800213853757398" target="_blank" rel="noopener noreferrer">Currículo Lattes</a>.</p>
  </Layout>;
}

export function PrivacyPage() {
  return <Layout title="Privacidade" pathname="/privacidade" description="Informações sobre o tratamento de dados de navegação e contato neste site.">
    <p>Este site disponibiliza informações profissionais, projetos, livros digitais e canais de contato. Alguns recursos registram dados para funcionamento, segurança e acompanhamento de uso.</p>
    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Dados de navegação</h2>
    <p>O registro de acessos pode incluir página visitada, endereço de origem, idioma, fuso horário, dimensões de tela e um identificador armazenado no navegador. A hospedagem também pode registrar informações técnicas necessárias ao serviço.</p>
    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Conversas e contatos</h2>
    <p>Ao utilizar o assistente de mensagens ou entrar em contato, podem ser registrados o nome e as mensagens que você fornecer, além dos dados técnicos necessários à continuidade da conversa. O agendamento por WhatsApp ocorre no serviço da plataforma escolhida, sujeito à política de privacidade correspondente.</p>
    <h2 className="text-2xl font-semibold text-[#1d1d1f]">Seus direitos</h2>
    <p>Você pode solicitar informações, acesso, correção ou exclusão de dados pessoais, quando aplicável, pelo e-mail <a href={EMAIL} className="text-[#0066cc] underline">matheusfilgueiras.dr@gmail.com</a>. As solicitações serão avaliadas conforme a legislação brasileira e as obrigações de conservação aplicáveis.</p>
    <p>Esta página descreve os mecanismos identificados no site e deve ser revisada sempre que houver mudanças na coleta, nos prestadores de serviço ou na política de retenção dos dados.</p>
  </Layout>;
}

export function TermsPage() {
  return <Layout title="Termos de uso" pathname="/termos" description="Condições de utilização do site pessoal e profissional de Matheus Filgueiras.">
    <p>Os conteúdos disponíveis neste site têm finalidades informativas, acadêmicas e de apresentação profissional. Não substituem avaliação clínica individual, diagnóstico ou orientação personalizada.</p>
    <p>Imagens, textos, projetos e materiais publicados pertencem a seus respectivos titulares. A disponibilidade para leitura não implica autorização para reprodução ou utilização comercial.</p>
    <p>Os canais de agendamento e os serviços externos acessados a partir deste site estão sujeitos às próprias condições de uso. A confirmação de consultas depende do contato com a unidade escolhida.</p>
    <p>Em caso de dúvidas sobre o conteúdo, escreva para <a href={EMAIL} className="text-[#0066cc] underline">matheusfilgueiras.dr@gmail.com</a>.</p>
  </Layout>;
}
