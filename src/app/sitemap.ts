// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { articles } from '@/data/articles'; // Importamos os dados dos seus artigos

// Importe os dados das perguntas quando o recurso estiver pronto
// import { supabase } from '@/lib/supabaseClient'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    
    // 1. Defina sua URL base
    const baseUrl = 'https://univesp-calculadora.vercel.app';

    // 2. Páginas Estáticas
    // CORREÇÃO: Adicionamos o tipo 'MetadataRoute.Sitemap' ao array
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1, // Página principal tem prioridade máxima
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly', // O blog é atualizado com frequência
            priority: 0.9,
        },
        {
            url: `${baseUrl}/sobre`,
            lastModified: new Date(),
            changeFrequency: 'yearly', // Página "Sobre" raramente muda
            priority: 0.5,
        },
    ];

    // 3. Páginas Dinâmicas (Blog)
    // CORREÇÃO: Adicionamos o tipo 'MetadataRoute.Sitemap' ao resultado do .map()
    const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}${article.slug}`,
        lastModified: new Date(article.date), // Usamos a data do artigo
        changeFrequency: 'never', // Artigos, uma vez publicados, não mudam
        priority: 0.7,
    }));

    /*
    // 4. FUTURO: Páginas Dinâmicas (Perguntas da Comunidade)
    // Quando o recurso "Brainly" estiver no ar, basta descomentar e adaptar
    
    const { data: questions } = await supabase
        .from('questions')
        .select('slug, created_at'); // Buscamos os slugs e datas do Supabase
    
    // CORREÇÃO: Também precisaria do tipo explícito aqui
    const questionRoutes: MetadataRoute.Sitemap = questions?.map((question) => ({
        url: `${baseUrl}/perguntas/${question.slug}`,
        lastModified: new Date(question.created_at),
        changeFrequency: 'daily', // O conteúdo das perguntas pode mudar diariamente
        priority: 0.8,
    })) || [];
    */


    // 5. Combinamos tudo e retornamos
    // Agora o TypeScript entende que todos os itens do array estão corretos
    return [
        ...staticRoutes,
        ...blogRoutes,
        // ...questionRoutes, // Adicione as rotas das perguntas aqui quando estiverem prontas
    ];
}
