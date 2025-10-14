import Link from "next/link";

export const GradeSystemGuide = () => {
  return (
    <>
        <p className="lead">
          Não há como negar: a prova presencial é o momento de maior peso no bimestre, valendo 60% da sua média.
          Mas encare isso não como pressão, e sim como uma oportunidade. Uma boa performance aqui pode significar
          a aprovação direta. Vamos traçar um plano de batalha para você chegar lá com confiança.
        </p>

        <h2>1. Estudo Reverso: Comece pelas Atividades Avaliativas</h2>
        <p>
          O volume de conteúdo de um bimestre pode ser assustador. Em vez de tentar reler tudo na ordem,
          use a engenharia reversa. Volte em todas as atividades avaliativas semanais do AVA.
        </p>
        <ul>
          <li><strong>Por que isso funciona?</strong> As questões dessas atividades são um mapa do que os professores consideram essencial. Os tópicos que aparecem ali têm altíssima probabilidade de serem cobrados na prova.</li>
          <li><strong>Como fazer?</strong> Refaça as questões, mas desta vez, para cada uma, se pergunte: "Qual conceito teórico está sendo testado aqui?". Anote esses conceitos e use-os como seu guia de revisão.</li>
        </ul>

        <h2>2. "Decodifique" o Professor na Última Semana</h2>
        <p>
          A última semana de conteúdo no AVA é ouro puro. Os professores geralmente gravam um vídeo de encerramento
          onde dão as dicas finais. Fique atento a frases como: "Prestem atenção especial em...", "É importante que vocês saibam...",
          ou quando eles dão pistas sobre o formato (múltipla escolha, dissertativa). Anote tudo.
        </p>

        <h2>3. Crie um "Kit de Prova" na Véspera</h2>
        <p>
          A ansiedade muitas vezes vem do medo de esquecer algo. Elimine esse fator na noite anterior. Prepare um kit:
        </p>
        <ul>
          <li>Documento de identificação com foto (RG ou CNH).</li>
          <li>Caneta esferográfica de tinta azul ou preta (leve mais de uma!).</li>
          <li>Garrafa de água transparente e sem rótulo.</li>
          <li>Algo pequeno para comer, se permitido (verifique as regras do seu polo).</li>
        </ul>
        <p>
          Deixar tudo pronto te dá a tranquilidade de focar apenas no conteúdo e em ter uma boa noite de sono.
        </p>

        <h2>4. A Calma é sua Melhor Ferramenta (pós-prova também)</h2>
        <p>
          Você saiu da prova. A adrenalina está alta e a dúvida bate: "Será que fui bem?". Em vez de ficar sofrendo com a incerteza por dias, use a lógica a seu favor.
        </p>
        <p>
          Abra a nossa <Link href="/">Calculadora UNIVESP</Link>, vá na aba <strong>"Simular Média Final"</strong>. Insira a média das suas atividades do AVA (que você já sabe) e pronto. A ferramenta te dirá exatamente qual nota você precisava ter tirado na prova para ser aprovado. Isso te dá um panorama imediato e te ajuda a planejar os próximos passos, seja relaxar ou começar a pensar no exame.
        </p>
    </>


  );
};