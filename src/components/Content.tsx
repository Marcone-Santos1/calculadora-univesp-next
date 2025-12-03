export const Content = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">Como funciona e como calcular sua média na Univesp</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Calculadora Univesp de Média
              Final</h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">Quer saber sua média final com base nas
              notas do
              semestre? Nossa ferramenta faz o cálculo para você!</p>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
              <li>Média final de provas e atividades</li>
              <li>Considera o peso de cada avaliação</li>
              <li>Resultado imediato</li>
            </ul>
          </div>
          <div className="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Simulador de Nota
              Final Univesp</h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">Precisa tirar uma nota mínima no exame
              final de
              recuperação para
              passar? Descubra qual é a nota necessária com nosso simulador de nota Univesp.</p>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
              <li>Simulação da nota mínima</li>
              <li>Vários cenários de aprovação</li>
              <li>Fácil de usar</li>
            </ul>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Cálculo da Média Univesp com
              Exame</h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">Se sua instituição permite exames finais de
              recuperação,
              nossa
              ferramenta faz o cálculo da média considerando o exame.</p>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
              <li>Considera notas e o exame final</li>
              <li>Cálculos automáticos</li>
              <li>Resultados rápidos e precisos</li>
            </ul>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ferramenta Gratuita
              e Simples</h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">Nossa calculadora é 100% gratuita,
              disponível a
              qualquer hora e fácil de usar. Ideal para estudantes de todos os níveis!</p>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
              <li>Grátis para sempre</li>
              <li>Acessível de qualquer dispositivo</li>
              <li>Sem necessidade de login</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Disciplinas bimestrais
            regulares</h3>

          <p className="text-gray-700 dark:text-gray-400 mb-4">
            Nas disciplinas bimestrais regulares, existem três instrumentos independentes e
            articulados para verificação da aprendizagem das habilidades e conteúdos propostos:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
            <li>40% da nota é composta por atividades avaliativas propostas ao longo do bimestre e
              realizadas no próprio AVA.
            </li>
            <li>Os outros 60% são da prova presencial, realizada ao fim do bimestre no polo,
              conforme o Calendário Acadêmico de cada curso e o horário da turma. No AVA, os
              professores informam, na última semana da disciplina, se há necessidade de levar
              algum material específico para a realização da prova.
            </li>
            <li>Estudantes que não obtiverem a média necessária para a aprovação poderão realizar o
              exame final da disciplina.
            </li>
          </ul>


          <p className="text-gray-700 dark:text-gray-400 mb-4">
            <strong>Observação</strong>: A pontuação do exame varia de 0 (zero) a 10 (dez). Para
            calcular a média final após a prova de exame, soma-se a nota de exame à média obtida
            anteriormente (Média final na disciplina no bimestre, composta pela prova regular e
            atividades realizadas no AVA); esse total é dividido por dois e o resultado será a média
            final do aluno na respectiva disciplina, após exame.
          </p>

          <p className="text-gray-700 dark:text-gray-400 mb-4">Conheça termos e alguns detalhes sobre sua
            prova: <a
              href="https://apps.univesp.br/glossario-de-provas/">Glossário de provas</a></p>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Cálculo da Média</h3>

          <p className="text-gray-700 dark:text-gray-400 mb-4">
            Cálculo da Média Final:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
            <li>(Nota da Prova Regular x 0,6) + (Média das notas obtidas nas atividades x 0,4)
              = Média final na disciplina no bimestre.
            </li>
            <li>Maior que 5 → Aprovado
            </li>
            <li>Menor que 5 → em Exame.
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Cálculo da Média</h3>

          <p className="text-gray-700 dark:text-gray-400 mb-4">
            Cálculo da Média Final com Exame:
          </p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
            <li>(Nota final da disciplina no bimestre + Nota de exame) ÷ 2 = Média final após o exame
            </li>
            <li>Maior que 5 → Aprovado
            </li>
            <li>Menor que 5 → Reprovado.
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Perguntas Frequentes</h3>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
            <li><strong>Como calcular a média final na Univesp?</strong> Basta inserir suas notas nas provas e atividades. Nossa calculadora faz o cálculo automático conforme as regras da instituição.</li>
            <li><strong>Qual nota preciso para passar no exame final?</strong> O simulador mostra exatamente qual é a nota mínima necessária para ser aprovado.</li>
            <li><strong>A calculadora funciona para todos os cursos?</strong> Sim, ela segue as regras padrão da Univesp aplicáveis a todas as disciplinas bimestrais.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}