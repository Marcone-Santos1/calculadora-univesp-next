import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const prisma = new PrismaClient();

// --- CONFIGURAÇÃO R2 (Manter igual) ---
const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// ID do Usuário Admin (Você deve garantir que esse ID existe no banco)
const ADMIN_USER_ID = 'cmjafwpuq0003ah7yuokrrfsp';

async function uploadToR2(base64String: string, fileName: string): Promise<string | null> {
    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const key = `questoes/${fileName}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: 'image/png',
        }));
        return `${PUBLIC_URL}/${key}`;
    } catch (error) {
        console.error(`❌ Erro no upload R2 (${fileName}):`, error);
        return null;
    }
}

// Interfaces compatíveis com o SEU JSON atual
interface QuestionMetadata {
    subject: string;
    week: string;
}

interface QuestionData {
    number: number;
    title: string;
    statement: string;
    alternatives: Record<string, string>;
    correctAnswer: string;
    images: string[];
    feedback?: string;
    metadata: QuestionMetadata;
}

interface ExamFile {
    source_file: string;
    questions: QuestionData[];
}

async function getOrCreateSubject(subjectName: string) {
    if (!subjectName) return null;

    // Tenta achar
    const subject = await prisma.subject.findFirst({
        where: { name: { equals: subjectName } }
    });

    if (subject) return subject.id;

    // Se não achar, cria
    console.log(`   ✨ Criando nova matéria: ${subjectName}`);
    const newSubject = await prisma.subject.create({
        data: {
            name: subjectName,
        }
    });
    return newSubject.id;
}

async function main() {
    const jsonPath = path.join(process.cwd(), 'questions_data_python.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ Arquivo questions_data_python.json não encontrado.');
        return;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const exams: ExamFile[] = JSON.parse(rawData);

    console.log(`🚀 Iniciando ingestão de ${exams.length} arquivos de prova...`);

    for (const exam of exams) {
        console.log(`\n📂 Processando: ${exam.source_file}`);

        for (const q of exam.questions) {

            // 1. Resolve a Matéria (Subject)
            const subjectName = q.metadata?.subject || "Geral";
            const subjectId = await getOrCreateSubject(subjectName);

            console.log(`   ✨ Matéria: ${subjectName} -> ID: ${subjectId}`);

            if (!subjectId) {
                console.error(`   ❌ Erro ao vincular matéria para Q${q.number}. Pulando.`);
                continue;
            }

            let finalMarkdown = q.statement;

            // 2. Processa Imagens
            // O JSON tem um array de imagens. Se forem base64, sobe pro R2. 
            // Se forem links do AVA, apenas anexa (mas cuidado, links do AVA expiram!)
            if (q.images && q.images.length > 0) {
                for (const [idx, img] of q.images.entries()) {
                    let imageUrl = img;

                    console.log(`   ⬆️ Subindo imagem: ${img}...`);


                    if (img.startsWith('data:image')) {
                        const hash = crypto.randomUUID().split('-')[0];
                        const fileName = `univesp-${subjectName.slice(0, 3)}-q${q.number}-${hash}.png`;
                        const uploaded = await uploadToR2(img, fileName);
                        if (uploaded) imageUrl = uploaded;
                    }

                    // Adiciona a imagem ao Markdown
                    finalMarkdown += `\n\n![${q.title}](${imageUrl})`;
                }
            }
            // 3. Prepara Alternativas
            const alternativesData = Object.entries(q.alternatives).map(([letter, text]) => ({
                text: text,
                letter: letter,
                isCorrect: letter === q.correctAnswer
            }));

            // 4. UPSERT (Verifica se já existe para não duplicar)
            // Critério de unicidade: Texto do enunciado (primeiros 50 chars) + Matéria
            const existingQuestion = await prisma.question.findFirst({
                where: {
                    OR: [
                        {
                            title: {
                                equals: q.title.trim()
                            }
                        },
                        {
                            text: {
                                equals: q.statement.trim()
                            }
                        }
                    ]
                },
                select: { id: true, title: true } // Otimização: selecionar apenas o necessário
            });



            if (existingQuestion) {
                process.stdout.write('.'); // Apenas um ponto para não poluir o log
                // Opcional: Atualizar se necessário
                // await prisma.question.update(...)
            } else {
                await prisma.question.create({
                    data: {
                        title: q.title || `Questão ${q.number} - ${subjectName}`,
                        text: finalMarkdown,
                        subjectId: subjectId,
                        userId: ADMIN_USER_ID,
                        isVerified: true,
                        week: q.metadata?.week || "Prova Regular",
                        alternatives: {
                            create: alternativesData
                        },
                        comments: {
                            create: {
                                text: q.feedback || '',
                                userId: ADMIN_USER_ID
                            }
                        }
                    }
                });

                process.stdout.write('+'); // + indica criada
            }
        }
    }

    console.log('\n\n✅ Todas as questões foram processadas!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });