import Link from "next/link";

export const ProjetoIntegrador = () => {
  return (
    <>
      <p className="lead">
        O Projeto Integrador (PI) é mais do que um simples trabalho em grupo; é um componente curricular obrigatório
        e a espinha dorsal do modelo pedagógico da UNIVESP. Este guia, baseado nos regulamentos oficiais,
        vai te ajudar a entender sua estrutura, objetivos e o caminho para obter uma ótima nota.
      </p>

      <h2>O Objetivo Real do Projeto Integrador</h2>
      <p>
        A UNIVESP define o PI como uma "prática pedagógica" que busca conectar a teoria com a prática.
        Em vez de apenas aprender conceitos isolados em cada disciplina, o objetivo é que você e seu grupo usem
        esse conhecimento de forma articulada para propor soluções a um "problema norteador" real.
      </p>
      <p>De acordo com o regulamento oficial, o PI serve para desenvolver competências essenciais, como:</p>
      <ul>
        <li>O trabalho em equipe e a colaboração.</li>
        <li>A capacidade de resolver problemas complexos.</li>
        <li>Uma visão ética, crítica e humanística na sua área de atuação.</li>
        <li>A aplicação prática e integrada do conteúdo das disciplinas do seu eixo de formação.</li>
      </ul>

      <h2>Quem é Quem no Projeto Integrador?</h2>
      <p>
        Você não está sozinho. O processo é guiado por profissionais com papéis bem definidos:
      </p>
      <ul>
        <li><strong>Estudantes:</strong> Responsáveis por formar os grupos (de 4 a 6 integrantes), participar ativamente
          das discussões, realizar as tarefas e, o mais importante, elaborar o Relatório Técnico-Científico e o vídeo de
          apresentação.
        </li>
        <li><strong>Tutor:</strong> É o seu ponto de contato principal no polo. Ele acompanha o andamento dos projetos,
          media as discussões nos fóruns do grupo no AVA e avalia as entregas.
        </li>
        <li><strong>Professor Mediador (Orientador):</strong> É o especialista no tema. Ele propõe o problema norteador,
          orienta os grupos na parte teórica e metodológica e participa da avaliação final.
        </li>
      </ul>

      <h2>As Etapas Claras da Avaliação</h2>
      <p>
        O PI é um processo contínuo, não um trabalho de uma noite só. A avaliação é dividida em etapas claras,
        culminando na nota final de 0 a 10.
      </p>
      <ol>
        <li><strong>Postagem Inicial:</strong> O primeiro passo, onde os grupos são formados e apresentam um plano de
          trabalho inicial.
        </li>
        <li><strong>Entregas Parciais:</strong> Ao longo do bimestre, o grupo entrega partes do relatório para receber
          feedback do tutor. É a chance de corrigir o rumo!
        </li>
        <li><strong>Entrega Final:</strong> Nesta fase, vocês entregam as duas peças-chave da avaliação:
          <ul>
            <li>O <strong>Relatório Técnico-Científico Final</strong>, consolidando toda a pesquisa e a solução
              proposta.
            </li>
            <li>O <strong>Vídeo de Socialização</strong>, uma apresentação curta e objetiva do projeto (geralmente de 3
              a 5 minutos).
            </li>
          </ul>
        </li>
      </ol>
      <div
        className="bg-yellow-100 dark:bg-yellow-800 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 my-6"
        role="alert">
        <p className="font-bold">Atenção ao Plágio!</p>
        <p>O regulamento é explícito: a identificação de plágio em qualquer parte do trabalho resultará na atribuição de
          nota <strong>zero</strong> ao grupo. Todo o conteúdo deve ser original ou devidamente citado.</p>
      </div>
      <p>
        Para planejar suas notas bimestrais e ver o peso do PI no seu semestre, não deixe de usar nossa <Link href="/">Calculadora
        de Médias da UNIVESP</Link>.
      </p>
    </>

  );
};