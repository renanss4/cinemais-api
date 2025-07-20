# Cinemais API

## Descrição

API RESTful para gerenciamento de catálogo de mídias e lista de favoritos dos usuários da plataforma Cinemais.

## Escolhas Técnicas

### Framework: Fastify

Escolhi o **Fastify** neste projeto por ser uma solução leve, de alta performance e especialmente adequada para prototipagem rápida
e construção de APIs RESTful simples.

### Banco de Dados: MongoDB

Optei pelo **MongoDB** pelas seguintes razões:

- **Flexibilidade**: Estrutura de documentos permite evolução do schema sem migrações complexas
- **Integração com Node.js**: Driver nativo oficial bem maduro
- **Escalabilidade**: Facilita o crescimento horizontal da aplicação
- **Desenvolvimento ágil**: Reduz a complexidade de modelagem relacional para este caso de uso

## Tecnologias Utilizadas

- **Node.js 20+** - Runtime JavaScript
- **TypeScript** - Linguagem com tipagem estática
- **Fastify** - Framework web de alta performance
- **MongoDB** - Banco de dados NoSQL
- **Jest** - Framework de testes
- **Docker & Docker Compose** - Containerização

## Como Executar

### Pré-requisitos

- Node.js 20+ (conforme especificado em `.nvmrc`)
- Docker e Docker Compose (recomendado)
- NPM 10+

### Opção 1: Com Docker (Recomendado)

```bash
# Clone o repositório
git clone <link-repositorio>
cd cinemais-api

# Execute com Docker Compose (irá configurar MongoDB automaticamente)
docker-compose up --build

# A API estará disponível em http://localhost:3000
```

### Opção 2: Desenvolvimento Local

```bash
# Instale as dependências
npm install

# Configure o arquivo .env (crie baseado no exemplo abaixo)
# MONGODB_URI=mongodb://localhost:27017/cinemais
# PORT=3000

# Certifique-se que o MongoDB está rodando localmente
# Ou use uma instância na nuvem (MongoDB Atlas)

# Execute em modo desenvolvimento
npm start

# Para build de produção
npm run build
```

## Executar Testes

```bash
# Execute todos os testes
npm test

# Execute com relatório de cobertura
npm test -- --coverage

# Execute testes em modo watch (desenvolvimento)
npm test -- --watch
```

## Documentação dos Endpoints

### 1. Gerenciamento do Catálogo de Mídia

#### POST /media - Criar nova mídia

```bash
curl -X POST http://localhost:3000/media \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Matrix",
    "description": "Um filme sobre realidade virtual e simulação",
    "type": "movie",
    "releaseYear": 1999,
    "genre": "Ficção Científica"
  }'
```

**Resposta (201 Created):**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Matrix",
  "description": "Um filme sobre realidade virtual e simulação",
  "type": "movie",
  "releaseYear": 1999,
  "genre": "Ficção Científica",
  "createdAt": "2025-07-20T10:30:00.000Z",
  "updatedAt": "2025-07-20T10:30:00.000Z"
}
```

#### GET /media - Listar todas as mídias

```bash
curl http://localhost:3000/media
```

#### GET /media/{id} - Buscar mídia por ID

```bash
curl http://localhost:3000/media/507f1f77bcf86cd799439011
```

### 2. Gerenciamento de Usuários

#### POST /users - Criar usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com"
  }'
```

#### GET /users - Listar usuários

```bash
curl http://localhost:3000/users
```

#### GET /users/{id} - Buscar usuário por ID

```bash
curl http://localhost:3000/users/507f1f77bcf86cd799439011
```

### 3. Gerenciamento de Favoritos

#### POST /users/{userId}/favorites - Adicionar aos favoritos

```bash
curl -X POST http://localhost:3000/users/507f1f77bcf86cd799439011/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": "507f1f77bcf86cd799439012"
  }'
```

**Resposta:** `204 No Content`

#### GET /users/{userId}/favorites - Listar favoritos do usuário

```bash
curl http://localhost:3000/users/507f1f77bcf86cd799439011/favorites
```

**Resposta (200 OK):**

```json
[
  {
    "userId": "507f1f77bcf86cd799439011",
    "addedAt": "2025-07-20T10:30:00.000Z",
    "media": {
      "id": "507f1f77bcf86cd799439012",
      "title": "Matrix",
      "description": "Um filme sobre realidade virtual",
      "type": "movie",
      "releaseYear": 1999,
      "genre": "Ficção Científica",
      "createdAt": "2025-07-20T10:20:00.000Z"
    }
  }
]
```

#### DELETE /users/{userId}/favorites/{mediaId} - Remover dos favoritos

```bash
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439011/favorites/507f1f77bcf86cd799439012
```

**Resposta:** `204 No Content`

### Endpoint de Saúde

#### GET /ping - Verificar se a API está funcionando

```bash
curl http://localhost:3000/ping
```

## Estrutura do Projeto

```
src/
├── controllers/         # Controladores das rotas
├── services/            # Lógica de negócio
├── models/              # Interfaces e tipos TypeScript
├── routes/              # Definição das rotas
├── utils/               # Utilitários (validadores, erros)
├── middleware/          # Middlewares customizados
├── test/                # Testes unitários
└── server.ts            # Arquivo principal
```

## Tratamento de Erros

A API possui um sistema centralizado de tratamento de erros que retorna respostas consistentes:

```json
{
  "message": "Descrição do erro",
  "timestamp": "2025-07-20T10:30:00.000Z"
}
```

## Validações Implementadas

- **Dados de entrada**: Validação de todos os campos obrigatórios
- **IDs**: Validação de ObjectIds do MongoDB e IDs customizados
- **Email**: Validação de formato de email
- **Tipos de mídia**: Apenas "movie" ou "series" são aceitos
- **Ano de lançamento**: Entre 1900 e 5 anos no futuro

## Cobertura de Testes

O projeto inclui testes unitários abrangentes para:

- ✅ Serviços de negócio (UserService, MediaService, FavoriteService)
- ✅ Validadores e utilitários
- ✅ Tratamento de erros
- ✅ Casos de edge e validações

**Meta de cobertura**: 80% em branches, functions, lines e statements.

## Docker

### Dockerfile

Containeriza a aplicação Node.js com Alpine Linux para reduzir o tamanho da imagem.

### Docker Compose

Orquestra a aplicação junto com MongoDB:

- **api**: Aplicação Node.js na porta 3000
- **mongo**: MongoDB na porta 27017
- **Volumes**: Persistência de dados do MongoDB

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb://localhost:27017/cinemais
PORT=3000
NODE_ENV=development
```

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo desenvolvimento
- `npm test` - Executa todos os testes
- `npm run build` - Compila o TypeScript para JavaScript
- `npm run test:coverage` - Executa testes com relatório de cobertura

## Próximos Passos

Para evoluir a aplicação, considerarei implementar:

- [ ] ESLint / Prettier
- [ ] Sistema de autenticação JWT
- [ ] Paginação nos endpoints de listagem
- [ ] Cache com Redis
- [ ] Rate limiting
- [ ] Logs estruturados
- [ ] Monitoramento e métricas
- [ ] CI/CD pipeline

---

Desenvolvido por **[renanss4](https://github.com/renanss4)**.
