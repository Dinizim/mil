# Resposta a incidentes de segurança

Documento interno do Mil. Base: LGPD, art. 48, e Resolução CD/ANPD nº 15/2024.

> Levantamento técnico, não parecer jurídico. Revise com um advogado antes de lançar para o público.

## O que conta como incidente

Qualquer acesso, vazamento, alteração ou perda de dados pessoais sem autorização. Exemplos no Mil:

- chave `service_role` ou senha do banco exposta (commit, log, print);
- falha de RLS que deixa um usuário ver dados de outro;
- acesso indevido ao painel do Supabase, à Vercel ou ao GitHub;
- perda de dados sem backup.

## Primeiras horas

1. **Conter.** Rotacione as chaves expostas (Supabase → Project Settings → API e Database), revogue sessões
   (`auth.sessions`), tire do ar a rota ou o deploy com problema.
2. **Registrar.** Abra o registro do incidente (modelo abaixo) com data e hora da descoberta.
3. **Avaliar o risco.** Dados financeiros e credenciais estão na lista de dados que, em regra, geram risco relevante.
   Descubra quais usuários e quais dados foram afetados (logs do Supabase e da Vercel).

## Prazos de comunicação

| Para quem | Quando | Como |
| --- | --- | --- |
| ANPD | Até **3 dias úteis** da ciência do incidente com risco relevante (agentes de pequeno porte: **6 dias úteis**) | Formulário de comunicação de incidente no site da ANPD |
| Usuários afetados | Mesmo prazo | E-mail individual (modelo abaixo) e aviso no app |

Se ainda faltar informação no prazo, comunique o que já se sabe e complemente depois.

## Responsáveis

| Papel | Quem |
| --- | --- |
| Decide e comunica | Responsável pelo Mil (controlador) |
| Investiga e corrige | Desenvolvedor de plantão |
| Contato com titulares | E-mail de privacidade (`NEXT_PUBLIC_PRIVACY_EMAIL`) |

## Modelo de e-mail aos usuários

> **Assunto:** Aviso de incidente de segurança no Mil
>
> Olá, [nome].
>
> Em [data], identificamos [descrição curta do que aconteceu]. Os dados possivelmente afetados são: [lista].
>
> O que já fizemos: [medidas de contenção].
> O que recomendamos: [ex.: trocar a senha, desconfiar de mensagens pedindo dados].
>
> Se tiver dúvidas, responda este e-mail ou escreva para [e-mail de privacidade].

## Registro do incidente (guardar por 5 anos)

- Data e hora da ocorrência e da descoberta
- Descrição do incidente e causa
- Dados e número de titulares afetados
- Avaliação de risco e justificativa
- Medidas de contenção e correção
- Datas das comunicações à ANPD e aos titulares (ou motivo de não comunicar)

## Prevenção

- Nunca registrar valores, descrições ou e-mails em `console.log` ou serviços de monitoramento.
- `SUPABASE_SERVICE_ROLE_KEY` só no servidor e nunca com prefixo `NEXT_PUBLIC_`.
- Revisar políticas RLS a cada migration.
