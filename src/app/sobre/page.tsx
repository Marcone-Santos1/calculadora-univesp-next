export default function SobrePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          Sobre este Projeto
        </h1>
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
          <p className="mb-4">
            Olá! Meu nome é Marcone Santos e sou o criador desta calculadora. Atualmente, estou cursando o
            <strong> Bacharelado em Tecnologia da Informação na UNIVESP</strong>.
          </p>
          <p className="mb-4">
            Criei esta ferramenta com um objetivo simples: ajudar meus colegas (e a mim mesmo!) a navegar
            pelo sistema de avaliação da nossa universidade de uma forma mais clara e sem estresse.
            Como aluno, sei que entender os pesos das notas, simular cenários para o exame e planejar o
            bimestre pode ser confuso, e uma ferramenta visual e direta faz toda a diferença.
          </p>
          <p className="mb-4">
            Este projeto foi desenvolvido com tecnologias modernas que aprendo no dia a dia, como React,
            TypeScript e TailwindCSS. Ele é um reflexo prático dos meus estudos e da minha paixão por
            criar soluções que resolvem problemas reais.
          </p>
          <p>
            Espero que a Calculadora UNIVESP seja tão útil para você quanto tem sido para mim. Se tiver
            sugestões ou encontrar algum problema, não hesite em me contatar. Bons estudos para nós!
          </p>
        </div>
      </div>
    </div>
  );
};