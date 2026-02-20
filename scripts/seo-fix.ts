import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seoData: Array<{
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
}> = [
        {
            slug: 'guia-sistema-avaliacao-univesp',
            metaTitle: 'Sistema de Avaliação UNIVESP: Como Funciona Sua Nota Final',
            metaDescription:
                'Entenda como a nota da UNIVESP é calculada: peso das atividades do AVA, prova presencial e exame. Guia completo com exemplos e calculadora.',
            keywords: 'sistema de avaliação univesp, calcular nota univesp, média univesp, como funciona a nota univesp, Acadêmico, Notas, Regulamento',
        },
        {
            slug: 'dicas-prova-presencial-univesp',
            metaTitle: '5 Dicas para a Prova Presencial da UNIVESP (60% da Nota)',
            metaDescription:
                'A prova presencial vale 60% da sua nota na UNIVESP. Veja 5 estratégias práticas para se preparar e garantir a aprovação no bimestre.',
            keywords: 'prova presencial univesp, o que cai na prova da univesp, como se preparar para prova univesp, Dicas, Provas, Estudos',
        },
        {
            slug: 'desvendando-projeto-integrador-univesp',
            metaTitle: 'Projeto Integrador UNIVESP (PI): O Que É e Como Tirar Nota Alta',
            metaDescription:
                'Guia completo do Projeto Integrador da UNIVESP. Entenda as etapas, o papel do tutor, como funciona a avaliação e garanta uma boa nota no PI.',
            keywords: 'projeto integrador univesp, pi univesp, como funciona o projeto integrador univesp, grupo de pi, Projeto Integrador, Trabalho em Grupo, Acadêmico',
        },
        {
            slug: 'aproveitamento-estudos-univesp',
            metaTitle: 'Aproveitamento de Estudos UNIVESP 2025/2026: Guia Completo',
            metaDescription:
                'Como solicitar aproveitamento de estudos na UNIVESP? Documentos necessários, critérios de análise, prazos e dicas para validar disciplinas anteriores.',
            keywords: 'aproveitamento de estudos univesp, aproveitamento de estudos univesp 2025, univesp aproveitamento de estudos, dispensar disciplina univesp, Aproveitamento, Disciplinas, Regulamento, Documentos',
        },
        {
            slug: 'disciplina-e-procrastinacao-univesp',
            metaTitle: 'Como Criar Disciplina e Vencer a Procrastinação no EAD da UNIVESP',
            metaDescription:
                'Guia prático com técnicas para criar uma rotina de estudos eficiente no EAD da UNIVESP e vencer a procrastinação de uma vez por todas.',
            keywords: 'como procrastinar menos, disciplina ead, como estudar univesp, rotina de estudos, Disciplina, EAD, Produtividade, Dicas',
        },
        {
            slug: 'guia-exame-recuperacao-univesp',
            metaTitle: 'Ficou de Exame na UNIVESP? Calcule a Nota e Monte seu Plano',
            metaDescription:
                'Tudo sobre o exame final da UNIVESP: como funciona, fórmula de cálculo da média e um plano de estudos passo a passo para garantir a aprovação.',
            keywords: 'exame univesp, exame univesp como funciona, ficou de exame na univesp, quanto preciso tirar no exame final, calculo exame, Exame, Recuperação, Provas, Notas, Acadêmico',
        },
        {
            slug: 'guia-ava-univesp',
            metaTitle: 'AVA UNIVESP: Como Usar e Dominar a Plataforma EAD (Guia 2026)',
            metaDescription:
                'Guia completo do AVA da UNIVESP. Aprenda a organizar seus estudos, nunca perder prazos e aproveitar todos os recursos da plataforma para passar em todas as disciplinas.',
            keywords: 'ava univesp, ava.univesp, ava univesp login, como usar ava univesp, AVA, EAD, Organização, Dicas, UNIVESP',
        },
        {
            slug: 'o-que-cai-na-prova-univesp',
            metaTitle: 'O Que Cai na Prova da UNIVESP? Guia para Estudar o que Importa',
            metaDescription:
                'Descubra o que realmente cai na prova presencial da UNIVESP. Use as atividades avaliativas do AVA como guia de estudos e estude de forma inteligente.',
            keywords: 'o que cai na prova da univesp, o que estudar para a prova univesp, prova univesp conteúdo, sistema de provas univesp, Provas, Dicas, Estudos, UNIVESP, Aprovação',
        },
        {
            slug: 'o-que-estudar-vestibular-univesp',
            metaTitle: 'Vestibular UNIVESP 2026: O Que Estudar em Cada Matéria',
            metaDescription:
                'Guia completo para o vestibular da UNIVESP. O que cai em Português, Matemática, Humanas e Ciências, e as melhores estratégias para garantir sua vaga.',
            keywords: 'vestibular univesp, o que estudar para o vestibular da univesp, vestibular univesp 2026, como se preparar vestibular univesp, Vestibular, Dicas, Estudos, UNIVESP, Aprovação',
        },
        {
            slug: 'guia-tcc-univesp-aprovacao',
            metaTitle: 'TCC UNIVESP: Do Tema à Aprovação na Banca — Guia Passo a Passo',
            metaDescription:
                'Como fazer o TCC na UNIVESP? Escolha do tema, normas ABNT, escrita, defesa e dicas para se sair bem na banca examinadora.',
            keywords: 'tcc univesp, tcc univesp como fazer, equivalencia tcc univesp, trabalho de conclusão de curso univesp, TCC, Monografia, UNIVESP, Aprovação, Dicas',
        },
        {
            slug: 'guia-estudo-exatas-univesp',
            metaTitle: 'Como Estudar Cálculo e Programação no EAD da UNIVESP — Guia',
            metaDescription:
                'Dificuldade com Cálculo, Física ou Programação na UNIVESP? Método de estudo ativo em 4 passos para vencer as exatas no EAD sem ser uma pessoa de exatas.',
            keywords: 'calcular nota univesp exatas, como estudar calculo univesp, programacao univesp, logica ead, Exatas, Cálculo, Programação, Dicas, Estudos',
        },
        {
            slug: 'guia-eixos-univesp-ciclo-basico',
            metaTitle: 'Eixos da UNIVESP: Computação, Licenciatura e Negócios — Guia',
            metaDescription:
                'Entenda os Eixos de Formação da UNIVESP. O que é o Ciclo Básico, quando você escolhe o curso definitivo e o que esperar de cada eixo.',
            keywords: 'eixos univesp, eixo de licenciatura, ciclo basico univesp, grade curricular univesp, cursos univesp, UNIVESP, Eixos, Ciclo Básico, Vestibular, Guia',
        },
        {
            slug: 'manual-nao-escrito-aluno-univesp',
            metaTitle: 'O Manual Não Escrito do Aluno UNIVESP: Além do AVA',
            metaDescription:
                'Tudo que ninguém te conta sobre estudar na UNIVESP: como usar grupos de WhatsApp, gerir o PI, o Drive da turma e ser um aluno estratégico.',
            keywords: 'manual do aluno univesp, dicas calouros univesp, univesp ead dicas, pi univesp grupo, UNIVESP, Dicas, Calouros, Comunidade, Guia',
        },
        {
            slug: 'segredos-ava-univesp-prazos-atividades-2026',
            metaTitle: 'AVA Univesp: Guia Definitivo para Organizar Prazos e Notas (2026)',
            metaDescription:
                'Domine o AVA da Univesp! Aprenda a sincronizar o calendário, evitar pegadinhas do sistema e calcular suas notas para passar sem DP.',
            keywords: 'AVA Univesp, Canvas Univesp, Prazos Univesp, novo ava univesp 2026, Como usar o AVA, Atividades Avaliativas, Univesp EAD, Calculadora Univesp',
        },
    ];

async function run() {
    console.log(`\n🚀 Iniciando SEO Fix — ${seoData.length} artigos\n`);

    let updated = 0;
    let notFound = 0;

    for (const item of seoData) {
        const post = await prisma.blogPost.findUnique({ where: { slug: item.slug } });

        if (!post) {
            console.warn(`⚠️  Não encontrado: ${item.slug}`);
            notFound++;
            continue;
        }

        await prisma.blogPost.update({
            where: { slug: item.slug },
            data: {
                published: true,
                metaTitle: item.metaTitle,
                metaDescription: item.metaDescription,
                keywords: item.keywords,
            },
        });

        console.log(`✅ ${item.slug}`);
        updated++;
    }

    console.log(`\n✔  Concluído: ${updated} artigos atualizados, ${notFound} não encontrados.\n`);
}

run()
    .catch((e) => {
        console.error('Erro ao executar o script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
