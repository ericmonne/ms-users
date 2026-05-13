# 🧩 ms-users

Microsserviço **backend + frontend** desenvolvido como parte do Tech Challenge — Fase 1 da FIAP.

O sistema oferece uma API REST completa para gerenciamento de usuários de uma plataforma de gestão de restaurantes, acompanhada de um painel web moderno e responsivo que consome essa API diretamente.

---

## 🗂️ Estrutura do projeto

```
tech-challenge-fiap-parte1/
├── ms-users/
│   ├── src/                         # Código-fonte Java (Spring Boot)
│   ├── frontend/                    # Painel web (HTML + CSS + JS)
│   │   ├── index.html
│   │   ├── styles/main.css
│   │   └── scripts/
│   │       ├── api.js               # Camada de comunicação com a API
│   │       ├── auth.js              # Login / Cadastro / Logout
│   │       ├── users.js             # CRUD de usuários
│   │       ├── ui.js                # Toast, modal, utilitários
│   │       └── app.js               # Bootstrap e roteador
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── .env.example
├── docs/
└── openapi/
```

---

## 📦 Tecnologias utilizadas

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 17 |
| Spring Boot | 3.4.4 |
| Spring Security | — |
| JWT (`com.auth0:java-jwt`) | — |
| PostgreSQL | 16.x |
| Flyway | — |
| Docker / Docker Compose | — |
| Maven | 3.9.x |

### Frontend
| Tecnologia | Uso |
|---|---|
| HTML5 / CSS3 / JavaScript | Sem frameworks externos |
| Inter (Google Fonts) | Tipografia |
| `npx serve` | Servidor de desenvolvimento local |

---

## 🚀 Executando localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execução**
- Node.js (para servir o frontend com `npx serve`)

### 1. Variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `ms-users/` (use `.env.example` como base):

```env
DB_USER=fiapuser
DB_PASS=fiappass123
```

> ⚠️ Os valores acima são apenas exemplos para uso local. Utilize credenciais de sua preferência.

### 2. Build e subida do backend

```bash
cd ms-users

# Constrói a imagem Docker da aplicação
docker build -t tech-challenge-fiap-01:latest .

# Sobe a aplicação + banco PostgreSQL
docker compose up -d
```

A API estará disponível em: **`http://localhost:8080`**

### 3. Servindo o frontend

Em outro terminal:

```bash
cd ms-users/frontend
npx -y serve . --listen 3000
```

Acesse o painel em: **`http://localhost:3000`**

---

## 🖥️ Painel Web (Frontend)

O frontend é uma SPA (Single Page Application) estática que se comunica diretamente com a API REST do backend.

### Funcionalidades

| Tela | Descrição |
|---|---|
| **Login** | Autenticação com login e senha, armazenamento do JWT em `sessionStorage` |
| **Cadastro** | Criação de conta com perfil OWNER ou CLIENT, incluindo endereço completo |
| **Lista de Usuários** | Grade paginada com busca/filtro por nome, login, e-mail e perfil *(requer OWNER)* |
| **Detalhes do Usuário** | Modal com dados completos e endereços |
| **Editar Usuário** | Modal de edição de dados cadastrais e endereço |
| **Alterar Senha** | Modal de troca de senha com validação da senha atual |
| **Ativar / Desativar** | Botões de ativação e desativação de conta |
| **Meu Perfil** | Dados do usuário autenticado com ações de edição |

### Controle de acesso

| Perfil | Permissões |
|---|---|
| `CLIENT` | Ver e editar o próprio perfil, alterar senha |
| `OWNER` | Todas as permissões de CLIENT + listar todos os usuários, ver detalhes, ativar/desativar |

> A paginação da lista de usuários utiliza **páginas baseadas em 1** (page=1 = primeira página), alinhado com a lógica do backend.

---

## 🔒 Autenticação

- Fluxo JWT: o token é gerado no login/cadastro e enviado no header `Authorization: Bearer <token>` em todas as requisições autenticadas.
- O Spring Security valida o token e carrega as permissões do usuário a partir do banco de dados em cada requisição.
- CORS configurado globalmente no `SecurityConfigurations` para aceitar requisições de qualquer origem (modo desenvolvimento).

---

## 🐘 Banco de Dados

