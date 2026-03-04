import { Achievement } from "@/utils/achievements";

export const BaseEmailTemplate = (content: string, title?: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || 'Calculadora Univesp'}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#374151;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;" role="presentation">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-size:20px; font-weight:700; color:#111827;">
                <img src="https://calculadoraunivesp.com.br/favicon.ico" alt="Calculadora Univesp" style="width:20px; height:20px; margin-right:8px;" />
                
                <a href="https://calculadoraunivesp.com.br" style="text-decoration:none; color:#111827;">Calculadora <span style="color:#2563eb;">Univesp</span></a>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:32px 28px; box-shadow:0 8px 24px rgba(0,0,0,0.05);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px; font-size:12px; color:#6b7280;">
              <p style="margin:0 0 8px;">
                Feito com <span style="color:#ef4444;">❤</span> por Calculadora Univesp
              </p>
              <p style="margin:0;">
                Dúvidas? É só responder este email.<br />
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;


// --- Block Types ---

export type EmailBlock =
  | { id: string; type: 'HEADING'; content: string; align: 'left' | 'center' | 'right'; color: string }
  | { id: string; type: 'TEXT'; content: string; align: 'left' | 'center' | 'right'; color: string }
  | { id: string; type: 'BUTTON'; label: string; url: string; bgColor: string; txtColor: string; align: 'left' | 'center' | 'right' }
  | { id: string; type: 'IMAGE'; url: string; alt: string; width: string; align: 'left' | 'center' | 'right' }
  | { id: string; type: 'SPACER'; height: number }
  | { id: string; type: 'DIVIDER'; color: string; direction?: 'horizontal' | 'vertical'; borderSize?: number }
  | { id: string; type: 'CONTAINER'; children: EmailBlock[]; style?: string; direction?: 'row' | 'column'; align?: 'left' | 'center' | 'right' };

// --- Components ---

export const EmailComponents = {
  Heading: (text: string, options: { align?: string; color?: string } = {}) => `
    <h1 style="color:${options.color || '#1e3a8a'}; font-size:24px; font-weight:700; margin:0 0 16px; text-align:${options.align || 'left'};">${text}</h1>
  `,

  Text: (text: string, options: { align?: string; color?: string; fontSize?: string } = {}) => `
    <p style="margin:0 0 16px; font-size:${options.fontSize || '16px'}; line-height:1.6; color:${options.color || '#374151'}; text-align:${options.align || 'left'}; white-space: pre-wrap;">${text}</p>
  `,

  Button: (label: string, url: string, options: { bgColor?: string; txtColor?: string; align?: string } = {}) => `
    <div style="margin: 24px 0; text-align:${options.align || 'left'};">
      <a href="${url}" style="display:inline-block; background-color:${options.bgColor || '#2563eb'}; color:${options.txtColor || '#ffffff'}; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; font-size:16px;">
        ${label}
      </a>
    </div>
  `,

  Image: (url: string, options: { alt?: string; width?: string; align?: string } = {}) => `
    <div style="margin: 16px 0; text-align:${options.align || 'center'};">
        <img src="${url}" alt="${options.alt || ''}" style="max-width:100%; width:${options.width || 'auto'}; height:auto; border-radius:8px;" />
    </div>
  `,

  Spacer: (height: number) => `
    <div style="height:${height}px; line-height:${height}px;">&nbsp;</div>
  `,

  Divider: (color: string = '#e5e7eb', options: { borderSize?: number; direction?: 'horizontal' | 'vertical' } = {}) => {
    const size = options.borderSize || 1;
    const direction = options.direction || 'horizontal';

    if (direction === 'vertical') {
      return `<div style="width: 0px; border-left: ${size}px solid ${color}; height: auto; min-height: 20px; margin: 0 12px; align-self: stretch;"></div>`;
    }

    return `<hr style="border:none; border-top:${size}px solid ${color}; margin:24px 0; width: 100%;" />`;
  },

  HighlightBox: (text: string) => `
    <div style="background-color:#eff6ff; border-left:4px solid #2563eb; padding:16px; border-radius:4px; margin: 16px 0; color:#1e40af;">
      ${text}
    </div>
  `,

  Container: (content: string, options: { style?: string; direction?: 'row' | 'column'; align?: 'left' | 'center' | 'right' } = {}) => {
    const direction = options.direction || 'column';
    const align = options.align || 'left';

    // Map alignment to flex properties
    let justifyContent = 'flex-start';
    let alignItems = 'stretch';
    let textAlign = 'left';

    if (direction === 'row') {
      alignItems = 'center'; // Default vertical align for row
      if (align === 'center') justifyContent = 'center';
      if (align === 'right') justifyContent = 'flex-end';
    } else {
      // column
      if (align === 'center') alignItems = 'center';
      if (align === 'right') alignItems = 'flex-end';
      textAlign = align;
    }

    return `
    <div style="display:flex; flex-direction:${direction}; justify-content:${justifyContent}; align-items:${alignItems}; text-align:${textAlign}; gap: 16px; ${options.style || ''}">
      ${content}
    </div>
  `;
  }
};

