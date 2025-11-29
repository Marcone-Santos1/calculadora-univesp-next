import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper functions
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomBool = () => Math.random() > 0.5;
const getRandomDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - getRandomInt(0, daysAgo));
    return date;
};

const tailwindColors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 
    'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
];

const subjectIcons = [
    '📐', '💻', '⚛️', '📚', '🌍', '⚖️', '📊', '🧠', '🎨', 
    '🔧', '🔌', '📡', '💾', '🧬', '🏭', '📈', '🗣️', '📝'
];

const sampleUsers = [
    { name: 'João Silva', email: 'joao.silva@example.com', image: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Maria Santos', email: 'maria.santos@example.com', image: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Pedro Costa', email: 'pedro.costa@example.com', image: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Ana Paula', email: 'ana.paula@example.com', image: 'https://i.pravatar.cc/150?img=9' },
    { name: 'Carlos Mendes', email: 'carlos.mendes@example.com', image: 'https://i.pravatar.cc/150?img=7' },
];

const sampleQuestions = [
    {
        title: 'Como resolver integral por substituição?',
        text: 'Estou com dificuldade em entender quando e como aplicar o método de substituição em integrais. Alguém pode explicar com exemplos?',
        week: 'Semana 3',
        subjectName: 'Cálculo I',
        alternatives: [
            'Substituição só funciona em integrais definidas',
            'Deve-se escolher u como a função mais complexa',
            'Substituir a variável por uma função que simplifica a integral',
            'A substituição é usada apenas para polinômios',
            'Não existe método de substituição em cálculo'
        ],
        correctIndex: 2
    },
    {
        title: 'Diferença entre Array e List em Python',
        text: 'Qual a principal diferença entre arrays e listas em Python? Quando devo usar cada um?',
        week: 'Semana 2',
        subjectName: 'Algoritmos e Programação',
        alternatives: [
            'Não há diferença, são sinônimos',
            'Arrays são mais rápidos para operações matemáticas, listas são mais flexíveis',
            'Listas não podem conter strings',
            'Arrays são imutáveis',
            'Listas só armazenam números'
        ],
        correctIndex: 1
    },
    {
        title: 'Lei de Newton: força e aceleração',
        text: 'Um objeto de 5kg está sendo puxado com uma força de 20N. Qual é a aceleração resultante? F = m × a',
        week: 'Semana 4',
        subjectName: 'Física I',
        alternatives: [
            '2 m/s²',
            '3 m/s²',
            '4 m/s²',
            '5 m/s²',
            '10 m/s²'
        ],
        correctIndex: 2
    },
    {
        title: 'Estrutura de Dados: Pilha vs Fila',
        text: 'Preciso entender melhor a diferença entre pilhas (stack) e filas (queue). Qual a principal característica de cada uma?',
        week: 'Semana 5',
        subjectName: 'Estruturas de Dados',
        alternatives: [
            'Pilha é LIFO, Fila é FIFO',
            'Pilha é FIFO, Fila é LIFO',
            'Ambas são LIFO',
            'Ambas são FIFO',
            'Não há diferença'
        ],
        correctIndex: 0
    },
    {
        title: 'SQL: JOIN vs UNION',
        text: 'Qual a diferença fundamental entre JOIN e UNION em SQL? Quando usar cada um?',
        week: 'Semana 6',
        subjectName: 'Banco de Dados',
        alternatives: [
            'JOIN combina colunas, UNION combina linhas',
            'JOIN combina linhas, UNION combina colunas',
            'São exatamente iguais',
            'UNION é mais rápido que JOIN',
            'JOIN só funciona com 2 tabelas'
        ],
        correctIndex: 0
    },
    {
        title: 'O que é Memoization?',
        text: 'Estou estudando otimização de algoritmos e encontrei o termo memoization. Como funciona essa técnica?',
        week: 'Semana 7',
        subjectName: 'Algoritmos e Programação de Computadores II',
        alternatives: [
            'É um tipo de banco de dados',
            'Técnica que armazena resultados de funções para evitar recálculos',
            'Um padrão de design de software',
            'Método para compressão de dados',
            'Sistema de gerenciamento de memória'
        ],
        correctIndex: 1
    }
];

const sampleComments = [
    'Muito boa essa questão! Me ajudou bastante.',
    'Alguém pode explicar melhor a alternativa C?',
    'Achei confusa essa questão, poderia ser mais clara.',
    'Excelente! Exatamente o que eu precisava estudar.',
    'Tem certeza que a resposta correta é essa? Acho que tem um erro.',
    'Obrigado por compartilhar! Salvou minha prova.',
    'Essa matéria é muito difícil 😅',
    'Consegui entender agora, obrigado!',
    'Alguém tem mais questões sobre esse tema?',
    'Professor explicou de forma diferente na aula...'
];

async function main() {
    console.log('🌱 Seeding database...')

    // 1. Create Subjects
    console.log('📚 Creating subjects...')
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

    console.log(`✅ Created ${rawSubjects.length} subjects`)

    // 2. Create Users
    console.log('👥 Creating users...')
    const users = await Promise.all(
        sampleUsers.map(userData =>
            prisma.user.upsert({
                where: { email: userData.email },
                update: {},
                create: userData
            })
        )
    );

    console.log(`✅ Created ${users.length} users`)

    // 3. Create Questions with Alternatives
    console.log('❓ Creating questions and alternatives...')
    const questions = [];

    const allSubjects = await prisma.subject.findMany();

    for (const questionData of sampleQuestions) {
        const subject = allSubjects.find(s => s.name.toLowerCase() === questionData.subjectName.toLowerCase());
        const user = getRandom(users);

        if (!subject) continue;

        const question = await prisma.question.create({
            data: {
                title: questionData.title,
                text: questionData.text,
                week: questionData.week,
                userId: user.id,
                subjectId: subject.id,
                isVerified: getRandomBool(),
                verificationRequested: getRandomBool(),
                createdAt: getRandomDate(30),
                alternatives: {
                    create: questionData.alternatives.map((text, index) => ({
                        letter: String.fromCharCode(65 + index), // A, B, C, D, E
                        text: text,
                        isCorrect: index === questionData.correctIndex
                    }))
                }
            },
            include: {
                alternatives: true
            }
        });

        questions.push(question);
        console.log(`✅ Created question: ${question.title}`)
    }

    // 4. Create Comments
    console.log('💬 Creating comments...')
    let commentCount = 0;

    for (const question of questions) {
        const numComments = getRandomInt(0, 5);

        for (let i = 0; i < numComments; i++) {
            const user = getRandom(users);
            const comment = await prisma.comment.create({
                data: {
                    text: getRandom(sampleComments),
                    userId: user.id,
                    questionId: question.id,
                    createdAt: getRandomDate(25)
                }
            });

            // Sometimes add replies
            if (getRandomBool() && i === 0) {
                const replyUser = getRandom(users.filter(u => u.id !== user.id));
                await prisma.comment.create({
                    data: {
                        text: 'Concordo! ' + getRandom(['👍', '💯', '✨']),
                        userId: replyUser.id,
                        questionId: question.id,
                        parentId: comment.id,
                        createdAt: getRandomDate(20)
                    }
                });
                commentCount++;
            }

            commentCount++;
        }
    }

    console.log(`✅ Created ${commentCount} comments`)

    // 5. Create Votes
    console.log('🗳️ Creating votes...')
    let voteCount = 0;

    for (const question of questions) {
        const numVotes = getRandomInt(0, users.length);
        const votingUsers = users.slice(0, numVotes);

        for (const user of votingUsers) {
            const alternative = getRandom(question.alternatives);

            await prisma.vote.create({
                data: {
                    userId: user.id,
                    alternativeId: alternative.id
                }
            });

            voteCount++;
        }
    }

    console.log(`✅ Created ${voteCount} votes`)

    console.log('✨ Seeding completed successfully!')
    console.log(`
    Summary:
    - ${rawSubjects.length} Subjects
    - ${users.length} Users  
    - ${questions.length} Questions
    - ${commentCount} Comments
    - ${voteCount} Votes
    `)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })