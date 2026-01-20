
import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { articles } from '../src/data/articles';

// Map slugs to filenames based on src/app/blog/[slug]/page.tsx imports
const slugToFilename: Record<string, string> = {
    'guia-sistema-avaliacao-univesp': 'GradeSystemGuide.tsx',
    'dicas-prova-presencial-univesp': 'InPersonTestTips.tsx',
    'desvendando-projeto-integrador-univesp': 'ProjetoIntegrador.tsx',
    'aproveitamento-estudos-univesp': 'UseOfStudies.tsx',
    'disciplina-e-procrastinacao-univesp': 'DisciplinaEAD.tsx',
    'guia-exame-recuperacao-univesp': 'ExameUnivesp.tsx',
    'guia-ava-univesp': 'AvaGuide.tsx',
    'o-que-cai-na-prova-univesp': 'OQueCaiNaProva.tsx',
    'o-que-estudar-vestibular-univesp': 'VestibularUnivesp.tsx',
    'guia-tcc-univesp-aprovacao': 'GuiaTCC.tsx',
    'guia-estudo-exatas-univesp': 'GuiaEstudoExatas.tsx',
    'guia-eixos-univesp-ciclo-basico': 'GuiaEixosUnivesp.tsx',
    'manual-nao-escrito-aluno-univesp': 'ManualNaoEscrito.tsx',
};

function jsxToMarkdown(content: string): string {
    // Remove imports and component definition
    let body = content.match(/return \(\s*<>([\s\S]*?)<\/>\s*\);/)?.[1] ||
        content.match(/return \(\s*([\s\S]*?)\s*\);/)?.[1] || '';

    if (!body) return '';

    // Clean up indentation
    body = body.split('\n').map(line => line.trim()).join('\n');

    // 1. Handle Images (Next.js Image component) - Block match
    body = body.replace(/<Image([\s\S]*?)\/>/g, (match, attributes) => {
        const srcMatch = attributes.match(/src="([^"]*)"/);
        const altMatch = attributes.match(/alt="([^"]*)"/);
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';
        return `![${alt}](${src})\n\n`;
    });

    // 2. Handle Links (Next.js Link and a tags) - Block match
    body = body.replace(/<Link[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/Link>/g, '[$2]($1)');
    body = body.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)');

    // 3. Handle Special Divs (Alerts) - Block match
    body = body.replace(/<div[^>]*role="alert"[^>]*>([\s\S]*?)<\/div>/g, (match, content) => {
        return '> ' + content.trim() + '\n\n';
    });

    // 4. Handle Lists - TAG REPLACEMENT (to avoid nesting issues)
    body = body.replace(/<li[^>]*>/g, '- ');
    body = body.replace(/<\/li>/g, '\n');
    body = body.replace(/<ul[^>]*>/g, '');
    body = body.replace(/<\/ul>/g, '');
    body = body.replace(/<ol[^>]*>/g, '');
    body = body.replace(/<\/ol>/g, '');

    // 5. Handle Headers - TAG REPLACEMENT
    body = body.replace(/<h1[^>]*>/g, '# ');
    body = body.replace(/<\/h1>/g, '\n\n');
    body = body.replace(/<h2[^>]*>/g, '## ');
    body = body.replace(/<\/h2>/g, '\n\n');
    body = body.replace(/<h3[^>]*>/g, '### ');
    body = body.replace(/<\/h3>/g, '\n\n');
    body = body.replace(/<h4[^>]*>/g, '#### ');
    body = body.replace(/<\/h4>/g, '\n\n');
    body = body.replace(/<h5[^>]*>/g, '##### ');
    body = body.replace(/<\/h5>/g, '\n\n');
    body = body.replace(/<h6[^>]*>/g, '###### ');
    body = body.replace(/<\/h6>/g, '\n\n');

    // 6. Handle Formatting - TAG REPLACEMENT
    body = body.replace(/<strong[^>]*>/g, '**');
    body = body.replace(/<\/strong>/g, '**');
    body = body.replace(/<b[^>]*>/g, '**');
    body = body.replace(/<\/b>/g, '**');
    body = body.replace(/<em[^>]*>/g, '*');
    body = body.replace(/<\/em>/g, '*');
    body = body.replace(/<i[^>]*>/g, '*');
    body = body.replace(/<\/i>/g, '*');

    // 7. Handle Paragraphs - TAG REPLACEMENT
    body = body.replace(/<p[^>]*>/g, '');
    body = body.replace(/<\/p>/g, '\n\n');

    // 8. Clean up
    body = body
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/className="/g, 'class="')
        .replace(/\n{3,}/g, '\n\n'); // Max 2 newlines

    return body.trim();
}

async function migrate() {
    console.log('Starting migration...');

    // Get a user to assign as author
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found to assign as author. Please create a user first.');
        return;
    }

    for (const article of articles) {
        const slug = article.slug.replace('/blog/', '');
        const filename = slugToFilename[slug];

        if (!filename) {
            console.warn(`No filename found for slug: ${slug}`);
            continue;
        }

        const filePath = path.join(process.cwd(), 'src/components/blog/articles', filename);

        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const markdown = jsxToMarkdown(fileContent);

        console.log(`Migrating: ${article.title}`);

        await prisma.blogPost.upsert({
            where: { slug },
            update: {
                title: article.title,
                excerpt: article.description,
                content: markdown,
                published: true,
                keywords: article.tags.join(', '),
                createdAt: new Date(article.date),
            },
            create: {
                slug,
                title: article.title,
                excerpt: article.description,
                content: markdown,
                published: true,
                keywords: article.tags.join(', '),
                createdAt: new Date(article.date),
                authorId: user.id,
            },
        });
    }

    console.log('Migration complete!');
}

migrate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
