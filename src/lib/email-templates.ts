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
                Calculadora <span style="color:#2563eb;">Univesp</span>
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
    | { id: string; type: 'DIVIDER'; color: string };

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

    Divider: (color: string = '#e5e7eb') => `
    <hr style="border:none; border-top:1px solid ${color}; margin:24px 0;" />
  `,

    HighlightBox: (text: string) => `
    <div style="background-color:#eff6ff; border-left:4px solid #2563eb; padding:16px; border-radius:4px; margin: 16px 0; color:#1e40af;">
      ${text}
    </div>
  `
};

export const renderEmailBlocks = (blocks: EmailBlock[]) => {
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
                return EmailComponents.Divider(block.color);
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
      ${EmailComponents.Button("Começar Agora", "https://calculadoraunivesp.com.br")}
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
    }
};
