import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { Metadata } from 'next';

// Componentes dos artigos
import { GradeSystemGuide } from '@/components/blog/articles/GradeSystemGuide';
import { InPersonTestTips } from '@/components/blog/articles/InPersonTestTips';
import { ProjetoIntegrador } from '@/components/blog/articles/ProjetoIntegrador';
import { UseOfStudies } from '@/components/blog/articles/UseOfStudies';
import { DisciplinaEAD } from '@/components/blog/articles/DisciplinaEAD';
import { ExameUnivesp } from '@/components/blog/articles/ExameUnivesp';
import {ComponentType} from "react";
import {ArticleLayout} from "@/components/blog/ArticleLayout";

// Mapeia o slug do artigo ao seu componente React
const articleComponents: Record<string, ComponentType> = {
  'guia-sistema-avaliacao-univesp': GradeSystemGuide as ComponentType,
  'dicas-prova-presencial-univesp': InPersonTestTips as ComponentType,
  'desvendando-projeto-integrador-univesp': ProjetoIntegrador as ComponentType,
  'aproveitamento-estudos-univesp': UseOfStudies as ComponentType,
  'disciplina-e-procrastinacao-univesp': DisciplinaEAD as ComponentType,
  'guia-exame-recuperacao-univesp': ExameUnivesp as ComponentType,
};

// Função para gerar metadados dinâmicos (SEO)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles.find(p => p.slug.endsWith(params.slug));
  if (!article) {
    return {};
  }
  return {
    title: `${article.title} | Calculadora UNIVESP`,
    description: article.description,
  };
}

// Função para gerar as páginas estaticamente
export async function generateStaticParams() {
  return articles.map(article => ({
    slug: article.slug.split('/').pop(),
  }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const ArticleComponent = articleComponents[params.slug];

  if (!ArticleComponent) {
    notFound();
  }

  const articleData = articles.find(p => p.slug.endsWith(params.slug));

  return (
    <ArticleLayout title={articleData?.title || 'Artigo'}>
      <ArticleComponent />
    </ArticleLayout>
  );
}