export const renderEmailBlocks = (blocks: EmailBlock[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'HEADING':
        return EmailComponents.Heading(block.content, { align: block.align, color: block.color });
      case 'TEXT':
        return EmailComponents.Text(block.content, { align: block.align, color: block.color });
      case 'BUTTON':
        return EmailComponents.Button(block.label, block.url, { align: block.align, bgColor: block.bgColor, txtColor: block.txtColor });
      case 'IMAGE':
        return EmailComponents.Image(block.url, { align: block.align, width: block.width, alt: block.alt });
      case 'SPACER':
        return EmailComponents.Spacer(block.height);
      case 'DIVIDER':
        return EmailComponents.Divider(block.color, { borderSize: block.borderSize, direction: block.direction });
      case 'CONTAINER':
        return EmailComponents.Container(
          renderEmailBlocks(block.children),
          { style: block.style, direction: block.direction, align: block.align }
        );
      default:
        return '';
    }
  }).join('');
};

// --- Pre-defined Templates ---

export const PredefinedTemplates = {
  ANNOUNCEMENT: {
    label: "Aviso Geral",
    subject: "[Aviso] Novidades na Calculadora Univesp",
    body: (message: string) => `
      ${EmailComponents.Heading("Olá, estudante!")}
      ${EmailComponents.Text(message)}
      ${EmailComponents.Button("Acessar Plataforma", "https://calculadoraunivesp.com.br")}
    `
  },

  WELCOME: {
    label: "Boas-vindas",
    subject: "Bem-vindo à Calculadora Univesp! 🚀",
    body: (name: string) => `
      ${EmailComponents.Heading(`Olá, ${name}!`)}
      ${EmailComponents.Text("Estamos muito felizes em ter você aqui. A Calculadora Univesp foi criada para ajudar você a organizar sua jornada acadêmica.")}
      ${EmailComponents.HighlightBox("Dica: Comece adicionando suas notas para ver sua média calculada automaticamente.")}
      ${EmailComponents.Button("Acessar Perfil", "https://calculadoraunivesp.com.br/perfil")}
    `
  },

  VERIFICATION_APPROVED: {
    label: "Questão Verificada",
    subject: "Sua questão foi aceita! ✅",
    body: (questionTitle: string) => `
      ${EmailComponents.Heading("Parabéns!")}
      ${EmailComponents.Text(`Sua questão "<strong>${questionTitle}</strong>" foi verificada por nossa equipe.`)}
      ${EmailComponents.Text("Você ganhou <strong>10 pontos de reputação</strong> por contribuir com a comunidade.")}
      ${EmailComponents.Button("Ver Questão", "https://calculadoraunivesp.com.br/questoes")}
    `
  },

  WARNING: {
    label: "Alerta de Moderação",
    subject: "Aviso importante sobre sua conta",
    body: (reason: string) => `
      ${EmailComponents.Heading("Atenção")}
      ${EmailComponents.Text("Detectamos uma atividade que viola nossos termos de uso:")}
      ${EmailComponents.HighlightBox(reason)}
      ${EmailComponents.Text("Por favor, revise nossas diretrizes para evitar restrições em sua conta.")}
      ${EmailComponents.Button("Ler Diretrizes", "https://calculadoraunivesp.com.br/termos")}
    `
  },

  VERIFICATION_REQUEST_ADMIN: {
    label: "Nova Validação",
    subject: "[Admin] Solicitação de Validação",
    body: (questionTitle: string, requesterName: string, requesterEmail: string, link: string) => `
      ${EmailComponents.Heading("Nova Solicitação de Validação")}
      ${EmailComponents.Text(`A questão "<strong>${questionTitle}</strong>" recebeu um pedido de validação.`)}
      ${EmailComponents.HighlightBox(`Solicitado por: ${requesterName} (${requesterEmail})`)}
      ${EmailComponents.Button("Ver Questão", link)}
    `
  },

  VERIFICATION_REQUEST_CONFIRMATION: {
    label: "Validação Recebida",
    subject: "Recebemos seu pedido de validação",
    body: (name: string, questionTitle: string, link: string) => `
      ${EmailComponents.Heading(`Olá, ${name}`)}
      ${EmailComponents.Text(`Recebemos sua solicitação para validar a questão "<strong>${questionTitle}</strong>".`)}
      ${EmailComponents.Text("Nossa equipe administrativa irá analisar a questão em breve.")}
      ${EmailComponents.Button("Ver Questão", link)}
    `
  },

  VERIFICATION_REQUEST_AUTHOR: {
    label: "Validação na sua Questão",
    subject: "Sua questão recebeu um pedido de validação",
    body: (questionTitle: string, link: string) => `
      ${EmailComponents.Heading("Sua questão está sendo analisada")}
      ${EmailComponents.Text(`Um usuário solicitou a validação da sua questão "<strong>${questionTitle}</strong>".`)}
      ${EmailComponents.Text("Isso significa que ela será revisada por nossa equipe para garantir sua correção e qualidade. Você será notificado se houver alterações.")}
      ${EmailComponents.Button("Ver Questão", link)}
    `
  },

  ACHIEVEMENT: {
    label: "Conquista",
    subject: "Parabéns! Você desbloqueou a conquista: ${achievement.icon} ${achievement.title}",
    body: (name: string, achievement: Achievement, link: string) => `
      ${EmailComponents.Heading(`Olá, ${name}`)}
      ${EmailComponents.Text(`Parabéns! Você desbloqueou a conquista: ${achievement.icon} ${achievement.title}`)}
      ${EmailComponents.Button("Ver Conquista", link)}
    `
  },

  STREAK_WARNING: {
    label: "Aviso de Ofensiva",
    subject: '🔥 Sua ofensiva está em perigo!',
    body: (days: number) => `
      ${EmailComponents.Heading('Não deixe a chama apagar! 🔥', { align: 'center', color: '#dc2626' })}
      ${EmailComponents.Text(`Você está há ${days} dias estudando consecutivamente. Impressionante!`, { align: 'center', fontSize: '18px' })}
      ${EmailComponents.Text('Mas notamos que você ainda não apareceu por aqui hoje. Sua ofensiva vai zerar se você não fizer login até a meia-noite.', { align: 'center' })}
      ${EmailComponents.Button('Salvar Minha Ofensiva', `${process.env.NEXT_PUBLIC_APP_URL}/login`, { align: 'center', bgColor: '#dc2626' })}
    `
  },

  /** Re-engagement: users inactive 3–7 days */
  REENGAGEMENT: {
    label: "Reengajamento",
    subject: "Sentimos sua falta na Calculadora Univesp 💙",
    body: (name: string, baseUrl: string) => `
      ${EmailComponents.Heading(`Olá, ${name}!`, { align: 'center' })}
      ${EmailComponents.Text('Faz alguns dias que você não passa por aqui. A comunidade continua crescendo com novas questões e simulados.', { align: 'center' })}
      ${EmailComponents.Text('Que tal dar uma olhada nas questões mais acessadas da semana ou fazer um simulado rápido para manter o ritmo?', { align: 'center' })}
      ${EmailComponents.Button('Voltar a estudar', `${baseUrl}/questoes`, { align: 'center', bgColor: '#2563eb' })}
      ${EmailComponents.Spacer(8)}
      ${EmailComponents.Text('Até breve!', { align: 'center', color: '#6b7280' })}
    `
  },

  /** Weekly summary: resumo da semana (streak, simulados, participação) */
  WEEKLY_SUMMARY: {
    label: "Resumo Semanal",
    subject: "📊 Seu resumo da semana na Calculadora Univesp",
    body: (
      name: string,
      stats: { streak: number; simuladosCompleted: number; commentsCount: number; questionsCreated: number },
      baseUrl: string
    ) => {
      const hasActivity = stats.simuladosCompleted > 0 || stats.commentsCount > 0 || stats.questionsCreated > 0;
      return `
      ${EmailComponents.Heading(`Olá, ${name}!`, { align: 'center' })}
      ${EmailComponents.Text('Aqui está seu resumo da última semana na Calculadora Univesp.', { align: 'center' })}
      ${EmailComponents.Divider('#e5e7eb')}
      ${stats.streak > 0 ? EmailComponents.HighlightBox(`🔥 <strong>${stats.streak} dias</strong> de ofensiva! Continue assim.`) : ''}
      ${EmailComponents.Text(
        `Simulados concluídos: <strong>${stats.simuladosCompleted}</strong> · Comentários: <strong>${stats.commentsCount}</strong> · Questões criadas: <strong>${stats.questionsCreated}</strong>`,
        { align: 'center', fontSize: '15px' }
      )}
      ${EmailComponents.Spacer(8)}
      ${hasActivity
        ? EmailComponents.Text('Parabéns pela dedicação! Que tal manter o ritmo na próxima semana?', { align: 'center' })
        : EmailComponents.Text('Que tal começar a semana com um simulado ou explorando questões da sua disciplina?', { align: 'center' })
      }
      ${EmailComponents.Button('Abrir plataforma', baseUrl, { align: 'center' })}
    `;
    }
  },

  BILLING_PAID: {
    label: "Pagamento Confirmado",
    subject: "Seu pagamento foi confirmado! 🚀",
    body: (name: string, amount: number) => `
      ${EmailComponents.Heading(`Olá, ${name}!`)}
      ${EmailComponents.Text(`Seu depósito de <strong>R$ ${(amount / 100).toFixed(2).replace('.', ',')}</strong> foi confirmado com sucesso.`)}
      ${EmailComponents.Text("O valor já está disponível em seu saldo para impulsionar suas campanhas.")}
      ${EmailComponents.Button("Gerenciar Anúncios", `${process.env.NEXT_PUBLIC_APP_URL}/advertiser/dashboard`)}
    `
  },

  AVA_IMPORTER_UPDATE: {
    label: "Melhorias no Importador",
    subject: "🔄 Importador do AVA Atualizado – Fila em Background",
    body: () => `
      ${EmailComponents.Heading('Seu importador do AVA ficou melhor!', { align: 'left', color: '#1e3a8a' })}
      ${EmailComponents.Text('Olá! Temos novidades importantes sobre o <strong>Importador de Atividades do AVA</strong>.')}
      ${EmailComponents.Text('Fizemos melhorias significativas nesta funcionalidade. Agora o processo funciona de forma mais estável e você não precisa mais manter a aba aberta enquanto espera.')}
      ${EmailComponents.Divider()}
      ${EmailComponents.Text('<strong>📦 O que mudou?</strong>', { color: '#111827' })}
      ${EmailComponents.HighlightBox('<strong>Processamento em Background:</strong> Ao iniciar a sincronização, sua solicitação vai para uma fila de processamento. Você pode fechar a aba normalmente!')}
      ${EmailComponents.HighlightBox('<strong>Acompanhamento de Status:</strong> Acesse a página de importação a qualquer momento para ver o status dos seus jobs – pendente, em andamento ou concluído.')}
      ${EmailComponents.HighlightBox('<strong>Maior Estabilidade:</strong> O novo sistema é mais resistente a falhas e processa suas atividades em background de forma mais confiável.')}
      ${EmailComponents.Spacer(8)}
      ${EmailComponents.Text('Para usar o importador atualizado, acesse seu perfil e clique em <strong>Importar do AVA</strong>.', { color: '#6b7280' })}
      ${EmailComponents.Button('Ir para Importação', 'https://calculadoraunivesp.com.br/perfil/importar', { bgColor: '#2563eb', align: 'center' })}
    `
  },

  GENERIC: {
    label: "Genérico",
    subject: "Notificação",
    body: (htmlContent: string) => htmlContent
  }
};
