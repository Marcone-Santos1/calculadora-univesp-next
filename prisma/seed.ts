import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createQuestion } from '@/actions/question-actions';

// Carrega variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

// Configuração do R2 (Replicando a lógica do seu src/lib/r2.ts para o ambiente Node puro)
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

async function uploadToR2(base64String: string, fileName: string): Promise<string | null> {
    try {
        // Remove cabeçalho do base64 (data:image/png;base64,...)
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Caminho organizado no Bucket: questoes/2025/q1.png
        const key = `questoes/${fileName}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: 'image/png',
            // ACL: 'public-read', // R2 geralmente não precisa disso se o bucket for público ou tiver worker
        }));

        // Retorna a URL final
        return `${PUBLIC_URL}/${key}`;
    } catch (error) {
        console.error(`❌ Erro no upload R2 (${fileName}):`, error);
        return null;
    }
}

interface Question {
    number: number;
    title: string;
    statement: string;
    fullText: string;
    image: string;
    correctAnswer: string;
    alternatives: string[];
}

async function main() {
    const jsonPath = path.join(process.cwd(), 'questions_data_python.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ Arquivo questions_data_python.json não encontrado.');
        return;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const questions: Question[] = JSON.parse(rawData);

    console.log(`🚀 Iniciando ingestão de ${questions.length} questões com Upload para R2...`);

    for (const q of questions) {
        let finalMarkdown = q.statement;
        let imageUrl = null;

        // --- UPLOAD PARA R2 ---
        if (q.image && q.image.startsWith('data:image')) {
            const imageHash = crypto.randomUUID()
            
            // Nome do arquivo: univesp-q10-a1b2c3d4.png
            const fileName = `univesp-q${q.number}-${imageHash}.png`;
            console.log(`   ⬆️ Subindo imagem: ${fileName}...`);
            const uploadedUrl = await uploadToR2(q.image, fileName);

            if (uploadedUrl) {
                imageUrl = uploadedUrl;
                // --- A MÁGICA: INJEÇÃO NO MARKDOWN ---
                // Adiciona a imagem ao final do enunciado
                finalMarkdown += `\n\n![Figura da Questão ${q.number}](${uploadedUrl})`;
            }
        }

        const alternativesData = Object.entries(q.alternatives).map(([letter, text], index) => {
            const isCorrect = letter === q.correctAnswer?.toUpperCase();

            return {
                text: text,
                letter: letter,
                isCorrect: isCorrect
            };
        });


        await prisma.question.create({
            data: {
                title: q.title,
                text: finalMarkdown, // Conteúdo com a imagem Markdown
                subjectId: 'cmjnb2f840000dqghfmxnutev',
                userId: 'cmjot5p2u0000lkzn13r6asz4', // Associa ao Admin
                isVerified: true, // Já entra validada
                week: "Prova Vestibular 2025",
                alternatives: {
                    create: alternativesData
                }
            }
        });
    }

    console.log('✅ Todas as questões foram importadas e imagens estão no R2!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });