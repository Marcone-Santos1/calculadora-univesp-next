import Link from 'next/link';
import Image from "next/image";

export const ManualNaoEscrito = () => {
  return (
    <>
      <p className="lead">
        Você recebeu seu login e senha. Acessou o Ambiente Virtual de Aprendizagem (AVA) pela primeira vez. Viu as
        disciplinas, baixou os PDFs, deu play no primeiro vídeo. Você pensa: "Ok, é isso. Minha universidade é este
        site."
      </p>
      <p>
        E, oficialmente, você está certo. Mas em poucos dias, você é adicionado ao primeiro grupo de WhatsApp da turma.
        E de repente, um universo paralelo se abre. Links para o Google Drive, debates sobre a Semana 2, pânico sobre o
        prazo do Projeto Integrador e alguém perguntando "a nota já saiu?".
      </p>
      <p>
        Bem-vindo ao ecossistema real da UNIVESP.
      </p>
      <p>
        O sucesso nesta universidade não depende apenas de dominar o conteúdo oficial; depende de como você navega na
        estrutura "não-oficial" que os próprios alunos criam. Este é o manual não escrito, o guia para o que os
        professores não te ensinam, mas que é vital para sua jornada.
      </p>

      <h2>O Campus Duplo: Entendendo o "Governo" e a "Nação"</h2>

      <Image
        src="/images/blog/manual-nao-escrito-aluno-univesp/cover.png"
        alt="A dualidade do campus. Um estudante no centro, servindo como uma 'ponte' entre o mundo oficial (AVA) e o mundo caótico (Grupos/Nação)."
        width={1200}
        height={630}
        priority
      />

      <p>
        Para ter sucesso aqui, você precisa entender que a UNIVESP opera em duas esferas que correm em paralelo.
      </p>
      <ul>
        <li><strong>O "Governo" (A Estrutura Oficial):</strong> É composta pelo AVA, o Polo de Apoio, os Tutores e a
          Secretaria. Esta esfera é formal, burocrática e a fonte da verdade absoluta (notas, prazos, regras). Ela é
          lenta, metódica e não se importa com sua ansiedade.
        </li>
        <li><strong>A "Nação" (A Comunidade de Alunos):</strong> É composta pelos grupos de WhatsApp, Telegram, Discord,
          e os Google Drives da turma. Esta esfera é informal, emocional, incrivelmente rápida e, muitas vezes, caótica.
        </li>
      </ul>
      <p>
        O aluno que reprova geralmente comete um de dois erros: ou ele ignora a "Nação" e tenta fazer tudo sozinho
        (sobrecarga), ou ele confia <em>apenas</em> na "Nação" e se torna vítima de desinformação e pânico coletivo
        (ansiedade). O aluno de sucesso é um diplomata: ele vive nos dois mundos.
      </p>

      <Image
        src="/images/blog/manual-nao-escrito-aluno-univesp/campus_governo_nacao.png"
        alt="Visualizar as duas esferas de operação da universidade de forma clara."
        width={1200}
        height={630}
        priority
      />

      <h2>Navegando na "Nação": O Guia do Ecossistema Não-Oficial</h2>
      <p>
        Vamos dissecar os componentes-chave deste universo paralelo e como usá-los estrategicamente.
      </p>

      <h3>O Oráculo Caótico: Grupos de WhatsApp e Telegram</h3>
      <Image
        src="/images/blog/manual-nao-escrito-aluno-univesp/oraculo.png"
        alt="Visualizar as duas esferas de operação da universidade de forma clara."
        width={1200}
        height={630}
        priority
      />
      <p>
        O grupo de WhatsApp da sua turma é, ao mesmo tempo, sua maior bênção e sua pior maldição.
      </p>
      <ul>
        <li><strong>O Lado Bom (O Oráculo):</strong> É o sensor mais rápido da universidade. "O sistema caiu?", "Alguém
          entendeu a questão 4?", "O link do PI é esse". Para dúvidas pontuais e apoio moral, é imbatível. É onde você
          encontra seu grupo para o PI e onde os links para os materiais compilados (veja abaixo) são compartilhados.
        </li>
        <li><strong>O Lado Ruim (O Pânico):</strong> É uma câmara de eco para a ansiedade. Um aluno que não leu o edital
          faz uma pergunta errada, e em dez minutos, 50 pessoas estão em pânico por um problema que não existe.
        </li>
        <li><strong>A Estratégia de Sucesso:</strong> Use o grupo como um "sensor", não como uma "fonte da verdade".
          Silencie as notificações e crie o hábito de checar 2-3 vezes ao dia, em horários definidos. Viu uma informação
          bombástica? Vá até o AVA (o "Governo") e confirme se ela é real antes de acreditar.
        </li>
      </ul>

      <h3>O Desafio Real: A Gestão do Projeto Integrador (PI)</h3>
      <p>
        O Projeto Integrador não é um trabalho acadêmico. É um exercício brutal de <strong>gestão de projetos remotos
        com estranhos</strong>. A nota acadêmica é quase secundária à habilidade de fazer o grupo funcionar.
      </p>
      <p>
        No seu primeiro PI, você invariavelmente encontrará estes arquétipos:
      </p>
      <ol>
        <li><strong>O Líder (ou "O que Faz Tudo"):</strong> Assume o controle, muitas vezes por pura exaustão, e acaba
          centralizando o trabalho.
        </li>
        <li><strong>O Fantasma:</strong> Aparece no primeiro dia, diz "conte comigo" e desaparece até a semana da
          entrega.
        </li>
        <li><strong>O Questionador:</strong> Não produz muito, mas tem objeções a tudo que os outros fazem.</li>
        <li><strong>O Proativo:</strong> O colega que realmente divide as tarefas e cumpre os prazos.</li>
      </ol>
      <Image
        src="/images/blog/manual-nao-escrito-aluno-univesp/gestao_pi.png"
        alt="Os arquétipos clássicos de um grupo de PI em EAD."
        width={1200}
        height={630}
        priority
      />
      <p>
        O segredo não é ter sorte de cair num grupo só de "Proativos". O segredo é ter <strong>método</strong>.
      </p>
      <ul>
        <li><strong>Dia 1: Defina o Escopo e as Ferramentas.</strong> Não comece discutindo o tema. Comece
          definindo <em>como</em> vocês vão trabalhar. Use o Google Docs para o texto, o WhatsApp para comunicação
          rápida e uma ferramenta de gestão (Trello, Notion, ou até uma simples planilha) para dividir as tarefas.
        </li>
        <li><strong>Dia 2: Defina Papéis e Prazos.</strong> Quem é o responsável por qual parte? E qual o
          prazo <em>interno</em> (sempre 3-4 dias antes do prazo real) para a entrega? Documente isso.
        </li>
        <li><strong>O "Soft Delete":</strong> Se um "Fantasma" não der sinal de vida por uma semana, o grupo precisa
          decidir se irá removê-lo (seguindo as regras do AVA) ou absorver o trabalho. Não espere até a véspera.
        </li>
      </ul>

      <h3>O Drive da Turma: A Biblioteca de Alexandria (e Seus Riscos)</h3>
      <p>
        Inevitavelmente, alguém criará um Google Drive e começará a compilar resumos, provas antigas, PDFs dos livros e
        videoaulas baixadas.
      </p>
      <ul>
        <li><strong>A Vantagem:</strong> É um repositório centralizado de conhecimento. Acessar provas antigas é a
          melhor forma de estudar (como já discutimos em outro artigo).
        </li>
        <li><strong>O Risco:</strong> Material desatualizado, resumos com erros conceituais e, claro, a questão do
          direito autoral.
        </li>
        <li><strong>A Estratégia:</strong> Use o Drive como fonte de apoio, mas jamais como fonte primária. A fonte
          primária é e sempre será o AVA daquele semestre. Use as provas antigas para <em>testar</em> seu conhecimento,
          não para <em>substituir</em> o estudo do material oficial.
        </li>
      </ul>

      <h2>O "Cinto de Utilidades" que Une os Dois Mundos</h2>
      <p>
        Você tem o "Governo" (o AVA) te dando o conteúdo oficial, e a "Nação" (os grupos) te dando o apoio e o caos.
        Como você gerencia isso? Com ferramentas pessoais.
      </p>
      <p>
        E a ferramenta mais importante, o seu verdadeiro "painel de controle" estratégico, é a que te diz se você está
        no caminho certo para a aprovação.
      </p>

      <div className="bg-blue-100 dark:bg-blue-800 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 p-4 my-6"
           role="alert">
        <p className="font-bold">Sua Bússola Estratégica: A Calculadora Univesp</p>
        <p>
          O caos da "Nação" vai te deixar ansioso sobre notas. O "Governo" (AVA) vai te dar as notas, mas não vai te
          dizer o que elas significam estrategicamente. A <Link href="https://univesp-calculadora.vercel.app/"
                                                                className="font-semibold underline">Calculadora
          Univesp</Link> é a sua bússola.
        </p>
        <Image
          src="/images/blog/manual-nao-escrito-aluno-univesp/bussola_estrategica.png"
          alt="Os arquétipos clássicos de um grupo de PI em EAD."
          width={1200}
          height={630}
          priority
        />
        <p>
          É nela que você traduz toda a informação em um plano de ação. "Preciso de um 6,5 na prova para passar", "Se eu
          gabaritar a Semana 4, posso tirar um 5,0 no exame". Ela é a ferramenta que te tira do banco do passageiro
          (onde a ansiedade dos grupos te leva) e te coloca no banco do motorista. É a ponte perfeita entre os dois
          mundos.
        </p>
      </div>

      <h2>Conclusão: O Diplomata do EAD</h2>
      <p>
        Ser aluno da UNIVESP é ser um diplomata. É saber transitar entre a formalidade do "Governo" (AVA) e o caos da
        "Nação" (WhatsApp), tirando o melhor de cada um.
      </p>
      <p>
        Não se isole. A comunidade é sua maior força. Mas não se afogue nela. Mantenha os pés firmes na fonte oficial e
        use suas próprias ferramentas — especialmente a <Link href="https://univesp-calculadora.vercel.app/"
                                                              className="font-semibold underline">Calculadora
        Univesp</Link> — para ser o estrategista da sua própria aprovação. O AVA te dá o <em>conteúdo</em>, a comunidade
        te dá o <em>apoio</em>, mas é você quem traça o <em>plano</em>.
      </p>
    </>
  );
};