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
pnpm install
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
pnpm run migration:run
```

## 🏃‍♂️ Scripts disponíveis

- `pnpm start` - Inicia a aplicação
- `pnpm run dev` - Inicia a aplicação em modo desenvolvimento com hot-reload
- `pnpm run build` - Compila o TypeScript para JavaScript
- `pnpm run lint` - Executa o linter para verificar o código
- `pnpm test` - Executa os testes

## 🏗️ Arquitetura

A aplicação segue uma arquitetura em camadas:

- **Controller → Service → Repository**

### Estrutura de diretórios

```
├── @domain
│   ├── entities
│   │   └── user.entity.ts
│   ├── interfaces
│   │   ├── cache-service.interface.ts
│   │   └── user-repository.interface.ts
│   ├── services
│   │   └── user.service.ts
│   └── value-objects
│       ├── email.value-object.ts
│       └── password.value-object.ts
├── @http
│   ├── controllers
│   │   └── user.controller.ts
│   ├── dtos
│   │   └── user.dto.ts
│   ├── middlewares
│   │   ├── context.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── validate-request.middleware.ts
│   ├── routes
│   │   └── user.route.ts
│   └── utils
│       ├── controller.util.ts
│       ├── middleware.util.ts
│       ├── routes.util.ts
│       └── setup-middlewares.util.ts
├── @infrastructure
│   ├── cache
│   │   └── memcached-service.ts
│   ├── database
│   │   └── data-source.ts
│   ├── email
│   ├── gateways
│   ├── logging
│   ├── payment
│   ├── repositories
│   │   └── user.repository.ts
│   └── websocket
├── main.ts
└── shared
    ├── container
    │   └── dependency-container.ts
    └── errors
        └── application-errors.ts
```

## 🧩 Padrões Arquiteturais e de Design

### Arquitetura em Camadas

A aplicação segue princípios de **Clean Architecture** com separação clara entre:

- **Camada de Domínio** (`@domain`): Contém a lógica de negócios, entidades e regras
- **Camada de Aplicação** (`@http`): Controllers, DTOs e rotas que orquestram os casos de uso
- **Camada de Infraestrutura** (`@infrastructure`): Implementações concretas e integrações externas

### Padrões de Design Implementados

- **Dependency Injection**: Utilizando container para gerenciamento e inversão de dependências
- **Repository Pattern**: Abstraindo o acesso a dados com interfaces definidas na camada de domínio
- **Value Objects**: Encapsulando conceitos importantes como Email e Password
- **DTO (Data Transfer Objects)**: Para transferência segura de dados entre camadas
- **Factory Method**: Na criação de instâncias através do container
- **Singleton**: No container de dependências para uso em toda aplicação
- **Middleware Pattern**: Para processamento em cadeia de requisições HTTP
- **Domain-Driven Design**: Entidades ricas com comportamentos próprios e validações de domínio

### Princípios SOLID

- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Extensível sem modificação (via interfaces)
- **Liskov Substitution**: Implementações podem substituir interfaces
- **Interface Segregation**: Interfaces pequenas e específicas
- **Dependency Inversion**: Dependência em abstrações, não implementações

### Gestão de Erros

Sistema de erros centralizado com hierarquia de exceções tipadas para facilitar o tratamento e resposta adequada para cada tipo de erro.

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
