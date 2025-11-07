import {notFound} from 'next/navigation';
import {articles} from '@/data/articles';
import {Metadata} from 'next';

// Componentes dos artigos
import {GradeSystemGuide} from '@/components/blog/articles/GradeSystemGuide';
import {InPersonTestTips} from '@/components/blog/articles/InPersonTestTips';
import {ProjetoIntegrador} from '@/components/blog/articles/ProjetoIntegrador';
import {UseOfStudies} from '@/components/blog/articles/UseOfStudies';
import {DisciplinaEAD} from '@/components/blog/articles/DisciplinaEAD';
import {ExameUnivesp} from '@/components/blog/articles/ExameUnivesp';
import {ComponentType} from "react";
import {ArticleLayout} from "@/components/blog/ArticleLayout";
import {GuiaAVA} from "@/components/blog/articles/AvaGuide";
import {OQueCaiNaProva} from "@/components/blog/articles/OQueCaiNaProva";
import {VestibularUnivesp} from "@/components/blog/articles/VestibularUnivesp";
import {GuiaTCC} from "@/components/blog/articles/GuiaTCC";
import {GuiaEstudoExatas} from "@/components/blog/articles/GuiaEstudoExatas";
import {GuiaEixosUnivesp} from "@/components/blog/articles/GuiaEixosUnivesp";
import {ManualNaoEscrito} from "@/components/blog/articles/ManualNaoEscrito";

// Mapeia o slug do artigo ao seu componente React
const articleComponents: Record<string, ComponentType> = {
  'guia-sistema-avaliacao-univesp': GradeSystemGuide,
  'dicas-prova-presencial-univesp': InPersonTestTips,
  'desvendando-projeto-integrador-univesp': ProjetoIntegrador,
  'aproveitamento-estudos-univesp': UseOfStudies,
  'disciplina-e-procrastinacao-univesp': DisciplinaEAD,
  'guia-exame-recuperacao-univesp': ExameUnivesp,
  'guia-ava-univesp': GuiaAVA,
  'o-que-cai-na-prova-univesp': OQueCaiNaProva,
  'o-que-estudar-vestibular-univesp': VestibularUnivesp,
  'guia-tcc-univesp-aprovacao': GuiaTCC,
  'guia-estudo-exatas-univesp': GuiaEstudoExatas,
  'guia-eixos-univesp-ciclo-basico': GuiaEixosUnivesp,
  'manual-nao-escrito-aluno-univesp': ManualNaoEscrito,
};

// Função para gerar metadados dinâmicos (SEO)
export async function generateMetadata({params}: { params: Promise<{ slug: string }> }): Promise<Metadata> {

  const {slug} = await params;

  const article = articles.find(p => p.slug.endsWith(slug));
  if (!article) {
    return {};
  }
  return {
    title: `${article.title} | Calculadora UNIVESP`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

// Função para gerar as páginas estaticamente
export async function generateStaticParams() {
  return articles.map(article => ({
    slug: article.slug.split('/').pop(),
  }));
}

export default async function ArticlePage({params}: { params: Promise<{ slug: string }> }) {
  const {slug} = await params;
  const ArticleComponent = articleComponents[slug];

  if (!ArticleComponent) {
    notFound();
  }

  const articleData = articles.find(p => p.slug.endsWith(slug));

  return (
    <ArticleLayout title={articleData?.title || 'Artigo'} date={articleData?.date} tags={articleData?.tags}>
      <ArticleComponent/>
    </ArticleLayout>
  );
}