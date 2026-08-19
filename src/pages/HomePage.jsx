import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Instagram, Linkedin, Mail, FileText } from 'lucide-react';
import Reveal from '@/components/Reveal';
import DiferentesFaces from '@/components/DiferentesFaces';
import HistoriasClinicas from '@/components/HistoriasClinicas';
const IMG_PORTRAIT = '/assets/photos/retrato-editorial-hero.jpg';
const IMG_PROJECTS = {
  bravura: 'https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/unidos-pela-bravura-bm0pT.png',
  pesquisa: 'https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/img_7544-VThWQ.jpg',
  sedaflow: 'https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/circuito-gbpd-3-Wd5pP.png',
  visual: 'https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/img_9961-qr4hg.jpg'
};
const marqueeWords = ['Odontologia', 'Pesquisa', 'Escrita', 'Ilustração', 'Design', 'Tecnologia'];
const oQueMeMove = [{
  num: '01',
  titulo: 'Curiosidade',
  texto: 'Gosto de entender como as coisas funcionam — e principalmente imaginar como poderiam funcionar de outra maneira.',
  resto: 'Foi essa curiosidade que me levou da clínica ao laboratório, do papel ao digital e da Odontologia a projetos que, muitas vezes, começam longe dela.'
}, {
  num: '02',
  titulo: 'Cuidado',
  texto: 'Um bom resultado não depende apenas daquilo que fazemos, mas de para quem estamos fazendo.',
  resto: 'Na clínica, em um livro, em uma interface ou em uma apresentação, tento nunca esquecer que existe alguém do outro lado.'
}, {
  num: '03',
  titulo: 'Criação',
  texto: 'Tenho dificuldade em permanecer apenas no campo das ideias. Gosto de transformá-las.',
  resto: 'Às vezes em um sorriso. Às vezes em uma pesquisa. Às vezes em um desenho, um livro, uma imagem ou um produto digital.'
}];
const caminho = [{
  titulo: 'Odontologia',
  lugar: 'Universidade Federal Fluminense',
  texto: 'Foi onde minha trajetória profissional começou — e onde descobri uma área que mistura ciência, habilidade manual, planejamento, estética e cuidado.'
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
  img: 'https://horizons-cdn.hostinger.com/11df31c6-0445-4b46-af7c-449f6b18352f/ciaancia-Z4SGO.png',
  texto: 'Clínica, planejamento, reabilitação oral e odontologia digital. Tenho especial interesse nos momentos em que conhecimento técnico, tecnologia e sensibilidade precisam trabalhar juntos.'
}, {
  titulo: 'Ciência',
  img: 'https://images.hostinger.com/e1ec4ac1-667b-4faa-aeb5-c97b1d5d4ea9.png',
  texto: 'Pesquisa, escrita acadêmica, experimentação e comunicação científica. Mais do que encontrar respostas, gosto do processo de aprender a formular perguntas melhores.'
}, {
  titulo: 'Desenho',
  img: 'https://images.hostinger.com/ebf733ce-ad35-47fe-850a-d9d3da61d898.png',
  texto: 'Antes de algumas ideias virarem projetos, elas viram rabiscos. O desenho acabou encontrando espaço também dentro da minha trajetória científica e profissional — especialmente na criação de materiais educativos.'
}, {
  titulo: 'Escrita',
  img: 'https://images.hostinger.com/26c84a28-e864-479d-af6a-47b6dcf322ab.png',
  texto: 'Artigos, histórias, roteiros e ideias. Escrever é outra maneira que encontrei de organizar pensamentos e transformar assuntos complexos em algo que possa ser compreendido por outras pessoas.'
}, {
  titulo: 'Design',
  img: 'https://images.hostinger.com/9226ec8f-0dcd-453f-a5cb-c7fc7c111da4.png',
  texto: 'Identidades visuais, apresentações, fotografia, conteúdo e experiência. Não penso em design como decoração. Design, para mim, é dar forma a uma ideia.'
}, {
  titulo: 'Tecnologia',
  img: 'https://images.hostinger.com/6ae07e1c-144e-49f2-85e5-4683fd52b886.png',
  texto: 'Fluxos digitais, impressão 3D, inteligência artificial, interfaces e desenvolvimento de novos projetos. Não me interessa tecnologia apenas pelo que ela consegue fazer. Me interessa principalmente pelo que podemos criar com ela.'
}];
const projetos = [{
  num: '01',
  titulo: 'Unidos pela Bravura',
  tags: 'Odontologia · Ciência · Escrita · Ilustração',
  sub: 'Quando uma pesquisa virou história.',
  texto: 'O projeto nasceu a partir de uma pergunta dentro da Odontopediatria e acabou se transformando em uma coleção de livros infantis. A proposta foi criar uma ferramenta capaz de ajudar crianças a compreender melhor o atendimento odontológico e se preparar para essa experiência. No processo, pesquisa científica, escrita, narrativa, ilustração, inteligência artificial e design passaram a trabalhar juntas.',
  destaque: 'O que começou como pesquisa terminou em algo que uma criança pudesse segurar nas mãos.',
  cta: 'Conhecer o projeto',
  img: IMG_PROJECTS.bravura
}, {
  num: '02',
  titulo: 'Pesquisa em Odontologia Digital',
  tags: 'Ciência · Materiais · Impressão 3D',
  sub: 'O que acontece depois que apertamos “imprimir”?',
  texto: 'Minha pesquisa de mestrado investiga materiais utilizados na impressão 3D aplicada à Odontologia. Entre resinas, processos de pós-cura, células e laboratório, o objetivo é entender melhor não apenas o que conseguimos fabricar digitalmente, mas como esses materiais se comportam quando chegam mais perto da realidade biológica. É uma das áreas onde minha curiosidade por Odontologia e tecnologia se encontra de maneira mais direta.',
  destaque: null,
  cta: 'Conhecer a pesquisa',
  img: IMG_PROJECTS.pesquisa
}, {
  num: '03',
  titulo: 'SedaFlow',
  tags: 'Odontologia · Produto · Design · Tecnologia',
  sub: 'E se um fluxo clínico pudesse ser repensado?',
  texto: 'SedaFlow nasceu da tentativa de organizar e simplificar processos relacionados à sedação consciente em Odontologia. O projeto reúne uma área clínica que faz parte da minha atuação com outros interesses que sempre estiveram presentes: experiência do usuário, design de interface, organização da informação, tecnologia e comunicação. Mais do que desenvolver uma ferramenta, o processo tem sido um exercício constante de transformar necessidades clínicas em decisões de produto.',
  destaque: null,
  cta: 'Conhecer o projeto',
  img: IMG_PROJECTS.sedaflow
}, {
  num: '04',
  titulo: 'Comunicação visual',
  tags: 'Design · Fotografia · Ciência',
  sub: 'Nem toda pesquisa precisa parecer uma pesquisa.',
  texto: 'Ao longo da minha formação, comecei a desenvolver cada vez mais os materiais que utilizava para apresentar ideias. Apresentações científicas, ilustrações, fotografias, vídeos e identidades visuais passaram a fazer parte do meu processo. Hoje, acredito que comunicar uma ideia também faz parte de construí-la. Porque até o melhor conteúdo pode se perder quando ninguém consegue entendê-lo.',
  destaque: null,
  cta: 'Ver trabalhos',
  img: IMG_PROJECTS.visual
}];
const historiasClinicas = [{
  titulo: 'Reabilitação anterior',
  procedimento: 'Facetas em resina composta · 6 elementos',
  nota: 'Desgaste e manchas nos dentes anteriores devolveram o equilíbrio do sorriso através de facetas adesivas planejadas digitalmente.',
  antes: 'https://images.hostinger.com/db006d27-493a-4e37-83db-1bb9914c0bbb.png',
  depois: 'https://images.hostinger.com/3df6214a-b503-46ac-b91a-26a93771c33b.png'
}, {
  titulo: 'Harmonização da arcada inferior',
  procedimento: 'Ortodontia alinhadora · restaurações estéticas',
  nota: 'Após o alinhamento, pequenas restaurações ajustaram forma e textura dos dentes inferiores para um resultado natural.',
  antes: 'https://images.hostinger.com/919b05ed-eec5-4f57-9acb-fb29fada7d7f.png',
  depois: 'https://images.hostinger.com/45ddbe88-8ae7-462c-818d-582fddaf323c.png'
}, {
  titulo: 'Fechamento de diastema',
  procedimento: 'Resina composta adesiva · 2 elementos',
  nota: 'O espaço entre os incisivos centrais foi fechado sem desgaste dental, preservando a estrutura natural do paciente.',
  antes: 'https://images.hostinger.com/1350fb0d-2215-4a35-bbf0-49cbc5bc7c90.png',
  depois: 'https://images.hostinger.com/5170f588-6a11-4cdb-9605-0c55317d195f.png'
}];
const processo = [{
  num: '01',
  titulo: 'Observar',
  texto: 'Antes de criar, tento entender.'
}, {
  num: '02',
  titulo: 'Perguntar',
  texto: 'O que realmente precisa ser resolvido?'
}, {
  num: '03',
  titulo: 'Explorar',
  texto: 'Pesquisa, referências, rascunhos, hipóteses e possibilidades.'
}, {
  num: '04',
  titulo: 'Criar',
  texto: 'É quando algo deixa de existir apenas na cabeça.'
}, {
  num: '05',
  titulo: 'Refinar',
  texto: 'Rever, testar, cortar, reorganizar e tentar novamente.'
}];
function HomePage() {
  return <div className="min-h-screen bg-background text-foreground antialiased">
            <Helmet>
                <title>Matheus Filgueiras | Dentista, pesquisador, autor e designer</title>
                <meta name="description" content="Matheus Filgueiras — cirurgião-dentista, mestrando em Odontologia e criador. Odontologia, pesquisa, escrita, ilustração, design e tecnologia na interseção entre diferentes maneiras de criar." />
            </Helmet>

            {/* HEADER */}
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
                <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-6 py-4 lg:px-12">
                    <a href="#inicio" className="leading-none">
                        <img src="/assets/brand/mf-odonto-azul.png" alt="Matheus Filgueiras" className="block h-10 w-auto" />
                    </a>
                    <nav className="hidden items-center gap-8 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground lg:flex">
                        <a className="transition-colors hover:text-primary" href="#apresentacao">Apresentação</a>
                        <a className="transition-colors hover:text-primary" href="#sobre">Sobre</a>
                        <a className="transition-colors hover:text-primary" href="#move">O que me move</a>
                        <a className="transition-colors hover:text-primary" href="#projetos">Projetos</a>
                        <a className="transition-colors hover:text-primary" href="#contato">Contato</a>
                    </nav>
                    <a href="https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras" target="_blank" rel="noreferrer noopener" className="inline-flex min-h-[44px] items-center gap-2 bg-primary px-5 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                        Vamos conversar
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                    </a>
                </div>
            </header>

            {/* 01 — HOME / HERO */}
            <section id="inicio" className="relative overflow-hidden">
                <div className="mx-auto grid w-full max-w-[90rem] items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-28">
                    <div>
                        <motion.p initial={{
            opacity: 0,
            y: 12
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            ease: 'easeOut'
          }} className="mb-8 text-[0.72rem] uppercase tracking-[0.4em] text-primary">
                            Matheus Filgueiras
                        </motion.p>
                        <h1 className="text-[2.7rem] font-light leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.6rem]">
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
                                Dentista por formação.
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
                                <span className="underline-stroke font-script text-primary">Curioso</span> por natureza.
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
          }} className="mt-8 max-w-[34rem] text-[1.05rem] leading-relaxed text-muted-foreground">
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
            delay: 0.36
          }} className="mt-3 max-w-[34rem] text-[1.15rem] font-light leading-relaxed text-foreground">
                            transformar ideias em algo real.
                        </motion.p>
                        <motion.div initial={{
            opacity: 0,
            y: 18
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            ease: 'easeOut',
            delay: 0.44
          }} className="mt-10 flex flex-wrap items-center gap-4">
                            <a href="#apresentacao" className="inline-flex min-h-[48px] items-center gap-2 bg-primary px-7 text-[0.78rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                                Conheça meu trabalho
                                <ArrowDown className="h-4 w-4" strokeWidth={1.6} />
                            </a>
                        </motion.div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-6 -top-6 hidden h-32 w-32 border-l border-t border-primary/40 lg:block" />
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
                        <div className="absolute -bottom-6 left-6 bg-background px-6 py-4 shadow-[0_18px_40px_-24px_hsl(214_72%_24%/0.45)]">
                            <p className="font-script text-xl text-primary">Transformar ideias</p>
                            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                                em algo real
                            </p>
                        </div>
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
            <section id="apresentacao" className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
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
                            Também desenho. Escrevo. Fotografo. Desenvolvo projetos. Gosto de design, comunicação,
                            tecnologia e de entender como ideias se transformam em experiências.
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
                            Grande parte do que faço nasce justamente do encontro entre eles.
                        </p>
                    </Reveal>
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
                    <div className="mt-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <Reveal delay={0.05} className="space-y-6 text-[1.05rem] leading-relaxed text-muted-foreground">
                            <p>E, com o tempo, percebi que talvez eu nem precisasse.</p>
                            <p>
                                Minha formação aconteceu dentro da Odontologia, mas minha curiosidade nunca respeitou
                                muito os limites de uma profissão.
                            </p>
                            <p>Foi assim que a clínica encontrou o design.</p>
                            <p>A pesquisa encontrou a ilustração.</p>
                            <p>A ciência encontrou histórias.</p>
                            <p>E algumas ideias acabaram encontrando tecnologia.</p>
                        </Reveal>
                        <Reveal delay={0.12} className="space-y-6 text-[1.05rem] leading-relaxed text-muted-foreground">
                            <p>
                                Não enxergo essas áreas como carreiras paralelas. Para mim, são diferentes maneiras de
                                observar, entender e criar.
                            </p>
                            <p>A Odontologia me ensinou a prestar atenção aos detalhes.</p>
                            <p>A ciência, a questioná-los.</p>
                            <p>O desenho, a imaginá-los de outra forma.</p>
                            <p>E o design, a dar forma ao que antes era apenas uma ideia.</p>
                            <p className="border-l-2 border-primary/60 pl-5 text-lg font-light leading-relaxed text-foreground">
                                Talvez seja justamente na interseção entre essas coisas que eu mais goste de trabalhar.
                            </p>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 04 — O QUE ME MOVE */}
            <section id="move" className="mx-auto w-full max-w-[90rem] px-6 py-20 lg:px-12 lg:py-32">
                <Reveal>
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">O que me move</p>
                    <h2 className="mt-6 max-w-[24ch] text-3xl font-light leading-tight sm:text-[2.8rem]">
                        Algumas ideias atravessam tudo o que faço.
                    </h2>
                </Reveal>
                <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
                    {oQueMeMove.map((item, i) => <Reveal key={item.num} delay={i * 0.08} y={20}>
                            <div className="flex h-full flex-col bg-background p-8 lg:p-10">
                                <span className="text-[0.75rem] tracking-[0.3em] text-primary/60">{item.num}</span>
                                <h3 className="mt-5 text-2xl font-light tracking-tight text-foreground">
                                    {item.titulo}
                                </h3>
                                <p className="mt-5 text-[1rem] font-light leading-relaxed text-foreground">
                                    {item.texto}
                                </p>
                                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                                    {item.resto}
                                </p>
                            </div>
                        </Reveal>)}
                </div>
                <Reveal delay={0.1}>
                    <p className="mt-10 text-center text-lg font-light leading-relaxed text-foreground">
                        Muda o meio. <span className="font-script text-primary">A vontade de construir alguma coisa continua a mesma.</span>
                    </p>
                </Reveal>
            </section>

            {/* 05 — CAMINHO */}
            <section id="caminho" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Caminho</p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            O caminho até <span className="font-script text-primary">aqui.</span>
                        </h2>
                    </Reveal>
                    <div className="mt-14 divide-y divide-border border-t border-border">
                        {caminho.map((item, i) => <Reveal key={item.titulo} delay={i * 0.08}>
                                <div className="grid gap-4 py-9 sm:grid-cols-[6rem_1fr] sm:items-baseline">
                                    <span className="text-[0.75rem] tracking-[0.3em] text-primary/60">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
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
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Diferentes faces</p>
                    <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                        Diferentes formas de <span className="font-script text-primary">criar.</span>
                    </h2>
                </Reveal>
                <Reveal delay={0.05}>
                    <p className="mt-6 max-w-[40rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                        Não gosto muito da palavra “habilidades”. Prefiro pensar em{' '}
                        <span className="text-foreground">linguagens</span>. São ferramentas diferentes que uso
                        dependendo da ideia que quero tirar do papel.
                    </p>
                </Reveal>
                <DiferentesFaces faces={faces} />
            </section>

            {/* 07 — UMA PEQUENA INTERSEÇÃO */}
            <section id="intersecao" className="relative overflow-hidden border-y border-border bg-primary text-primary-foreground">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-24 lg:px-8 lg:py-36">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary-foreground/70">
                            Uma pequena interseção
                        </p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Também desenho <span className="font-script">sorrisos.</span>
                        </h2>
                    </Reveal>
                    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {['Alguns no papel.', 'Outros no computador.', 'Alguns através de uma restauração.', 'Outros através de um projeto que começa com uma tela em branco.'].map((line, i) => <Reveal key={line} delay={i * 0.08}>
                                <p className="text-lg font-light leading-relaxed text-primary-foreground/90">{line}</p>
                            </Reveal>)}
                    </div>
                    <Reveal delay={0.2}>
                        <p className="mt-12 max-w-[44rem] text-[1.08rem] leading-relaxed text-primary-foreground/85">
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
                <div className="mx-auto w-full max-w-[90rem] px-6 py-20 lg:px-12 lg:py-32">
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

            {/* 09 — PROJETOS SELECIONADOS */}
            <section id="projetos" className="mx-auto w-full max-w-[90rem] px-6 py-20 lg:px-12 lg:py-32">
                <Reveal>
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Projetos selecionados</p>
                    <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                        Algumas ideias que <span className="font-script text-primary">ganharam forma.</span>
                    </h2>
                </Reveal>
                <Reveal delay={0.05}>
                    <p className="mt-6 max-w-[44rem] text-[1.02rem] leading-relaxed text-muted-foreground">
                        Não são todas as coisas que já fiz. São algumas das que ajudam a explicar quem estou me
                        tornando.
                    </p>
                </Reveal>

                <div className="mt-16 space-y-20 lg:space-y-28">
                    {projetos.map((p, i) => <Reveal key={p.num} y={28}>
                            <article className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? 'lg:[&>figure:first-child]:order-2' : ''}`}>
                                <figure className="relative overflow-hidden">
                                    <img src={p.img} alt={p.titulo} className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading="lazy" />
                                </figure>
                                <div>
                                    <span className="text-[0.75rem] tracking-[0.3em] text-primary/60">{p.num}</span>
                                    <h3 className="mt-4 text-2xl font-light tracking-tight text-foreground sm:text-[2rem]">
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
                                    <a href="#contato" className="mt-7 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.22em] text-primary transition-colors hover:text-foreground">
                                        {p.cta}
                                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                                    </a>
                                </div>
                            </article>
                        </Reveal>)}
                </div>
            </section>

            {/* 10 — COMO EU TRABALHO */}
            <section id="processo" className="border-y border-border bg-secondary/40">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                    <Reveal>
                        <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Como eu trabalho</p>
                        <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                            Quase tudo começa do <span className="font-script text-primary">mesmo jeito.</span>
                        </h2>
                    </Reveal>
                    <div className="mt-14 divide-y divide-border border-t border-border">
                        {processo.map((step, i) => <Reveal key={step.num} delay={i * 0.06}>
                                <div className="group grid gap-3 py-7 sm:grid-cols-[5rem_10rem_1fr] sm:items-baseline">
                                    <span className="text-[0.75rem] tracking-[0.3em] text-primary/60">{step.num}</span>
                                    <h3 className="text-lg font-medium tracking-tight text-foreground">{step.titulo}</h3>
                                    <p className="text-[0.98rem] leading-relaxed text-muted-foreground">{step.texto}</p>
                                </div>
                            </Reveal>)}
                    </div>
                    <Reveal delay={0.1}>
                        <p className="mt-10 max-w-[48rem] text-[1.05rem] leading-relaxed text-muted-foreground">
                            Não importa muito se o resultado final será uma restauração, um experimento, uma página,
                            um desenho ou uma interface.
                        </p>
                        <p className="mt-4 text-lg font-light leading-relaxed text-foreground">
                            O processo de criação costuma ser surpreendentemente parecido.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* 10 — MAIS QUE UMA DEFINIÇÃO */}
            <section id="definicao" className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                <Reveal>
                    <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary">Mais que uma definição</p>
                    <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]"><span style={{
            fontSize: "48px",
            lineHeight: "normal"
          }}><span style={{
              lineHeight: "normal"
            }}>Afinal, o que você <span className="font-script text-primary">faz?</span></span></span><span className="font-script text-primary"></span></h2>
                </Reveal>
                <div className="mt-10 max-w-[44rem] space-y-6 text-[1.08rem] leading-relaxed text-muted-foreground">
                    <Reveal delay={0.05}>
                        <p>Dentista ainda seria a resposta mais fácil. E não está errada.</p>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="text-xl font-light leading-relaxed text-foreground">Só não é completa.</p>
                    </Reveal>
                </div>
                <Reveal delay={0.15}>
                    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[1.1rem] font-light text-foreground">
                        {['Sou dentista.', 'Pesquisador em formação.', 'Autor.', 'Desenho.', 'Escrevo.', 'Crio.', 'Fotografo.', 'Desenvolvo projetos.', 'Gosto de tecnologia.', 'Gosto de transformar informação em algo mais claro.'].map(line => <li key={line} className="flex items-center gap-6">
                                <span>{line}</span>
                                <span className="h-1 w-1 rounded-full bg-primary/40" />
                            </li>)}
                    </ul>
                </Reveal>
                <Reveal delay={0.2}>
                    <div className="mt-12 space-y-5 max-w-[48rem] text-[1.08rem] leading-relaxed text-muted-foreground">
                        <p>
                            Não quero construir uma trajetória em que tudo precise caber dentro de uma única palavra.
                        </p>
                        <p className="text-lg font-light leading-relaxed text-foreground">
                            Quero continuar descobrindo o que acontece quando conhecimentos diferentes ocupam o mesmo
                            espaço.
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* 11 — CONTATO */}
            <section id="contato" className="border-t border-border bg-primary text-primary-foreground">
                <div className="mx-auto w-full max-w-[72rem] px-6 py-20 lg:px-8 lg:py-32">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <p className="text-[0.72rem] uppercase tracking-[0.4em] text-primary-foreground/70">
                                Contato
                            </p>
                            <h2 className="mt-6 text-3xl font-light leading-tight sm:text-[2.8rem]">
                                Podemos começar por uma <span className="font-script">ideia.</span>
                            </h2>
                            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-primary-foreground/85">
                                Projetos, pesquisa, Odontologia, livros, design, tecnologia — ou alguma coisa que
                                ainda não tenha nome. Se você encontrou algo por aqui que despertou uma conversa,
                                será um prazer continuar.
                            </p>
                            <p className="mt-8 font-script text-2xl text-primary-foreground">Matheus Filgueiras</p>
                        </div>
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
                    </div>
                    <Reveal delay={0.1}>
                        <a href="https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras" target="_blank" rel="noreferrer noopener" className="mt-12 inline-flex min-h-[52px] items-center gap-2 bg-primary-foreground px-8 text-[0.8rem] uppercase tracking-[0.22em] text-primary transition-transform hover:-translate-y-px active:scale-[0.98]">
                            Vamos conversar
                            <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                        </a>
                    </Reveal>
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
