import {MdCheck, MdClose, MdMenuBook} from "react-icons/md";
import {ResultProp} from "@/Contracts/ResultProp";
import Link from "next/link";

export function Result({showResult, result, isSimulation}: ResultProp) {

  const showStudyGuide = showResult && !isSimulation && result < 4.95;

  return <>
    {showResult && (
      <div
        className="mt-6 p-4 flex flex-col gap-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Resultado</h3>
          <div className="text-3xl font-bold mb-2">{result.toFixed(2)}</div>
          <div
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              isSimulation ? "bg-blue-100 text-blue-700"
                : result >= 4.95 ? result >= 5 ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >

            {isSimulation ? (
              <>
                <MdCheck className="text-xl"/>
                <span>Nota para passar</span>
              </>
            ) : result >= 4.95 ? result >= 5 ? (
              <>
                <MdCheck className="text-xl"/>
                <span>Aprovado</span>
              </>
            ) : (
              <>
                <MdCheck className="text-xl"/>
                <span>Pode ser arredondado</span>
              </>
            ) : (
              <>
                <MdClose className="text-xl"/>
                <span>Reprovado</span>
              </>
            )}
          </div>
        </div>

        {showStudyGuide && (
          <div className="p-4 bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full flex-shrink-0">
                <MdMenuBook className="text-2xl text-orange-600 dark:text-orange-200" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100">
                  Ficou de Exame? Não se preocupe!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3 leading-relaxed">
                  Preparamos um guia completo ensinando <strong>como calcular a nota exata</strong> que você precisa tirar no exame e estratégias para recuperar essa nota.
                </p>

                <Link
                  href="/blog/guia-exame-recuperacao-univesp"
                  className="inline-flex items-center text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors group"
                >
                  Ler Guia de Recuperação
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    )}
  </>;
}