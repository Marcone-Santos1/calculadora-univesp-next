import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados Iniciais
const SUBJECTS = [
    { name: 'Matemática Básica', icon: 'fa-calculator', color: '#3B82F6' },
    { name: 'Física I', icon: 'fa-bolt', color: '#EAB308' },
    { name: 'Algoritmos e Programação', icon: 'fa-code', color: '#10B981' },
    { name: 'Cálculo I', icon: 'fa-square-root-alt', color: '#8B5CF6' },
    { name: 'Geometria Analítica', icon: 'fa-shapes', color: '#EC4899' },
    { name: 'Probabilidade e Estatística', icon: 'fa-chart-bar', color: '#14B8A6' },
    { name: 'Estrutura de Dados', icon: 'fa-database', color: '#F97316' },
    { name: 'Engenharia de Software', icon: 'fa-laptop-code', color: '#6366F1' },
    { name: 'Arquitetura de Computadores', icon: 'fa-microchip', color: '#64748B' },
    { name: 'Sistemas Operacionais', icon: 'fa-server', color: '#EF4444' },
];

const USERS = [
    { name: 'João Silva', email: 'joao.silva@exemplo.com', reputation: 150 },
    { name: 'Maria Souza', email: 'maria.souza@exemplo.com', reputation: 320 },
    { name: 'Carlos Santos', email: 'carlos.santos@exemplo.com', reputation: 1200 },
    { name: 'Ana Costa', email: 'ana.costa@exemplo.com', reputation: 45 },
    { name: 'Admin Pedro', email: 'admin@univesp.br', reputation: 5000, isAdmin: true },
    { name: 'Gabriel Oliveira', email: 'gabriel.oli@exemplo.com', reputation: 80 },
    { name: 'Fernanda Lima', email: 'fernanda.lima@exemplo.com', reputation: 250 },
    { name: 'Lucas Pereira', email: 'lucas.p@exemplo.com', reputation: 410 },
];

const QUESTIONS_TEMPLATES = [
    {
        title: 'Qual a diferença entre uma variável local e global?',
        text: 'Estou com dúvidas sobre o escopo de variáveis em C. Alguém pode me explicar a diferença prática e quando devo usar cada uma?',
    },
    {
        title: 'Como calcular o limite de (sin x / x) quando x tende a 0?',
        text: 'Sei que dá 1, mas qual é a prova formal disso usando L Hôpital ou geometria?',
    },
    {
        title: 'O que são ponteiros em C?',
        text: 'Não consigo entender para que servem os ponteiros. Qual a utilidade real de armazenar o endereço de memória de outra variável?',
    },
    {
        title: 'Qual a complexidade do algoritmo QuickSort?',
        text: 'Na teoria dizem que é O(n log n), mas no pior caso pode ser O(n^2). Alguém tem um exemplo prático desse pior caso?',
    },
    {
        title: 'Como aplicar a Segunda Lei de Newton em polias?',
        text: 'Temos dois blocos de 5kg e 10kg ligados por um fio passando por uma roldana ideal. Como encontro a aceleração do sistema?',
    },
    {
        title: 'Diferença entre Processos e Threads',
        text: 'Lendo sobre Sistemas Operacionais, me deparei com Processos e Threads. Qual a diferença de consumo de memória entre eles?',
    },
    {
        title: 'Como normalizar um banco de dados até a 3FN?',
        text: 'Estou montando um MER para um sistema de biblioteca. Quais são as regras claras para passar da 1FN para a 2FN e depois 3FN?',
    },
    {
        title: 'O que é Arquitetura de Von Neumann?',
        text: 'Estou estudando Organização de Computadores e me deparei com esse termo. O que a diferencia de outras arquiteturas?',
    },
    {
        title: 'Entendendo a fórmula de Bhaskara',
        text: 'Por que o delta tem que ser maior que zero para termos duas raízes reais? Alguém pode demonstrar?',
    },
    {
        title: 'Por que o uso de "goto" é desencorajado?',
        text: 'Em linguagens mais antigas usava-se muito o goto. Hoje em dia ouço que é uma péssima prática. Por quê?',
    }
];

