import { ImageResponse } from 'next/og';
import { getQuestion } from '@/actions/question-actions'; // Sua action

export const runtime = 'nodejs';
export const revalidate = 604800; // 7 dias
export const alt = 'Questão Univesp';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    try {
    const question = await getQuestion(params.id);
    const title = question?.title || 'Questão Univesp';
    const subject = question?.subjectName || 'Geral';

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 48,
                    background: 'linear-gradient(to bottom right, #1e3a8a, #3b82f6)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
                    {subject}
                </div>
                <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {title.substring(0, 80)}{title.length > 80 ? '...' : ''}
                </div>
                <div style={{ marginTop: 40, background: 'white', color: '#1e3a8a', padding: '10px 30px', borderRadius: 50, fontSize: 24, fontWeight: 'bold' }}>
                    Ver Resposta e Gabarito
                </div>
            </div>
        ),
        { ...size }
    );
} catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 48,
                    background: 'linear-gradient(to bottom right, #1e3a8a, #3b82f6)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: 24, opacity: 0.8, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
                    Questão Univesp
                </div>
                <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Erro ao gerar imagem
                </div>
            </div>
        ),
        { ...size }
    );
}