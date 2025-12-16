import { CrCalculator } from "@/components/CrCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Calculadora de CR Univesp | Coeficiente de Rendimento',
    description: 'Calcule seu CR (Coeficiente de Rendimento) global da Univesp. Simulador de histórico escolar e média ponderada.',
};

export default function CrPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Calculadora de CR 📈</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Descubra a sua média global ponderada. Essencial para intercâmbios, transferências e currículo.
                    </p>
                </div>
                <CrCalculator />
                
                <div className="mt-8 prose dark:prose-invert mx-auto text-sm text-gray-500">
                    <h3>Como o CR é calculado?</h3>
                    <p>O Coeficiente de Rendimento é a média ponderada das notas, onde o peso é a carga horária da disciplina. A fórmula usada é:</p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded">CR = Σ(Nota × Carga Horária) ÷ Σ(Carga Horária)</pre>
                </div>
            </div>
        </div>
    );
}