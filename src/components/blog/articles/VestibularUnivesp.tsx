import Link from 'next/link';
import {SITE_CONFIG} from "@/utils/Constants";

export const VestibularUnivesp = () => {
  return (
    <>
      <p className="lead">
        A Universidade Virtual do Estado de São Paulo (UNIVESP) abriu as portas do ensino superior de qualidade e
        gratuito para milhares de pessoas. Se você está sonhando com uma vaga, o vestibular é o seu primeiro grande
        desafio. Mas a pergunta que surge é: por onde começar? O que, de fato, cai na prova?
      </p>
      <p>
        A preparação para um vestibular não é apenas sobre a quantidade de horas estudadas, mas sobre a qualidade e a
        estratégia desse estudo. Neste guia, vamos detalhar o conteúdo que você precisa dominar em cada disciplina e
        apresentar um plano de ação prático para você chegar no dia da prova com confiança e conhecimento.
      </p>

      <h2>A Estrutura da Prova: Conheça seu Desafio</h2>
      <p>
        Antes de mergulhar nos livros, é crucial entender como a prova é estruturada. O vestibular da UNIVESP geralmente
        consiste em:
      </p>
      <ul>
        <li><strong>Questões de Múltipla Escolha:</strong> Abrangendo o conteúdo do Ensino Médio.</li>
        <li><strong>Redação:</strong> Onde sua capacidade de argumentação, coesão e domínio da norma culta da língua
          portuguesa será avaliada.
        </li>
      </ul>
      <p>
        A prova é dividida em eixos, e o conteúdo programático foca nas competências e habilidades essenciais que se
        espera de um concluinte do Ensino Médio.
      </p>

      <h2>O Que Estudar em Cada Matéria: Foco no Essencial</h2>
      <p>
        Vamos detalhar os tópicos mais importantes por disciplina, com base nos editais anteriores.
      </p>

      <h3>Português e Literatura</h3>
      <p>
        O domínio da língua é fundamental, não só para as questões objetivas, mas principalmente para a redação.
      </p>
      <ul>
        <li><strong>Interpretação de Textos:</strong> Habilidade central. Pratique com textos jornalísticos, literários,
          científicos e charges.
        </li>
        <li><strong>Gramática Aplicada:</strong> Foco em concordância (verbal e nominal), regência, crase e pontuação.
        </li>
        <li><strong>Figuras de Linguagem e Variação Linguística:</strong> Entender como a linguagem é usada para criar
          diferentes efeitos de sentido.
        </li>
        <li><strong>Literatura Brasileira:</strong> Tenha uma visão geral das principais escolas literárias (Romantismo,
          Realismo, Modernismo) e seus autores mais representativos.
        </li>
      </ul>

      <h3>Matemática</h3>
      <p>
        A prova de matemática da UNIVESP costuma ser bastante focada na resolução de problemas práticos.
      </p>
      <ul>
        <li><strong>Matemática Básica:</strong> Porcentagem, regra de três, juros simples e compostos. Domine esses
          tópicos, pois são aplicados em diversas outras questões.
        </li>
        <li><strong>Funções:</strong> Entender os conceitos de função de 1º e 2º grau e saber interpretar seus gráficos.
        </li>
        <li><strong>Geometria:</strong> Cálculo de áreas de figuras planas e volumes de sólidos.</li>
        <li><strong>Análise Combinatória e Probabilidade:</strong> Questões que envolvem contagem e cálculo de chances.
        </li>
      </ul>

      <h3>Ciências Humanas (História, Geografia, Filosofia e Sociologia)</h3>
      <p>
        Aqui, a capacidade de contextualizar e relacionar eventos é mais importante do que decorar datas.
      </p>
      <ul>
        <li><strong>História do Brasil:</strong> Com foco no período republicano, Era Vargas e Ditadura Militar.</li>
        <li><strong>História Geral:</strong> Grandes navegações, Revolução Industrial e os conflitos mundiais (Primeira
          e Segunda Guerra).
        </li>
        <li><strong>Geografia do Brasil:</strong> Urbanização, industrialização, fontes de energia e questões
          ambientais.
        </li>
        <li><strong>Atualidades:</strong> Esteja atento aos grandes temas do Brasil e do mundo nos últimos meses. A
          prova adora contextualizar questões com notícias recentes.
        </li>
      </ul>

      <h3>Ciências da Natureza (Física, Química e Biologia)</h3>
      <ul>
        <li><strong>Biologia:</strong> Ecologia (relações ecológicas, ciclos biogeoquímicos), Genética (leis de Mendel)
          e Fisiologia Humana.
        </li>
        <li><strong>Química:</strong> Estequiometria, funções orgânicas e reações químicas.</li>
        <li><strong>Física:</strong> Mecânica (cinemática e dinâmica), Eletricidade (circuitos simples) e Ondulatória.
        </li>
      </ul>

      <h2>Como se Preparar de Forma Inteligente</h2>
      <ol>
        <li><strong>Crie um Cronograma Realista:</strong> Divida seu tempo de estudo entre as matérias. Use a nossa
          calculadora de tempo, não a de notas, para planejar suas semanas.
        </li>
        <li><strong>Resolva Provas Anteriores:</strong> Esta é a dica mais valiosa. Resolver as provas dos vestibulares
          passados da UNIVESP te familiariza com o estilo das questões, o nível de dificuldade e os temas mais
          recorrentes.
        </li>
        <li><strong>Foco na Redação:</strong> Pratique, no mínimo, uma redação por semana. Peça para alguém corrigir ou
          use plataformas online. O tema geralmente é um problema social ou contemporâneo brasileiro.
        </li>
        <li><strong>Mantenha-se Informado:</strong> Leia jornais, assista a noticiários. Conhecer as atualidades te dará
          repertório para a redação e para as questões de humanas.
        </li>
      </ol>

      <div className="bg-blue-100 dark:bg-blue-800 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 p-4 my-6"
           role="alert">
        <p className="font-bold">Sua Jornada Começa Agora</p>
        <p>A preparação para o vestibular é o primeiro passo da sua vida acadêmica. Uma vez aprovado, ferramentas como
          a <Link href={SITE_CONFIG.BASE_URL} className="font-semibold underline">Calculadora
            Univesp</Link> serão suas aliadas para planejar suas notas e garantir o sucesso em cada disciplina.</p>
      </div>

      <h2>Conclusão</h2>
      <p>
        Entrar na UNIVESP é um objetivo totalmente alcançável com um plano de estudos bem estruturado. Foque nos
        fundamentos, entenda a lógica da prova através dos exames anteriores e, acima de tudo, mantenha a constância.
        Sua dedicação agora é o investimento que abrirá as portas para um futuro acadêmico brilhante e gratuito. Boa
        sorte e bons estudos!
      </p>
    </>
  );
};