const COMMENTS_TEMPLATES = [
    'Excelente pergunta! Também estava com essa dúvida.',
    'Acredito que a resposta certa seja a C, pois faz sentido com a fórmula.',
    'Poderia explicar melhor a sua dúvida?',
    'No meu caso, eu resolvi usando a fórmula de Bhaskara. Deu certo.',
    'O material da semana 3 do AVA aborda exatamente esse ponto.',
    'Sempre caio em pegadinhas desse tipo nas provas...',
    'Alguém sabe se isso vai cair na sub?',
    'Muito bom! Resolveu meu problema na hora do estudo.',
    'A dica de ouro é sempre ler o enunciado com cuidado.',
    'Eu vi uma resolução parecida no YouTube, ajudou bastante.'
];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled: T[] = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function main() {
    console.log('🌱 Iniciando limpeza e semeadura do banco de dados...');

    // Limpeza (CUIDADO! Isso apaga dados em cascata se configurado, ou precisa na ordem certa)
    console.log('Limpando dados antigos...');
    await prisma.comment.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.alternative.deleteMany();
    await prisma.question.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.advertiserProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Banco limpo.');

    // 1. Criar Usuários
    console.log('Cuidando de Usuários...');
    const createdUsers = [];
    for (const u of USERS) {
        const user = await prisma.user.create({
            data: {
                name: u.name,
                email: u.email,
                reputation: u.reputation,
                isAdmin: u.isAdmin || false,
                emailVerified: new Date(),
            }
        });
        createdUsers.push(user);
    }
    const adminUser = createdUsers.find(u => u.isAdmin);

    // 2. Criar Matérias
    console.log('Cuidando de Matérias...');
    const createdSubjects = [];
    for (const sub of SUBJECTS) {
        const subject = await prisma.subject.create({
            data: {
                name: sub.name,
                icon: sub.icon,
                color: sub.color,
            }
        });
        createdSubjects.push(subject);
    }

    // 3. Criar Questões (30 questoes aleatórias)
    console.log('Cuidando de Questões e Alternativas...');
    const createdQuestions = [];
    for (let i = 0; i < 30; i++) {
        const template = getRandomItem(QUESTIONS_TEMPLATES);
        const subject = getRandomItem(createdSubjects);
        const author = getRandomItem(createdUsers);
        const isVerified = Math.random() > 0.3; // 70% chance de ser verificada

        // Randomizar alternativas (A até E)
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const correctIndex = Math.floor(Math.random() * 5);
        const alternativesData = letters.map((letter, index) => ({
            letter,
            text: `Resposta provável para a alternativa ${letter}...`,
            isCorrect: index === correctIndex,
        }));

        const question = await prisma.question.create({
            data: {
                title: `${template.title} (Exemplo ${i + 1})`,
                text: `${template.text}\n\n*Gerado automaticamente para testes. Modifique conforme precisar.*`,
                userId: author.id,
                subjectId: subject.id,
                views: Math.floor(Math.random() * 500),
                isVerified: isVerified,
                week: `Semana ${Math.floor(Math.random() * 6) + 1}`,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Datas aleatórias no passado
                alternatives: {
                    create: alternativesData
                }
            },
            include: { alternatives: true }
        });
        createdQuestions.push(question);
    }

    // 4. Criar Comentários e Votos
    console.log('Cuidando de Votos e Comentários...');
    let commentCount = 0;
    let voteCount = 0;

    for (const q of createdQuestions) {
        // Criar de 0 a 5 comentários por questão
        const numComments = Math.floor(Math.random() * 6);
        for (let j = 0; j < numComments; j++) {
            const commenter = getRandomItem(createdUsers);
            await prisma.comment.create({
                data: {
                    text: getRandomItem(COMMENTS_TEMPLATES),
                    userId: commenter.id,
                    questionId: q.id,
                    createdAt: new Date(q.createdAt.getTime() + Math.random() * 100000000), // Comentário criado após a questão
                }
            });
            commentCount++;
        }

        // Distribuir de 0 a 20 votos nas alternativas dessa questão
        const numVotes = Math.floor(Math.random() * 21);
        const voters = getRandomItems(createdUsers, Math.min(numVotes, createdUsers.length)); // Um voto por usuário

        for (const voter of voters) {
            // Escolhe uma alternativa para votar (maiorship na correta ou aleatório)
            const chosenAlt = Math.random() > 0.4
                ? q.alternatives.find(a => a.isCorrect) || q.alternatives[0]
                : getRandomItem(q.alternatives);

            await prisma.vote.create({
                data: {
                    userId: voter.id,
                    alternativeId: chosenAlt.id,
                }
            });
            voteCount++;
        }
    }

    // 5. Perfil de Anunciante (Advertiser Profile)
    console.log('Criando Perfis de Anunciante e Campanhas Falsas...');
    if (adminUser) {
        const advertiser = await prisma.advertiserProfile.create({
            data: {
                userId: adminUser.id,
                balance: 50000, // 500 reais
            }
        });

        // Criar uma Campanha Global
        await prisma.adCampaign.create({
            data: {
                advertiserId: advertiser.id,
                title: 'Campanha Cursos Univesp',
                status: 'ACTIVE',
                dailyBudget: 5000,
                costValue: 10,
                billingType: 'CPC',
                startDate: new Date(),
                creatives: {
                    create: {
                        headline: 'Aproveite nossos cursos extras!',
                        description: 'Turbine suas horas complementares e seu currículo com nossos pacotes de TI e Administração.',
                        destinationUrl: 'https://exemplo.com',
                        imageUrl: null,
                    }
                }
            }
        });

        // Criar uma Campanha Contextual para Matemática
        const mathSubject = createdSubjects.find(s => s.name === 'Matemática Básica');
        if (mathSubject) {
            await prisma.adCampaign.create({
                data: {
                    advertiserId: advertiser.id,
                    title: 'Calculadoras FX991-EX Promocional',
                    status: 'ACTIVE',
                    dailyBudget: 2000,
                    costValue: 50,
                    billingType: 'CPM',
                    targetSubjects: {
                        connect: [{ id: mathSubject.id }]
                    },
                    startDate: new Date(),
                    creatives: {
                        create: {
                            headline: 'Calculadora Científica com 50% OFF',
                            description: 'Chega de sofrer em Cálculo e Matemática Básica. Frete grátis usando o cupom UNIVESP50.',
                            destinationUrl: 'https://exemplo.com/promo',
                            imageUrl: null,
                        }
                    }
                }
            });
        }
    }

    console.log(`\n🎉 SEED CONCLUÍDO COM SUCESSO!`);
    console.log(`- ${createdUsers.length} Usuários`);
    console.log(`- ${createdSubjects.length} Matérias`);
    console.log(`- ${createdQuestions.length} Questões`);
    console.log(`- ${commentCount} Comentários`);
    console.log(`- ${voteCount} Votos distribuídos`);
}

main()
    .catch((e) => {
        console.error('Erro na execução do seed: ', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });