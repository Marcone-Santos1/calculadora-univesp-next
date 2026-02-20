import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SLUG = 'calendario-univesp-2026';

const CONTENT = `
O **Calendário Acadêmico** é o seu mapa de sobrevivência na UNIVESP. Nele estão todas as datas que definem o ritmo do seu semestre: períodos de provas, prazos de atividades, abertura de rematrícula, datas de exame final e muito mais.

Perder uma dessas datas pode custar pontos preciosos na média — ou até uma reprovação. Por isso, criamos este guia com as informações mais importantes do calendário 2026 e, acima de tudo, como colocar tudo isso no seu celular para nunca ser pego de surpresa.

> **Importante:** O calendário oficial é divulgado e atualizado pela UNIVESP no site oficial e no AVA. As datas abaixo são referências gerais — confirme sempre no AVA do seu curso antes de tomar qualquer decisão acadêmica.

## O Que Está no Calendário Acadêmico da UNIVESP?

O calendário acadêmico reúne as principais datas do ano letivo, organizadas por semestre. De maneira geral, você vai encontrar:

- **Início e fim de cada bimestre:** quando começa e termina o conteúdo de cada período avaliativo.
- **Período de Provas Regulares:** as datas das avaliações presenciais (ou online, dependendo do semestre).
- **Período de Exames Finais:** para quem ficou com média abaixo de 5,0 e precisa fazer a recuperação.
- **Prazos de Atividades do AVA:** as atividades avaliativas semanais têm prazo fixo — geralmente segunda-feira às 23h59.
- **Período de Rematrícula:** quando você confirma sua matrícula para o semestre seguinte.
- **Feriados e Recessos:** dias em que o sistema pode ter limitações de suporte.
- **Datas do Projeto Integrador (PI):** entregas parciais e entrega final do PI de cada bimestre.
- **Abertura de Aproveitamento de Estudos:** janelas para quem quer solicitar dispensa de disciplinas.

## Estrutura do Ano Letivo UNIVESP 2026

A UNIVESP organiza o ano letivo em **dois semestres**, cada um composto por **dois bimestres**. Isso significa que, ao longo do ano, você vai enfrentar:

- **4 Provas Regulares** (uma por bimestre, por disciplina)
- **4 possibilidades de Exame Final** (caso fique abaixo de 5,0 em algum bimestre)
- **Múltiplos Projetos Integradores** ao longo dos semestres

### Primeiro Semestre — 1º e 2º Bimestres

O primeiro semestre costuma começar em **fevereiro** e se estende até meados de **julho**, com os seguintes marcos típicos:

| Evento | Período Estimado |
|--------|-----------------|
| Início das Aulas | Fevereiro |
| Encerramento do 1º Bimestre | Abril |
| Provas Regulares (1º Bim) | Abril |
| Início do 2º Bimestre | Maio |
| Encerramento do 2º Bimestre | Julho |
| Provas Regulares (2º Bim) | Julho |
| Exames Finais (1º Sem) | Julho/Agosto |

### Segundo Semestre — 3º e 4º Bimestres

O segundo semestre vai de **agosto** até **dezembro**:

| Evento | Período Estimado |
|--------|-----------------|
| Início do 3º Bimestre | Agosto |
| Encerramento do 3º Bimestre | Outubro |
| Provas Regulares (3º Bim) | Outubro |
| Início do 4º Bimestre | Outubro/Novembro |
| Encerramento do 4º Bimestre | Dezembro |
| Provas Regulares (4º Bim) | Dezembro |
| Exames Finais (2º Sem) | Dezembro/Janeiro |

## Como Nunca Perder uma Data: Sincronize o Calendário do AVA no Celular

Esta é a dica mais valiosa que você vai encontrar aqui. O AVA da UNIVESP (que roda na plataforma Canvas) permite sincronizar todas as datas de entrega automaticamente com seu **Google Agenda** ou **Calendário do iPhone**.

### Passo a Passo para Sincronizar:

1. Acesse o **AVA** e faça login normalmente.
2. No menu lateral esquerdo (ícone de calendário), clique em **Calendário**.
3. Role a página até o final e clique em **"Feed do Calendário"** (link no canto inferior direito).
4. Copie o link gerado.
5. No **Google Agenda**, clique no "+" ao lado de "Outras agendas" → **"Do URL"** → cole o link.
6. Pronto! Todas as datas de entrega aparecerão no seu celular automaticamente.

> Sempre que a coordenação do seu polo alterar uma data de prova ou entrega no AVA, o seu Google Agenda será atualizado automaticamente.

## Use a Calculadora para Planejar o Semestre

Conhecer as datas é apenas o primeiro passo. O segundo passo — e o mais estratégico — é saber **quanto você precisa estudar** para não depender do exame final.

Com o calendário em mãos, acesse nossa [Calculadora de Notas da UNIVESP](/) e simule seus cenários:

- **"Se eu tirar X nas atividades, quanto preciso na prova?"**
- **"Fiquei de exame — qual nota preciso para passar?"**
- **"Qual é minha média atual depois do 1º bimestre?"**

Planejar com antecedência é o que separa quem chega na prova tranquilo de quem fica na dúvida até a véspera.

## Perguntas Frequentes sobre o Calendário UNIVESP

### Onde encontrar o calendário acadêmico oficial da UNIVESP?

O calendário oficial é publicado no site da UNIVESP (univesp.br) e também está disponível dentro do AVA. Acesse o menu "Calendário" ou fique atento aos avisos no Mural do AVA, onde a coordenação posta atualizações importantes.

### As datas de prova são iguais para todos os cursos e polos?

As datas dos períodos de prova são definidas pela UNIVESP e valem para todos os alunos. No entanto, o horário e o local da prova são definidos pelo seu **polo de apoio presencial**. Consulte seu polo para confirmar os detalhes.

### O que acontece se eu perder a prova regular?

Se você não comparecer à prova regular e não tiver justificativa aceita, a nota da prova será zero. Dependendo da sua média nas atividades do AVA, você poderá ir direto para o Exame Final. Não há "segunda chamada" automática para a prova regular na maioria dos casos.

### Quando abrem as inscrições para Aproveitamento de Estudos?

A UNIVESP divulga as janelas de aproveitamento de estudos anualmente, geralmente no início de cada semestre. Fique atento ao AVA e ao site oficial para não perder o prazo. Consulte nosso [guia de aproveitamento de estudos](/blog/aproveitamento-estudos-univesp) para saber mais.

### Como saber se vou de Exame Final?

Sua média bimestral é composta por 40% das atividades do AVA e 60% da prova regular. Se essa média ficar abaixo de 5,0, você está habilitado para o Exame Final. Use nossa [Calculadora UNIVESP](/) para simular sua situação antes mesmo de receber o resultado oficial.

## Conclusão

O Calendário Acadêmico da UNIVESP é mais do que uma lista de datas: é o roteiro da sua jornada no semestre. Sincronize-o no celular, respeite os prazos e use a calculadora para planejar suas metas. Quem controla o calendario controla o semestre.
`.trim();

async function run() {
    console.log('\n🗓️  Criando artigo: Calendário UNIVESP 2026\n');

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('Nenhum usuário encontrado. Crie um usuário antes de rodar este script.');
        process.exit(1);
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug: SLUG } });

    if (existing) {
        console.log('Artigo já existe. Atualizando...');
        await prisma.blogPost.update({
            where: { slug: SLUG },
            data: {
                title: 'Calendário UNIVESP 2026: Datas Importantes e Como Não Perder Nenhuma',
                excerpt: 'Todas as datas importantes do calendário acadêmico da UNIVESP 2026: provas, exames, rematrículas e prazos do PI. Saiba como sincronizar tudo no seu celular.',
                content: CONTENT,
                published: true,
                metaTitle: 'Calendário UNIVESP 2026: Datas de Provas, Exames e Rematrícula',
                metaDescription: 'Calendário acadêmico da UNIVESP 2026 completo. Datas de provas regulares, exames finais, rematrícula e PI. Veja como sincronizar tudo no celular para não perder nenhum prazo.',
                keywords: 'calendário univesp 2026, calendario univesp 2026, calendário acadêmico univesp 2026, datas provas univesp, univesp calendario 2026, calendario academico univesp 2026',
            },
        });
    } else {
        await prisma.blogPost.create({
            data: {
                slug: SLUG,
                title: 'Calendário UNIVESP 2026: Datas Importantes e Como Não Perder Nenhuma',
                excerpt: 'Todas as datas importantes do calendário acadêmico da UNIVESP 2026: provas, exames, rematrículas e prazos do PI. Saiba como sincronizar tudo no seu celular.',
                content: CONTENT,
                published: true,
                metaTitle: 'Calendário UNIVESP 2026: Datas de Provas, Exames e Rematrícula',
                metaDescription: 'Calendário acadêmico da UNIVESP 2026 completo. Datas de provas regulares, exames finais, rematrícula e PI. Veja como sincronizar tudo no celular para não perder nenhum prazo.',
                keywords: 'calendário univesp 2026, calendario univesp 2026, calendário acadêmico univesp 2026, datas provas univesp, univesp calendario 2026, calendario academico univesp 2026',
                authorId: user.id,
            },
        });
    }

    console.log(`✅ Artigo "${SLUG}" criado/atualizado com sucesso!\n`);
}

run()
    .catch((e) => {
        console.error('Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
