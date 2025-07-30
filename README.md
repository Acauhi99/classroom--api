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
- `pnpm dev` - Inicia a aplicação em modo desenvolvimento com hot-reload
- `pnpm lint` - Executa o linter para verificar o código
- `pnpm test` - Executa os testes

## 🏗️ Arquitetura

A aplicação segue uma arquitetura em camadas:

- **Controller → Service → Repository**

### Fluxo de Requisição

1. **Recepção da Requisição:**  
   O usuário faz uma requisição HTTP (ex: cadastro de usuário).  
   O Express encaminha para o controller correspondente.

2. **Controller:**  
   O controller recebe os dados, valida o formato (usando DTOs e middlewares) e chama o serviço apropriado.

3. **Service:**  
   O service contém a lógica de negócio. Ele pode validar regras, criar entidades, manipular value objects e orquestrar operações.  
   Se precisar acessar dados, ele utiliza um repositório (interface).

4. **Repository:**  
   O repositório implementa a interface definida no domínio e faz a comunicação com o banco de dados (via TypeORM).  
   Ele retorna entidades ou value objects para o service.

5. **Resposta:**  
   O controller recebe o resultado do service e monta a resposta HTTP adequada.

6. **Outras Camadas:**
   - Middlewares tratam autenticação, erros e contexto da requisição.
   - Serviços de infraestrutura (cache, email, pagamentos) são injetados via container de dependências.

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
