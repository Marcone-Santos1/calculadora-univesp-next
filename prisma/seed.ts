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
    const subjects = await Promise.all([
        prisma.subject.upsert({
            where: { name: 'Cálculo I' },
            update: {},
            create: { name: 'Cálculo I', color: 'bg-blue-500', icon: '📐' }
        }),
        prisma.subject.upsert({
            where: { name: 'Algoritmos e Programação' },
            update: {},
            create: { name: 'Algoritmos e Programação', color: 'bg-green-500', icon: '💻' }
        }),
        prisma.subject.upsert({
            where: { name: 'Física I' },
            update: {},
            create: { name: 'Física I', color: 'bg-red-500', icon: '⚛️' }
        }),
        prisma.subject.upsert({
            where: { name: 'Estruturas de Dados' },
            update: {},
            create: { name: 'Estruturas de Dados', color: 'bg-purple-500', icon: '🗂️' }
        }),
        prisma.subject.upsert({
            where: { name: 'Banco de Dados' },
            update: {},
            create: { name: 'Banco de Dados', color: 'bg-indigo-500', icon: '💾' }
        }),
        prisma.subject.upsert({
            where: { name: 'Algoritmos e Programação de Computadores II' },
            update: {},
            create: { name: 'Algoritmos e Programação de Computadores II', color: 'bg-teal-500', icon: '⚡' }
        })
    ]);

    console.log(`✅ Created ${subjects.length} subjects`)

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

    for (const questionData of sampleQuestions) {
        const subject = subjects.find(s => s.name === questionData.subjectName);
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
    - ${subjects.length} Subjects
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