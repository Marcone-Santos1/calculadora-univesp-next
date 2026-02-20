import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/actions/blog-actions';
import { Metadata } from 'next';
import { ArticleLayout } from "@/components/blog/ArticleLayout";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import React from 'react';
import Image from 'next/image';
import { SITE_CONFIG } from "@/utils/Constants";

/**
 * Extracts FAQ question/answer pairs from markdown content.
 * Looks for H2 sections with FAQ-related keywords, then collects
 * H3 headings (questions) + following paragraph (answer).
 */
function extractFaqFromMarkdown(content: string): Array<{ question: string; answer: string }> {
  const FAQ_SECTION_KEYWORDS = /perguntas|faq|frequentes|dúvidas|duvidas/i;
  const lines = content.split('\n');
  const faqs: Array<{ question: string; answer: string }> = [];

  let inFaqSection = false;
  let currentQuestion: string | null = null;
  let answerBuffer: string[] = [];

  const flushCurrent = () => {
    if (currentQuestion && answerBuffer.length > 0) {
      const answer = answerBuffer.join(' ').trim();
      if (answer) faqs.push({ question: currentQuestion, answer });
    }
    currentQuestion = null;
    answerBuffer = [];
  };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);
    const isBlank = line.trim() === '';

    if (h2Match) {
      if (FAQ_SECTION_KEYWORDS.test(h2Match[1])) {
        inFaqSection = true;
        flushCurrent();
      } else {
        // Leaving FAQ section
        if (inFaqSection) {
          flushCurrent();
          inFaqSection = false;
        }
      }
      continue;
    }

    if (!inFaqSection) continue;

    if (h3Match) {
      flushCurrent();
      currentQuestion = h3Match[1].trim();
      continue;
    }

    if (currentQuestion) {
      const text = line.trim();
      if (text && !isBlank) {
        // Strip markdown links [text](url) → text, and bold **text** → text
        const clean = text
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1');
        answerBuffer.push(clean);
      }
    }
  }
  flushCurrent();

  return faqs;
}

// Função para gerar metadados dinâmicos (SEO)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  const url = `${SITE_CONFIG.BASE_URL}/blog/${post.slug}`;

  return {
    title: post.metaTitle || `${post.title} | Calculadora UNIVESP`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : [],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      url: url,
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
      url: `${SITE_CONFIG.BASE_URL}/sobre`
    }]
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_CONFIG.BASE_URL}` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_CONFIG.BASE_URL}/blog` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title }
    ]
  };

  // Auto-detect FAQ sections and build FAQPage schema for featured snippets
  const faqItems = extractFaqFromMarkdown(post.content);
  const faqLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  } : null;

  return (
    <ArticleLayout title={post.title} date={post.createdAt.toISOString()} tags={tags} id={post.id}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}

      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
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