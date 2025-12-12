import { SITE_CONFIG } from "@/utils/Constants";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade e Termos de Uso | Calculadora Univesp",
  description: "Entenda como tratamos seus dados, o uso de cookies e nossas isenções de responsabilidade.",
  robots: {
    index: true,
    follow: true,
  }
};

export default function PrivacyPage() {
  const lastUpdate = "12 de Dezembro de 2025"; // Mantenha atualizado

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12">

        <header className="mb-10 border-b border-gray-100 dark:border-gray-700 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidade e Termos de Uso
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Última atualização: {lastUpdate}
          </p>
        </header>

        <article className="prose prose-blue dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Isenção de Responsabilidade (Disclaimer)</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-0">
                O site <strong>Calculadora Univesp</strong> é um projeto independente e Open Source, desenvolvido por alunos para alunos.
                <strong> NÃO possuímos nenhum vínculo oficial</strong> com a UNIVESP (Universidade Virtual do Estado de São Paulo).
              </p>
            </div>
            <p className="mt-4">
              Todas as marcas registradas, logotipos e nomes de disciplinas citados pertencem aos seus respectivos proprietários.
              As ferramentas de cálculo são estimativas baseadas nas regras conhecidas, e não substituem os canais oficiais da universidade (AVA/Portal do Aluno).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Coleta de Dados</h2>
            <p>Para o funcionamento da plataforma, coletamos os seguintes dados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Autenticação:</strong> Ao fazer login com o Google, recebemos seu nome, endereço de e-mail e foto de perfil (avatar).</li>
              <li><strong>Dados de Uso:</strong> Armazenamos suas interações, como questões resolvidas, comentários postados e votos em alternativas, para gerar seu histórico e gamificação.</li>
              <li><strong>Logs Automáticos:</strong> Como a maioria dos sites, coletamos logs de servidor que podem incluir seu endereço IP, tipo de navegador e páginas acessadas para fins de segurança e diagnóstico.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Publicidade e Cookies (Google AdSense)</h2>
            <p>
              Utilizamos o Google AdSense para exibir anúncios. O Google utiliza cookies para veicular anúncios com base em suas visitas anteriores a este ou a outros sites.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookie DART:</strong> O Google utiliza o cookie DART para exibir anúncios personalizados com base nos seus interesses.</li>
              <li>Você pode desativar o uso do cookie DART acessando as <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Configurações de anúncios do Google</a>.</li>
              <li>Parceiros terceiros também podem usar cookies para veicular anúncios. Recomendamos consultar as políticas de privacidade desses fornecedores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Google Analytics</h2>
            <p>
              Usamos o Google Analytics para entender como os visitantes usam o site (ex: quais páginas são mais populares).
              Os dados são anônimos e agregados. O Analytics também utiliza cookies para identificar sessões únicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Seus Direitos (LGPD)</h2>
            <p>
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais.</li>
              <li>Solicitar a correção de dados incompletos ou inexatos.</li>
              <li><strong>Solicitar a exclusão da sua conta:</strong> Você pode excluir sua conta e todos os dados associados a qualquer momento através da página de <Link href="/perfil/editar" className="text-blue-600 hover:underline">Configurações de Perfil</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Conteúdo Gerado pelo Usuário</h2>
            <p>
              Ao postar comentários ou submeter questões, você concede ao Calculadora Univesp uma licença perpétua e não exclusiva para exibir esse conteúdo.
              Reservamo-nos o direito de moderar ou remover conteúdos que violem direitos autorais, sejam ofensivos ou irrelevantes.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contato</h2>
            <p>
              Se tiver dúvidas sobre esta política, entre em contato conosco pelo e-mail: <br />
              <a href="mailto:ms5806166@gmail.com" className="text-blue-600 font-medium">ms5806166@gmail.com</a>
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}