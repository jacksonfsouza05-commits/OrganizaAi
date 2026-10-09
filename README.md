# AvisAí

Front em React + Vite, back em Node (Express) com banco PostgreSQL.

```
/            front (src/)
/server      API (src/), schema em sql/schema.sql
```

## Rodando local

Precisa de Node 20+ e de um Postgres (pode ser o do Aiven, veja abaixo).

**Back**

```bash
cd server
npm install
cp .env.example .env     # preencha DATABASE_URL e JWT_SECRET
npm run migrate          # cria as tabelas
npm run seed             # opcional: cria lucas@email.com / senha123 com dados de exemplo
npm run dev
```

**Front** (na raiz)

```bash
pnpm install             # ou npm install
cp .env.example .env     # VITE_API_URL aponta pra API
PORT=5173 pnpm dev
```

Se o front rodar em outra porta, coloque a URL dele em `FRONT_URL` no `.env` do server.

## Usando o banco do Aiven

1. Crie conta em https://aiven.io e faça login no console.
2. **Create service** → escolha **PostgreSQL**.
3. Em plano, escolha o **Free** (se aparecer pra sua conta) e uma região perto de você. Dê um nome, tipo `avisai-db`, e crie.
4. Espere o status ficar **Running** (leva uns minutos).
5. Na página **Overview** do serviço você acha:
   - **Service URI**: é a `DATABASE_URL`, algo como `postgres://avnadmin:SENHA@host-xxxx.aivencloud.com:12345/defaultdb?sslmode=require`
   - **CA certificate**: botão de download. Salve como `server/ca.pem`.
6. No `server/.env`:
   ```
   DATABASE_URL=<cole o Service URI>
   DB_CA_PATH=./ca.pem
   JWT_SECRET=<uma string grande e aleatória>
   ```
   Pra gerar o segredo: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
7. `npm run migrate` pra criar as tabelas lá no Aiven e `npm run seed` se quiser os dados de exemplo.
8. Pra conferir, abra o **Query editor** / use o `psql` com a URI e rode `\dt`. Devem aparecer `estudantes`, `materias`, `atividades` e `conteudos`.

Se der erro de conexão, veja em **Allowed IP addresses** do serviço se o seu IP (ou `0.0.0.0/0` pra testar) está liberado.

Nunca suba o `.env` nem o `ca.pem` pro GitHub (já estão no `.gitignore` do server).

## Modelo do banco

- `estudantes` 1—N `materias` 1—N `atividades`
- `materias` 1—N `conteudos`
- O status da atividade (pendente / prazo próximo / concluída) não é salvo: é calculado pelo prazo, pela antecedência que o estudante escolheu e pelo campo `concluida`.
- O progresso das matérias também é calculado (atividades concluídas / total).

## Rotas

Tudo em `/api`, menos login e cadastro exige `Authorization: Bearer <token>`.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/registrar` | cria conta |
| POST | `/auth/entrar` | login, devolve o token |
| GET / PUT | `/auth/eu` | dados e preferências do estudante |
| PUT | `/auth/senha` | troca a senha |
| GET / POST | `/atividades` | lista / cria |
| PUT / DELETE | `/atividades/:id` | edita / exclui |
| PATCH | `/atividades/:id/concluir` | conclui (ou reabre com `{"concluida": false}`) |
| GET / POST | `/materias` | lista / cria |
| DELETE | `/materias/:id` | exclui (apaga atividades e conteúdos dela) |
| GET / POST | `/materias/:id/conteudos` | lista / cria conteúdos |
| PATCH | `/conteudos/:id/estudado` | marca como estudado |
| GET | `/notificacoes` | atividades perto do prazo ou atrasadas |

## O que ainda não existe

- Recuperar senha por e-mail (precisa de um serviço de envio).
- Os avisos por e-mail (resumo diário e semanal): hoje só a preferência é salva. O sino do topo funciona.
- Leitura de verdade de PDF/imagem na importação: o arquivo escolhido só sugere o nome da atividade.
- "Explicação simples" é digitada por você ao cadastrar o conteúdo, não é gerada por IA.
