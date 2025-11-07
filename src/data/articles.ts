export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export const articles: Article[] = [
  {
    slug: '/blog/guia-sistema-avaliacao-univesp',
    title: 'Guia Completo do Sistema de Avaliação da UNIVESP',
    description: 'Entenda em detalhes como sua nota final é composta, desde as atividades semanais até o exame final.',
    date: '2025-10-05',
    tags: ['Acadêmico', 'Notas', 'Regulamento']
  },
  {
    slug: '/blog/dicas-prova-presencial-univesp',
    title: '5 Dicas Essenciais para a Prova Presencial da UNIVESP',
    description: 'A prova presencial representa 60% da sua nota. Prepare-se com estratégias práticas para garantir um bom resultado.',
    date: '2025-10-06',
    tags: ['Dicas', 'Provas', 'Estudos']
  },
  {
    slug: '/blog/desvendando-projeto-integrador-univesp',
    title: 'Desvendando o Projeto Integrador (PI) da UNIVESP',
    description: 'O que é, quais as etapas e como garantir uma boa nota no trabalho mais importante do seu semestre.',
    date: '2025-10-07',
    tags: ['Projeto Integrador', 'Trabalho em Grupo', 'Acadêmico']
  },
  {
    slug: '/blog/aproveitamento-estudos-univesp',
    title: 'Aproveitamento de Estudos na UNIVESP: Guia Completo para Validar suas Disciplinas',
    description: 'Guia completo sobre o aproveitamento de estudos na UNIVESP. Descubra como validar disciplinas, documentos necessários, prazos e critérios para dispensa de matérias.',
    date: '2025-10-09',
    tags: ['Aproveitamento', 'Disciplinas', 'Regulamento', 'Documentos']
  },
  {
    slug: '/blog/disciplina-e-procrastinacao-univesp',
    title: 'A \'Liberdade\' do EAD na UNIVESP te Assusta? Um Guia para Criar Disciplina e Vencer a Procrastinação',
    description: 'Um guia completo para criar disciplina e uma rotina de estudos eficiente no EAD da UNIVESP. Aprenda a vencer a procrastinação com dicas e técnicas práticas.',
    date: '2025-10-14',
    tags: ['Disciplina', 'EAD', 'Produtividade', 'Dicas']
  },
  {
    slug: '/blog/guia-exame-recuperacao-univesp',
    title: 'Ficou de Exame na UNIVESP? O Guia Definitivo para a Recuperação',
    description: 'Ficou de exame na UNIVESP? Aprenda a calcular a nota que você precisa, crie um plano de estudos focado e garanta sua aprovação na recuperação.',
    date: '2025-10-14',
    tags: ['Exame', 'Recuperação', 'Provas', 'Notas', 'Acadêmico']
  },
  {
    slug: '/blog/guia-ava-univesp',
    title: 'AVA Univesp: O Guia para Dominar a Plataforma',
    description: 'Domine o Ambiente Virtual de Aprendizagem (AVA) da UNIVESP. Guia completo com dicas para organizar seus estudos, acessar materiais e não perder prazos.',
    date: '2025-10-15',
    tags: ['AVA', 'EAD', 'Organização', 'Dicas', 'UNIVESP']
  },
  {
    slug: '/blog/o-que-cai-na-prova-univesp',
    title: 'O que Cai na Prova da UNIVESP? Um Guia Realista',
    description: 'Descubra o que realmente cai na prova da UNIVESP. Um guia prático para focar seus estudos no conteúdo que mais importa e garantir sua aprovação.',
    date: '2025-10-15',
    tags: ['Provas', 'Dicas', 'Estudos', 'UNIVESP', 'Aprovação']
  },
  {
    slug: '/blog/o-que-estudar-vestibular-univesp',
    title: 'Vestibular UNIVESP: O Que Estudar e Como se Preparar',
    description: 'Seu guia completo para o vestibular da UNIVESP. Saiba o que estudar em cada matéria e descubra as melhores estratégias de preparação para garantir sua vaga.',
    date: '2025-10-15',
    tags: ['Vestibular', 'Dicas', 'Estudos', 'UNIVESP', 'Aprovação']
  },
  {
    slug: '/blog/guia-tcc-univesp-aprovacao',
    title: 'TCC na UNIVESP: Do Tema à Aprovação',
    description: 'Seu guia passo a passo para o TCC na UNIVESP. Da escolha do tema, passando pela ABNT, até a apresentação final para a banca.',
    date: '2025-10-20',
    tags: ['TCC', 'Monografia', 'UNIVESP', 'Aprovação', 'Dicas']
  },
  {
    slug: '/blog/guia-estudo-exatas-univesp',
    title: 'Cálculo e Código: O Guia EAD para Vencer as Exatas na UNIVESP',
    description: 'Dificuldade com Cálculo, Física ou Programação na UNIVESP? Aprenda a estudar exatas no EAD com um método passo a passo, da teoria à prática.',
    date: '2025-10-26',
    tags: ['Exatas', 'Cálculo', 'Programação', 'Dicas', 'Estudos']
  },
  {
    slug: '/blog/guia-eixos-univesp-ciclo-basico',
    title: 'Os Eixos da UNIVESP: O Guia Definitivo da Sua Jornada',
    description: 'O guia completo sobre os Eixos de Formação da UNIVESP. Entenda a diferença entre Computação, Licenciatura e Negócios e o que é o Ciclo Básico.',
    date: '2025-11-02',
    tags: ['UNIVESP', 'Eixos', 'Ciclo Básico', 'Vestibular', 'Guia']
  },
  {
    slug: '/blog/manual-nao-escrito-aluno-univesp',
    title: 'Além do AVA: O Manual Não Escrito do Aluno UNIVESP',
    description: 'O AVA é só o começo. Domine o ecossistema real da UNIVESP: grupos, polos, o PI e as ferramentas não-oficiais que garantem sua aprovação.',
    date: '2025-11-07',
    tags: ['UNIVESP', 'Dicas', 'Calouros', 'Comunidade', 'Guia']
  },
];