import Link from "next/link";

export const ExameUnivesp = () => {
  return (
    <>
      <p className="lead">
        Receber a notícia de que você "ficou de exame" pode ser frustrante, mas é fundamental encarar este momento não
        como uma falha, e sim como uma segunda chance estratégica. A prova de exame na UNIVESP é uma oportunidade clara
        para recuperar sua nota e garantir a aprovação na disciplina. Este guia vai te mostrar exatamente como o exame
        funciona, como calcular a nota que você precisa e, o mais importante, como criar um plano de estudos focado para
        ter sucesso.
      </p>

      <h2>Entendendo a Mecânica do Exame: Como Funciona?</h2>
      <p>
        Primeiro, vamos desmistificar o cálculo. Se sua média final bimestral (composta pela prova regular + atividades
        do AVA) ficou abaixo de 5,0, você está habilitado a fazer o exame. A sua nova média final será calculada com uma
        fórmula simples, mas poderosa:
      </p>
      <div
        className="bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 my-6"
        role="alert">
        <p className="font-bold text-center text-lg">A Fórmula da Aprovação</p>
        <p className="text-center font-mono text-xl mt-2">(Sua Média Final Bimestral + Nota do Exame) / 2 ≥ 5,0</p>
      </div>
      <p>
        Isso significa que a nota do exame tem um peso de 50% na sua nova média. É uma chance real de virar o jogo, pois
        uma boa nota no exame pode compensar uma média bimestral baixa.
      </p>

      <h2>Seu Plano de Batalha em 3 Passos</h2>
      <p>
        Saber a fórmula é só o começo. A aprovação vem da estratégia. Siga estes três passos para maximizar suas
        chances.
      </p>
      <ol>
        <li><strong>Passo 1: Aceitar e Calcular seu Alvo</strong>
          <p>A primeira atitude é deixar a frustração de lado e agir. Antes mesmo de abrir um livro, sua primeira tarefa
            é descobrir qual é o seu "número mágico". Qual a nota exata que você precisa tirar no exame?</p>
          <p>
            Para isso, use a nossa <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Calculadora
            UNIVESP</Link> e vá direto para a aba <strong>"Simular Exame"</strong>. Insira sua média final bimestral
            (aquela abaixo de 5,0) e a ferramenta te dirá instantaneamente a nota mínima necessária para a aprovação.
            Saber seu alvo transforma a ansiedade em um objetivo claro e alcançável.
          </p>
        </li>
        <li><strong>Passo 2: Faça um Diagnóstico Preciso (Onde Você Errou?)</strong>
          <p>Não estude às cegas. Volte à sua prova regular e às atividades do AVA. Faça uma análise honesta:</p>
          <ul>
            <li>Quais tópicos ou semanas de estudo concentraram seus erros?</li>
            <li>Foi falta de compreensão do conteúdo teórico ou dificuldade em aplicar o conhecimento em questões
              práticas?
            </li>
            <li>Você teve problemas com a gestão do tempo durante a prova?</li>
          </ul>
          <p>Seja brutalmente honesto. Identificar suas fraquezas é a forma mais inteligente de direcionar seu tempo de
            estudo. Não adianta revisar o que você já sabe.</p>
        </li>
        <li><strong>Passo 3: Crie um Plano de Estudo Focado</strong>
          <p>Com seu alvo definido e suas fraquezas diagnosticadas, crie um cronograma realista. Se você tem uma semana
            até o exame, por exemplo:</p>
          <ul>
            <li><strong>Dias 1-3:</strong> Foco total nos tópicos que você identificou como pontos fracos. Reveja os
              vídeos, refaça os exercícios e, se preciso, procure materiais de apoio.
            </li>
            <li><strong>Dias 4-5:</strong> Faça uma revisão geral de todo o conteúdo da disciplina, mas de forma ativa.
              Tente explicar os conceitos em voz alta para si mesmo, como se estivesse dando uma aula.
            </li>
            <li><strong>Dia 6:</strong> Simule as condições da prova. Resolva uma lista de exercícios ou uma prova
              antiga (se disponível) cronometrando o tempo.
            </li>
            <li><strong>Véspera:</strong> Revise apenas anotações e mapas mentais. Não tente aprender conteúdo novo.
              Priorize uma boa noite de sono.
            </li>
          </ul>
        </li>
      </ol>

      <h2>No Dia do Exame: Mentalidade de Sucesso</h2>
      <p>
        Chegue com calma. Você não está indo para uma prova sobre um conteúdo desconhecido; você está indo para uma
        segunda chance em um terreno que já explorou. Respire fundo, leia cada questão com atenção e comece por aquelas
        que você tem mais segurança. Lembre-se do seu plano e confie na sua preparação.
      </p>
    </>
  );
};