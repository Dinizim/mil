import type { Metadata } from "next";
import Link from "next/link";

import LegalPage, { ContactLine } from "@/components/legal/LegalPage";
import { PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidade · Mil" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Política de privacidade">
      <section>
        <p>
          O Mil é um aplicativo de controle financeiro pessoal. Esta política explica quais dados pessoais tratamos, por que,
          por quanto tempo e como você exerce seus direitos previstos na Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).
        </p>
      </section>

      <section>
        <h2>1. Quem é o controlador</h2>
        <p>
          O Mil é mantido por Nicollas Diniz Fernandes, controlador dos dados tratados no app. Contato para assuntos de
          privacidade: <ContactLine email={PRIVACY_EMAIL} />.
        </p>
      </section>

      <section>
        <h2>2. Dados que tratamos</h2>
        <ul>
          <li><strong>Conta:</strong> nome, e-mail, senha (guardada apenas como hash pelo provedor de autenticação), forma de login e data e versão do aceite destes termos.</li>
          <li><strong>Login com Google:</strong> nome, e-mail e identificador da conta Google, enviados pelo Google quando você escolhe essa opção.</li>
          <li><strong>Dados financeiros que você digita ou importa:</strong> transações, categorias, metas e aportes.</li>
          <li><strong>Dados técnicos:</strong> cookies de sessão necessários para manter você conectado.</li>
        </ul>
        <p className="mt-2">Arquivos de extrato (OFX/CSV) são lidos no seu navegador; apenas as transações que você confirma são salvas.</p>
      </section>

      <section>
        <h2>3. Para que usamos e com qual base legal</h2>
        <ul>
          <li>Prestar o serviço (mostrar saldo, metas, relatórios): execução de contrato (art. 7º, V).</li>
          <li>Segurança da conta e prevenção de fraudes: legítimo interesse (art. 7º, IX).</li>
          <li>Guardar registros quando a lei exigir: cumprimento de obrigação legal (art. 7º, II).</li>
        </ul>
        <p className="mt-2">Não vendemos seus dados, não usamos para publicidade e não fazemos perfilamento.</p>
      </section>

      <section>
        <h2>4. Com quem compartilhamos</h2>
        <p>
          Usamos operadores que processam dados em nosso nome: Supabase (banco de dados e autenticação), o provedor de
          hospedagem do site e, se você escolher, o Google (login). Esses serviços podem manter servidores fora do Brasil; nesse
          caso, a transferência segue o art. 33 da LGPD, com fornecedores que oferecem garantias contratuais de proteção.
        </p>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>
          Usamos apenas cookies estritamente necessários para manter sua sessão. Não usamos cookies de análise ou publicidade.
          A preferência de ocultar valores fica salva só no seu navegador.
        </p>
      </section>

      <section>
        <h2>6. Por quanto tempo guardamos</h2>
        <p>
          Enquanto sua conta existir. Transações e categorias canceladas ficam guardadas para preservar o seu histórico. Ao
          excluir a conta, todos os dados são apagados de forma definitiva, salvo o que a lei obrigar a manter.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>Você pode, de graça e a qualquer momento:</p>
        <ul>
          <li>ver quais dados guardamos e corrigir nome e e-mail em <Link href="/profile">Meu Perfil</Link>;</li>
          <li>exportar todos os seus dados (JSON ou CSV) em <Link href="/profile/privacy">Privacidade e dados</Link>;</li>
          <li>excluir sua conta e todos os dados na mesma página;</li>
          <li>pedir informações sobre o tratamento ou fazer qualquer outra solicitação pelo contato de privacidade;</li>
          <li>reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
      </section>

      <section>
        <h2>8. Segurança e incidentes</h2>
        <p>
          Os dados trafegam com criptografia (HTTPS) e cada usuário só acessa os próprios registros, regra aplicada no próprio
          banco de dados. Se ocorrer um incidente de segurança que possa trazer risco relevante, avisaremos você e a ANPD nos
          prazos da Resolução CD/ANPD nº 15/2024.
        </p>
      </section>

      <section>
        <h2>9. Mudanças nesta política</h2>
        <p>Quando houver mudança relevante, avisaremos no app e a data da versão no topo desta página será atualizada.</p>
      </section>
    </LegalPage>
  );
}
