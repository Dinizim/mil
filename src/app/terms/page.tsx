import type { Metadata } from "next";
import Link from "next/link";

import LegalPage, { ContactLine } from "@/components/legal/LegalPage";
import { PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Termos de uso · Mil" };

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso">
      <section>
        <h2>1. O que é o Mil</h2>
        <p>
          O Mil é uma ferramenta gratuita de organização financeira pessoal. Ele registra as informações que você mesmo informa e
          faz cálculos a partir delas. O Mil não é banco, não movimenta dinheiro e não oferece consultoria financeira ou de
          investimentos.
        </p>
      </section>

      <section>
        <h2>2. Sua conta</h2>
        <ul>
          <li>Você é responsável pelos dados que cadastra e por manter sua senha em segredo.</li>
          <li>Cada conta é pessoal. Não use o Mil para guardar dados de terceiros sem autorização.</li>
          <li>Você pode excluir sua conta a qualquer momento em <Link href="/profile/privacy">Privacidade e dados</Link>.</li>
        </ul>
      </section>

      <section>
        <h2>3. Uso adequado</h2>
        <p>
          Não é permitido tentar acessar dados de outros usuários, sobrecarregar o serviço, explorar falhas de segurança ou usar
          o app para fins ilegais. Contas usadas dessa forma podem ser suspensas.
        </p>
      </section>

      <section>
        <h2>4. Disponibilidade e limites</h2>
        <p>
          Trabalhamos para manter o Mil disponível e correto, mas o serviço é oferecido como está, sem garantia de funcionamento
          ininterrupto. Os valores mostrados dependem do que você registrou; confira sempre com seu banco antes de tomar decisões.
          Recomendamos exportar seus dados periodicamente.
        </p>
      </section>

      <section>
        <h2>5. Privacidade</h2>
        <p>
          O tratamento dos seus dados pessoais segue a <Link href="/privacy">Política de privacidade</Link>, que faz parte destes
          termos.
        </p>
      </section>

      <section>
        <h2>6. Mudanças</h2>
        <p>
          Estes termos podem ser atualizados. Mudanças relevantes serão avisadas no app, e a data da versão no topo desta página
          será atualizada.
        </p>
      </section>

      <section>
        <h2>7. Contato e foro</h2>
        <p>
          Dúvidas: <ContactLine email={PRIVACY_EMAIL} />. Estes termos seguem a lei brasileira, e fica eleito o foro do domicílio do
          usuário.
        </p>
      </section>
    </LegalPage>
  );
}
