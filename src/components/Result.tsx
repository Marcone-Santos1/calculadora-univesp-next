import {MdCheck, MdClose} from "react-icons/md";
import {ResultProp} from "@/Contracts/ResultProp";

export function Result({showResult, result, isSimulation}: ResultProp) {
    return <>
        {showResult && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
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
            </div>
        )}
    </>;
}