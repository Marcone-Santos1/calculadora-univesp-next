import Link from 'next/link';
import {SITE_CONFIG} from "@/utils/Constants";

export const GuiaAVA = () => {
  return (
    <>
      <p className="lead">
        Ao iniciar sua jornada na UNIVESP, o Ambiente Virtual de Aprendizagem (AVA) se apresenta como seu novo campus
        universitário. É uma mistura de portal, sala de aula e biblioteca. A primeira impressão pode ser de um labirinto
        de links e menus, mas entender sua lógica é o primeiro passo para transformar a autonomia do EAD em sucesso
        acadêmico.
      </p>
      <p>
        Neste guia, vamos desvendar cada canto do AVA. Você aprenderá não apenas <em>o que</em> cada ferramenta faz,
        mas <em>como</em> usá-las de forma estratégica para criar uma rotina de estudos eficiente, vencer a
        desorganização e estar sempre um passo à frente.
      </p>

      <h2>Desvendando a Estrutura: Onde Tudo Fica</h2>
      <p>
        O AVA é organizado em torno de alguns pilares. Dominá-los significa nunca mais se sentir perdido.
      </p>
      <ul>
        <li><strong>Mural de Avisos:</strong> Pense nele como o quadro de avisos central do seu polo. Avisos importantes
          sobre provas, eventos e prazos gerais são postados aqui. Crie o hábito de verificá-lo a cada login.
        </li>
        <li><strong>Conteúdo das Disciplinas:</strong> A joia da coroa. Aqui, cada disciplina é um universo próprio,
          geralmente dividido por semanas. Em cada semana, você encontrará os vídeos, os PDFs e, crucialmente, as
          atividades avaliativas.
        </li>
        <li><strong>Calendário:</strong> Mais do que uma agenda, o calendário do AVA é seu mapa do tesouro para os
          prazos. Ele sincroniza as datas de entrega de todas as suas disciplinas. Use-o para planejar seu mês e evitar
          surpresas desagradáveis.
        </li>
        <li><strong>Biblioteca Virtual:</strong> Um recurso incrivelmente valioso e muitas vezes subutilizado. Você tem
          acesso a um acervo gigantesco de livros e artigos acadêmicos que complementam as aulas e são essenciais para o
          Projeto Integrador.
        </li>
      </ul>

      <h2>Sua Rotina de Estudos Vencedora no AVA</h2>
      <p>
        Saber onde as coisas estão é uma coisa. Usá-las com eficiência é outra. Uma rotina bem definida é o que separa
        os alunos que sobrevivem dos que prosperam.
      </p>

      <h3>O Ritual da Segunda-Feira</h3>
      <p>
        Comece cada semana com um "ritual de reconhecimento". Reserve 30 minutos na segunda-feira para:
      </p>
      <ol>
        <li>Abrir o AVA e verificar o mural de avisos.</li>
        <li>Acessar cada disciplina e baixar todo o material da semana (vídeos e PDFs).</li>
        <li>Verificar as datas das atividades avaliativas e bloqueá-las no seu calendário pessoal.</li>
      </ol>
      <p>
        Esse pequeno ritual elimina a ansiedade e te dá um panorama claro dos seus compromissos, transformando o "o que
        eu tenho que fazer?" em "é isso que eu vou fazer".
      </p>

      <h3>Atividades Avaliativas: Seu Termômetro</h3>
      <p>
        As atividades semanais não são apenas tarefas para nota; são o melhor indicador do que a disciplina considera
        importante. Elas são mini-simulados da prova regular.
      </p>
      <p>
        Ao respondê-las, não foque apenas em acertar. Tente entender a lógica por trás de cada pergunta. As dúvidas que
        surgirem aqui são o material de estudo mais valioso que você pode ter.
      </p>

      <div className="bg-blue-100 dark:bg-blue-800 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 p-4 my-6"
           role="alert">
        <p className="font-bold">Dica de Ouro</p>
        <p>A nota dessas atividades compõe 40% da sua média final. Negligenciá-las é um dos maiores erros que um aluno
          pode cometer. Para entender o impacto exato delas na sua aprovação, use a aba "Média Final" da nossa <Link
            href={SITE_CONFIG.BASE_URL} className="font-semibold underline">Calculadora
            Univesp</Link>.</p>
      </div>

      <h2>Conclusão</h2>
      <p>
        O AVA da UNIVESP é muito mais do que um repositório de arquivos; é o ecossistema onde seu aprendizado acontece.
        Encare-o não como uma obrigação, mas como uma ferramenta poderosa à sua disposição. Ao criar rituais, entender a
        estrutura e usar seus recursos de forma estratégica, você transforma a plataforma de um labirinto confuso em seu
        principal aliado na conquista do diploma. Assuma o controle, organize sua rotina e veja sua produtividade
        decolar.
      </p>
    </>
  );
};