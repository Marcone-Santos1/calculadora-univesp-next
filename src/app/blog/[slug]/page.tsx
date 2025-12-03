import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/actions/blog-actions';
import { Metadata } from 'next';
import { ArticleLayout } from "@/components/blog/ArticleLayout";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import Image from 'next/image';

// Função para gerar metadados dinâmicos (SEO)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metaTitle || `${post.title} | Calculadora UNIVESP`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : [],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

// Função para gerar as páginas estaticamente
export async function generateStaticParams() {
  const posts = await getBlogPosts(true);
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const tags = post.keywords ? post.keywords.split(',').map(t => t.trim()) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.createdAt.toISOString(),
    author: [{
      '@type': 'Person',
      name: post.author?.name || 'Equipe Calculadora Univesp',
      url: 'https://univesp-calculadora.vercel.app/sobre'
    }]
  };

  return (
    <ArticleLayout title={post.title} date={post.createdAt.toISOString()} tags={tags}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
          h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
          p: ({ children }: { children?: React.ReactNode }) => <div className="mb-4 leading-relaxed">{children}</div>,
          ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
          a: ({ href, children }: { href?: string, children?: React.ReactNode }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
          blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 bg-gray-50 dark:bg-gray-800/50 py-2 pr-2 rounded-r">{children}</blockquote>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img: (props: any) => (
            <figure className="my-8">
              <div className="relative w-full h-auto">
                <Image
                  src={props.src || ''}
                  alt={props.alt || ''}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
              {props.alt && <figcaption className="text-center text-sm text-gray-500 mt-2">{props.alt}</figcaption>}
            </figure>
          ),
        }}
      >
        {post.content}
      </ReactMarkdown>
    </ArticleLayout>
  );
}