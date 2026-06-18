# Controle de Denúncias Escolares

Sistema web protegido para registrar e acompanhar denúncias recebidas de escolas credenciadas.

## Arquitetura

- **GitHub:** código-fonte e histórico de alterações.
- **Vercel:** site público, HTTPS e funções protegidas da IA.
- **Firebase Authentication:** acesso por e-mail e senha.
- **Cloud Firestore:** escolas, denúncias e numeração anual.
- **Firebase Storage:** fotos e documentos.
- **OpenAI Responses API:** formalização opcional dos relatos.

## Configuração do Firebase

1. Crie um projeto no Firebase.
2. Registre um aplicativo Web.
3. Ative **Authentication > E-mail/senha**.
4. Crie o banco **Cloud Firestore**.
5. Ative **Storage**.
6. Publique `firestore.rules` e `storage.rules`.
7. Em **Authentication > Usuários**, crie as contas autorizadas. O sistema não oferece cadastro público.
8. Adicione o domínio final da Vercel aos domínios autorizados do Authentication.

## Variáveis da Vercel

Copie os nomes de `.env.example` para os ambientes Production, Preview e Development:

```text
OPENAI_API_KEY
OPENAI_MODEL
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

`OPENAI_API_KEY` é secreta. Os valores `FIREBASE_*` do aplicativo Web são identificadores públicos, mas ficam centralizados na configuração da Vercel.

## Desenvolvimento local

Defina as variáveis no terminal e execute:

```powershell
node server.js
```

Acesse `http://127.0.0.1:8765`.

## Segurança e privacidade

- Usuários anônimos não acessam Firestore nem Storage.
- A chave da OpenAI fica somente na função serverless.
- O endpoint da IA valida a sessão do Firebase.
- Anexos são limitados a 10 MB.
- A IA é instruída a preservar os fatos e não inventar informações.
- O texto gerado deve ser revisado antes do registro.

Como os relatos podem conter dados pessoais ou sensíveis, mantenha somente usuários autorizados, revise periodicamente os acessos e configure alertas de orçamento no Google Cloud/Firebase e na OpenAI.

## Recursos

- Numeração automática anual no formato `001/2026`
- Data e horário automáticos
- 83 escolas pré-cadastradas
- Classificação por gravidade
- Fotos e documentos
- Pesquisa, filtros e dashboard
- Exportação CSV e backup JSON
- Formalização do relato com IA
