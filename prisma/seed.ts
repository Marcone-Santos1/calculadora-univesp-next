import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função auxiliar para pegar item aleatório de um array
const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const tailwindColors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 
    'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
];

const subjectIcons = [
    '📐', '💻', '⚛️', '📚', '🌍', '⚖️', '📊', '🧠', '🎨', 
    '🔧', '🔌', '📡', '💾', '🧬', '🏭', '📈', '🗣️', '📝'
];

async function main() {
    console.log('🌱 Seeding database...')

    const rawSubjects = [
        // Matérias Originais
        'Cálculo I',
        'Algoritmos e Programação',
        'Física I',
        'Português',
        'Inglês',
        'Ética e Cidadania',
        
        // Matérias extraídas dos PDFs (Gestão e Negócios)
        'Administração I',
        'Administração II',
        'Gestão da Inovação e Desenvolvimento de Produtos',
        'Estudos Organizacionais',
        'Comportamento Humano nas Organizações',
        'Gestão Contábil',
        'Estatística aplicada aos negócios',
        'Gestão de Pessoas',
        'Indicadores de desempenho para a tomada de decisão',
        'Empreendedorismo e Inovação',
        'Técnicas de negociação e resolução de conflitos',
        'Digital Workplace e tendências em RH',
        'Legislação e Responsabilidade Profissional',
        'Estratégia e Governança',
        'Gestão da Produção e Operações',
        'Conceitos e práticas de marketing',
        'Estratégias Financeiras',
        'Aprendizagem e gestão do conhecimento',
        'Análise e modelagem de processos',
        'Marketing Digital',
        'Gestão de Projetos',
        'Cidades Inteligentes',
        'Planejamento e ferramentas de gestão estratégica',
        'Organizações digitais e modelos de negócios',
        'Ferramentas de Análise e Business Intelligence',
        'Gestão da Cadeia de Suprimentos',
        'Estudos Organizacionais Avançados',
        'Política Pública e Gestão Social',
        'Gestão Ambiental',
        'Gestão do Conhecimento',
        'Gestão de Contratos',
        'Gestão de Custos',
        'Gestão Financeira e de Riscos',
        'Gestão da Informação',
        'Logística',
        'Gerenciamento de Projetos',
        'Gestão da Qualidade',
        'Gestão de Recursos Humanos',
        'Gestão da Tecnologia e da Inovação',
        
        // Computação e Tecnologia
        'Pensamento Computacional',
        'Algoritmos e Programação de Computadores I',
        'Algoritmos e Programação de Computadores II',
        'Fundamentos de Internet e Web',
        'Introdução a Conceitos de Computação',
        'Fundamentos Matemáticos para Computação',
        'Estruturas de Dados',
        'Formação Profissional em Computação',
        'Sistemas Computacionais',
        'Programação Orientada a Objetos',
        'Banco de Dados',
        'Infraestrutura para Sistemas de Software',
        'Desenho Técnico Assistido por Computador',
        'Desenvolvimento Web',
        'Interface Humano-Computador',
        'Aplicações em Aprendizado de Máquina',
        'Introdução a Ciência de Dados',
        'Mineração de Dados',
        'Sistemas Embarcados',
        'Protocolos de Comunicação IoT',
        'Engenharia de Software',
        'Visualização Computacional',
        'Aprendizado de Máquinas',
        'Plataforma de Ingestão e Análise de Dados',
        'Segurança da Informação',
        'Desenvolvimento para Dispositivos Móveis',
        'Computação Escalável',
        'Planejamento Estratégico de Negócios',
        'Gerência e Qualidade de Software',
        'Impactos da Computação na Sociedade',
        'Redes Neurais',
        'Aprendizado Profundo',
        'Visão Computacional',
        'Projeto e Análise de Algoritmos',
        'Processamento de Linguagem Natural',
        'Controle e Automação',
        'Processamento Digital de Sinais',
        'Compiladores',
        'Metodologias ágeis',
        'Gestão de Sistemas de Informação',
        'Linguagens e Compiladores',
        'Fundamentos Matemáticos da Computação',
        'Modelos Probabilísticos para Computação',
        'Modelagem e Simulação',
        'Sistemas Operacionais',
        'Projeto Digital',
        'Computação Gráfica',
        'Projeto e Programação de Jogos',
        'Organização de Computadores',
        'Tecnologias de Comunicação de Dados',
        'Redes de Computadores',
        'Projeto de Sistemas Computacionais',
        'Sistemas Distribuídos',
        
        // Engenharia e Produção
        'Ciência do Ambiente',
        'Ergonomia',
        'Higiene e Segurança do Trabalho I',
        'Higiene e Segurança do Trabalho II',
        'Ciências do Ambiente',
        'Empreendedorismo',
        'Economia I',
        'Economia II',
        'Jogos de Empresa',
        'Negócios Online',
        'Propriedade Intelectual',
        'Expressão Gráfica',
        'Direito para Eng. de Computação',
        'Direito para Eng. de Produção',
        'Direito',
        'Noções básicas de direito público e privado',
        'Planejamento Tributário',
        'Teoria Econômica e Economia Digital',
        'Circuitos Elétricos',
        'Circuitos Lógicos',
        'Eletrônica Digital',
        'Microeletrônica',
        'Multimídia e Hipermídia',
        'Engenharia de Informação',
        'Inteligência Artificial',
        'Introdução aos Sistemas de Comunicação',
        'Eletrônica Aplicada',
        'Eletrônica Embarcada',
        'Circuitos Digitais',
        'Ciência dos Materiais',
        'Resistência dos Materiais',
        'Automação Industrial',
        'Engenharia Econômica',
        'Engenharia Econômica e Financeira',
        'Estratégia e Planejamento de Empresas',
        'Engenharia de Métodos',
        'Pesquisa Operacional I',
        'Pesquisa Operacional II',
        'Organização Industrial',
        'Organização do Trabalho',
        'Processos Industriais e Fabricação',
        'Sistemas de Produção',
        'Planejamento e Controle de Produção I',
        'Planejamento e Controle de Produção II',
        'Controle Estatístico de Processo',
        'Planejamento de Instalações',
        'Instalações Industriais',
        'Projeto e Desenvolvimento do Produto',
        'Sistemas de Manutenção',
        'Confiabilidade',
        'Materiais e Processos de Fabricação',
        'Introdução à Engenharia de Produção',
        'Logística e Distribuição',
        'Indústria 4.0',
        'Engenharia da Sustentabilidade',
        'Ergonomia, Saúde e Higiene do Trabalho',
        
        // Licenciaturas e Educação
        'Letramento em LIBRAS para professores',
        'Educação mediada por tecnologias',
        'Metodologia e Desenvolvimento de Materiais Didáticos',
        'Educação Especial e Inclusiva',
        'Educação Especial e LIBRAS',
        'Educação, corpo e arte',
        'Filosofia da Educação',
        'Sociologia da Educação',
        'Projetos e métodos para a produção do conhecimento',
        'Leitura e Produção de textos',
        'Gramática de Língua Portuguesa I',
        'Introdução à Linguística',
        'Teoria da Literatura',
        'Laboratório de Produção Textual',
        'Introdução à Fonética e à Fonologia',
        'Literatura e Cultura Brasileira',
        'Gramática de Língua Portuguesa II',
        'Estudos de Literatura em Língua Portuguesa',
        'Gêneros Narrativos na Literatura Brasileira',
        'Ensino e Aprendizagem de Língua e Literatura',
        'Literatura infanto juvenil',
        'Texto, Discurso e Ensino de Língua',
        'Aquisição da Linguagem: oralidade e escrita',
        'Semântica',
        'Aquisição da Língua Escrita',
        'Variação e Mudança Linguística',
        
        // Matemática e Ciências Básicas
        'Elementos de Álgebra',
        'Álgebra Linear',
        'Matemática Financeira',
        'Fundamentos da Matemática Elementar',
        'Geometria Analítica',
        'Geometria Euclidiana Plana',
        'Didática da Matemática',
        'Cálculo II',
        'Cálculo III',
        'Cálculo IV',
        'Cálculo Numérico',
        'Lógica e Matemática Discreta',
        'Mecânica dos Sólidos e dos Fluidos',
        'Estatística',
        'Geometria Plana e Desenho Geométrico',
        'Geometria Espacial',
        'História da Matemática',
        'Matemática Básica',
        'Métodos Numéricos',
        'Física Geral',
        'Fenômenos de Transporte',
        'Física do Movimento',
        'Mecânica',
        'Química',
        'Química Tecnológica e Ambiental'
    ];

    // Remove duplicatas (usando Set) e cria objetos
    const uniqueSubjects = [...new Set(rawSubjects)];

    console.log(`📝 Processing ${uniqueSubjects.length} unique subjects...`);

    for (const name of uniqueSubjects) {
        // Atribui cor e ícone aleatórios se não for um dos hardcoded originais
        const subjectData = {
            name: name,
            color: getRandom(tailwindColors),
            icon: getRandom(subjectIcons)
        };

        // Mantém as cores originais se o nome coincidir (opcional, para consistência)
        if (name === 'Cálculo I') { subjectData.color = 'bg-blue-500'; subjectData.icon = '📐'; }
        if (name === 'Algoritmos e Programação') { subjectData.color = 'bg-green-500'; subjectData.icon = '💻'; }
        
        await prisma.subject.upsert({
            where: { name: subjectData.name },
            update: {}, // Não sobrescreve se já existir
            create: subjectData,
        })
        console.log(`✅ Created/Checked subject: ${subjectData.name}`)
    }

    console.log('✨ Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })