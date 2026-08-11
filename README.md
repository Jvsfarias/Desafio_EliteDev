# EliteDev — Plataforma de Ingressos

> Se for testar a versão no ar, dá uma olhada no DEPLOY_VERCEL.md — lá tem as contas e senhas pra fazer login.

---

## O que você vai precisar

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (com o Docker Compose embutido)
- Git

---

## Configurando o Backend

Entre na pasta `backend/` e copie o arquivo de exemplo:

```bash
cd backend
cp .env.example .env
```

Abra o `.env` e preencha:

```env
PORT=3000
NODE_ENV=development

# Escolha um usuário e senha para o MongoDB
MONGO_ROOT_USERNAME=elitedev
MONGO_ROOT_PASSWORD=sua_senha_aqui

# Use os mesmos valores acima nessa URI
MONGODB_URI=mongodb://elitedev:sua_senha_aqui@mongo:27017/elitedev?authSource=admin

# Qualquer string longa e aleatória serve
JWT_SECRET=coloque_algo_secreto_aqui

# Credenciais das contas criadas automaticamente no primeiro boot
SEED_ORGANIZADOR_EMAIL=organizador@gmail.com
SEED_ORGANIZADOR_PASSWORD=suasenha
SEED_PORTARIA_EMAIL=portaria@gmail.com
SEED_PORTARIA_PASSWORD=suasenha
SEED_CLIENTE1_EMAIL=cliente1@gmail.com
SEED_CLIENTE1_PASSWORD=suasenha
SEED_CLIENTE2_EMAIL=cliente2@gmail.com
SEED_CLIENTE2_PASSWORD=suasenha

# APIs externas (token do "the movie db" e a api key do ticketmaster)
TMDB_BEARER_TOKEN=
TICKETMASTER_API_KEY=
```

### APIs externas (opcional)

Sem essas chaves a aplicação funciona, mas as páginas de catálogo ficam vazias.

- **TMDB** (filmes): crie uma conta em [themoviedb.org](https://www.themoviedb.org/signup), vá em Configurações → API e copie o **Bearer Token (API Read Access Token)**.
- **Ticketmaster** (shows): crie uma conta em [developer.ticketmaster.com](https://developer.ticketmaster.com), crie um app e copie a **Consumer Key**.

### Subindo

```bash
docker compose up -d --build
```


## Configurando o Frontend

Na pasta `frontend/`, abra o arquivo `.env` e confirme que está apontando para o backend local:

```env
VITE_API_URL=http://localhost:3000/api
```

Depois é só instalar e rodar:

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**.

---

## Contas disponíveis

Na primeira vez que o backend sobe, ele cria automaticamente as contas abaixo (com as senhas que você definiu no `.env`):

| Perfil | E-mail padrão | Acesso |
|---|---|---|
| Organizador | organizador@gmail.com | Criar, editar e cancelar eventos; ver logs |
| Portaria | portaria@gmail.com | Validar ingressos via QR Code |
| Cliente 1 | cliente1@gmail.com | Comprar ingressos e acessar os próprios QR Codes |
| Cliente 2 | cliente2@gmail.com | Idem |

> O seed roda **uma única vez**. Se quiser resetar tudo, rode `docker compose down -v` para apagar o banco e suba novamente.

---


