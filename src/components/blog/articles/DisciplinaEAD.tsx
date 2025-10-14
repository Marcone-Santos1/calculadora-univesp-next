import Link from "next/link";

export const DisciplinaEAD = () => {
  return (
    <>
      <p className="lead">
        Uma das maiores promessas do Ensino a Distância (EAD) é a flexibilidade. Estudar na hora que quiser, de onde
        estiver. Na UNIVESP, essa autonomia é um pilar. No entanto, para muitos, essa liberdade pode se transformar em
        uma armadilha silenciosa chamada procrastinação. Se a falta de um horário fixo e de um professor te cobrando
        presencialmente já te fez deixar a matéria acumular, este artigo é para você. Vamos transformar essa liberdade
        em sua maior aliada.
      </p>

      <h2>Entendendo o Inimigo: Por que a Procrastinação Acontece no EAD?</h2>
      <p>
        No ensino presencial, o ambiente te "força" a entrar no modo de estudo. Você se desloca, entra na sala, e o
        contexto muda. No EAD, a sala de aula é também sua sala de estar, seu quarto, o mesmo lugar onde você assiste a
        séries e relaxa. Nosso cérebro, que adora atalhos, muitas vezes não consegue fazer a "virada de chave". A
        ausência de horários rígidos e da pressão social dos colegas ao redor cria o terreno perfeito para o famoso
        "depois eu faço".
      </p>

      <h2>Estratégias Práticas para Construir sua Fortaleza da Disciplina</h2>
      <p>
        Disciplina não é um dom, é um sistema. Você não precisa de mais motivação, você precisa de melhores hábitos.
        Aqui estão três estratégias fundamentais para construir o seu sistema.
      </p>
      <ol>
        <li><strong>Crie um "Ritual de Início":</strong> Seu cérebro precisa de um gatilho claro que diga: "A hora de
          estudar começou". Não precisa ser nada complexo. Pode ser:
          <ul>
            <li>Trocar de roupa (tirar o pijama é um ato poderoso!).</li>
            <li>Preparar uma xícara de café ou chá e levá-la para sua mesa de estudos.</li>
            <li>Organizar seu material físico ou digital por 5 minutos antes de começar.</li>
          </ul>
          <p>A repetição desse pequeno ritual treina seu cérebro para associar essa ação ao foco e à concentração.</p>
        </li>
        <li><strong>Faça um Contrato com Você Mesmo: O Poder do Time Blocking</strong>
          <p>A tarefa "estudar para a prova" é vaga e assustadora. A tarefa "ler as páginas 20 a 35 do PDF da Semana 4,
            das 19h às 20h" é específica e realizável. Use uma agenda (Google Agenda, Notion ou até um planner de papel)
            e bloqueie horários fixos para seus estudos como se fossem compromissos inadiáveis.</p>
          <blockquote>
            <p className="italic">"Não trate seus estudos como algo que você fará 'quando tiver tempo'. Trate-os como
              uma reunião importante com a pessoa mais crucial para o seu sucesso: você mesmo."</p>
          </blockquote>
        </li>
        <li><strong>Domine a Arte das Pequenas Vitórias: A Regra dos 2 Minutos</strong>
          <p>A parte mais difícil de qualquer tarefa é começar. Para vencer a inércia, use a "Regra dos 2 Minutos",
            popularizada por James Clear. Simplifique a tarefa até que ela leve menos de dois minutos para ser feita.
            Por exemplo:</p>
          <ul>
            <li>"Estudar para a prova" se torna "Abrir o AVA e baixar o PDF da aula".</li>
            <li>"Escrever o rascunho do PI" se torna "Abrir o documento e escrever um único parágrafo".</li>
          </ul>
          <p>Uma vez que você começa, a probabilidade de continuar é muito maior. É sobre criar momentum.</p>
        </li>
      </ol>

      <h2>Ferramentas e Técnicas que Turbinam seu Foco</h2>
      <ul>
        <li><strong>Técnica Pomodoro:</strong> Estude focado por 25 minutos, faça uma pausa de 5. Repita. Após 4 ciclos,
          faça uma pausa maior de 15-30 minutos. Isso combate a fadiga mental e mantém a concentração alta.
        </li>
        <li><strong>Mapas Mentais:</strong> Em vez de apenas ler ou grifar, crie mapas mentais para conectar os
          conceitos. É uma forma de estudo ativo que força seu cérebro a processar a informação, melhorando a retenção.
        </li>
        <li><strong>Grupos de Estudo no WhatsApp/Discord:</strong> Combine com colegas horários para estudar "juntos",
          mesmo que à distância. O simples ato de ter um compromisso com outras pessoas aumenta drasticamente sua
          responsabilidade.
        </li>
      </ul>
      <p>
        Lembre-se, o objetivo é criar um sistema sustentável. Para planejar o quanto você precisa estudar para alcançar
        suas metas, não deixe de usar nossa <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Calculadora
        de Notas da UNIVESP</Link>. Ver o número exato que você precisa pode ser um grande motivador!
      </p>
    </>
  );
};