- **PostgreSQL 16** gerenciado via Docker
- **Flyway** aplica as migrations automaticamente na inicialização
- Scripts de migration em: `src/main/resources/db/migration`
- Porta exposta localmente: `5444` (mapeada para `5432` interno)

### Histórico de migrations

| Versão | Descrição |
|---|---|
| V1 | Schema inicial |
| V2 | Renomeia zipcode |
| V3 | IDs migrados para UUID |
| V4 | Relação user ↔ address de 1:1 para 1:N |
| V5 | ON DELETE CASCADE na FK de endereço |
| V6 | Renomeia coluna active |

---

## 🧪 Executando testes

```bash
# Com Docker (sem precisar de Java local)
docker run --rm \
  -v $(pwd):/app \
  -w /app \
  -v $HOME/.m2:/root/.m2 \
  maven:3.9.6-eclipse-temurin-17 mvn test
```

Ou usando o script de CI local:

```bash
./local-continuous-integration.sh [patch|minor|major] [--skip-tests] [--no-cache]
```

- `patch`, `minor`, `major`: nível de versionamento semântico (padrão: `patch`)
- `--skip-tests`: pula a execução dos testes
- `--no-cache`: força rebuild do Maven sem cache local

---

## 🛠️ Scripts de automação

### `app-build.sh`

Gera novas imagens Docker com versionamento semântico automático:

```bash
./app-build.sh [patch|minor|major]
```

- Detecta a última versão da imagem (ex: `0.1.5`)
- Incrementa conforme o parâmetro
- Gera imagem com nova tag e tag `latest`

### `local-continuous-integration.sh`

Pipeline de CI local completo:
1. Para os serviços com Docker Compose
2. Executa os testes com Maven
3. Faz o build da imagem Docker
4. Sobe os serviços novamente

---

## 🐳 Docker

```bash
# Subir apenas o banco (útil durante desenvolvimento)
docker compose up db -d

# Subir tudo
docker compose up -d

# Parar e remover containers
docker compose down

# Remover imagens dangling
docker image prune -f
```

Imagens seguem versionamento semântico: `tech-challenge-fiap-01:0.0.1`, `tech-challenge-fiap-01:latest`, etc.

---

## 📄 Documentação da API

### Postman

- [Coleção Postman](./ms-users/guides/postman_collection/ms-users.postman_collection.json)
- [Ambiente Postman](./ms-users/guides/postman_collection/MS-USERS.postman_environment.json)

### Swagger / OpenAPI

Disponível após subir o backend:

```
http://localhost:8080/swagger-ui/index.html
```

### Java Docs

[Documentação Java Docs](https://anacarolcortez.github.io/tech-challenge-fiap-parte1/)

---

## 🔹 Referência dos Endpoints

Base path: `/users`

### `POST /users` — Criar usuário *(público)*

```json
// Request body
{
  "name": "string",
  "email": "string",
  "login": "string",
  "password": "string",
  "role": "OWNER | CLIENT",
  "address": [{
    "zipcode": "string",
    "street": "string",
    "number": 123,
    "complement": "opcional",
    "neighborhood": "string",
    "city": "string",
    "state": "SP"
  }]
}

// Response 200
{
  "user": { "id": "UUID", "name": "...", "email": "...", "login": "...", "role": "...", "address": [] },
  "tokenJWT": "string"
}
```

### `POST /users/login` — Autenticar *(público)*

```json
// Request body
{ "login": "string", "password": "string" }

// Response 200
{ "tokenJWT": "string" }
```

### `GET /users?size={size}&page={page}` — Listar usuários 🔐 *OWNER*

> `page` começa em **1**. Exemplo: `GET /users?size=9&page=1`

### `GET /users/{id}` — Buscar por ID 🔐

### `PUT /users/{id}` — Atualizar dados 🔐

```json
// Request body
{
  "name": "string",
  "email": "string",
  "login": "string",
  "address": [{ ... }]
}
```

### `PATCH /users/{id}?activate={true|false}` — Ativar / Desativar 🔐

### `PATCH /users/{id}/password` — Alterar senha 🔐

```json
// Request body
{ "oldPassword": "string", "newPassword": "string" }
```

---

## 📄 Licença

Este projeto é parte de um desafio educacional da FIAP. Uso livre para fins acadêmicos.