# Classroom API

API de gerenciamento para plataforma de aulas online que conecta alunos e professores.

## 🚀 Tecnologias

- **Node.js v24**
- **TypeScript**
- **Express**
- **PostgreSQL**
- **TypeORM**
- **Docker & Docker Compose**
- **JWT para autenticação**
- **WebSocket para comunicação em tempo real**

## 📋 Requisitos

- Node.js (v24.0.0 ou superior)
- Docker e Docker Compose
- PostgreSQL
- Memcached

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd classroom--api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env
# Edite o arquivo .env com suas configurações
```

4. Inicie os serviços com Docker:

```bash
docker compose up -d
```

5. Execute as migrações do banco de dados:

```bash
npm run migration:run
```

## 🏃‍♂️ Scripts disponíveis

- `npm start` - Inicia a aplicação
- `npm run dev` - Inicia a aplicação em modo desenvolvimento com hot-reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm run lint` - Executa o linter para verificar o código
- `npm test` - Executa os testes

## 🏗️ Arquitetura

A aplicação segue uma arquitetura em camadas:

- **Controller → Service → Repository**

### Estrutura de diretórios

```
src/
├── @domain/               # Lógica de negócio
│   ├── entities/          # Entidades puras do domínio
│   ├── value-objects/     # Objetos de valor imutáveis
│   ├── interfaces/        # Interfaces de repositórios, gateways, websocket, etc.
│   └── services/          # Serviços que implementam a lógica de negócio
│
├── @http/                 # Camada de entrada via HTTP
│   ├── controllers/       # Controladores Express
│   ├── middlewares/       # Middlewares HTTP
│   ├── routes/            # Rotas dos endpoints HTTP
│   └── dtos/              # DTOs para validação de entrada/saída
│
├── @infrastructure/       # Implementações externas
│   ├── database/          # Configuração de banco de dados (PostgreSQL)
│   ├── cache/             # Configuração de cache (Memcached)
│   ├── email/             # Configuração de envio de e-mails
│   ├── payment/           # Integração com serviços de pagamento
│   ├── logging/           # Configuração de logging
│   ├── gateways/          # Serviços externos (APIs, etc.)
│   ├── websocket/         # Configuração de WebSocket
│   ├── schemas/           # Implementação de schemas de banco de dados (TypeORM)
│   └── repositories/      # Implementação dos repositórios (TypeORM)
│
├── shared/                # Utilitários compartilhados
└── main.ts                # Ponto de entrada da aplicação
```

## 🌟 Funcionalidades

- **Catálogo de Professores:** Busca e visualização de perfis de professores
- **Blog de Solicitação de Aulas:** Alunos publicam necessidades; professores respondem
- **Chat em Tempo Real:** Comunicação entre alunos e professores
- **Integração de Video Call:** Sessões de aula de 1 hora de duração
- **Sistema de Pagamento:** Cobrança por hora/aula

## 👥 Perfis de Usuário

- **Aluno:** Busca professores, cria pedidos de aulas, participa de chats e aulas
- **Professor:** Gerencia perfil, responde a pedidos de aula, conduz aulas
- **Admin:** Acesso total à plataforma, monitoramento e relatórios

## 🔒 Segurança

- Autenticação via JWT
- Validação de dados de entrada
- Proteção contra vulnerabilidades comuns (SQL Injection, XSS, etc)
- Gestão segura de segredos com variáveis de ambiente

## 📊 Testes e Qualidade

- Testes unitários com Jest
- Testes de integração
- ESLint para análise estática de código
- Pipeline CI/CD automatizada

## 🌐 API Endpoints

A documentação detalhada da API está disponível em `/api/docs` após iniciar o servidor.

## 📖 Documentação Adicional

Para informações mais detalhadas sobre o desenvolvimento, consulte:

- [Contexto da Aplicação](./guidelines/aplication-context.md)
- [Boas Práticas](./guidelines/good-practices.md)

## 📄 Licença

MIT
