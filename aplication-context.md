Visão Geral

Esta documentação fornece o contexto e as diretrizes para a API de uma plataforma de aulas online, orientando modelos de AI e equipes de desenvolvimento sobre a arquitetura, tecnologias, fluxos e boas práticas.

1. Tecnologias e Infraestrutura

Gerenciamento de Pacotes: pnpm

Runtime: Node.js v24 (usando nvm para controle de versões)

Transpilação / Tipagem: TypeScript nativo

Conteinerização: Docker e Docker Compose

Banco de Dados Relacional: PostgreSQL

Cache Distribuído: Memcached

ORM: TypeORM

Comunicação em Tempo Real: WebSocket nativo do Node.js

Autenticação / Autorização: JWT

2. Objetivo da Aplicação

Uma plataforma de aulas online que contempla:

Catálogo de Professores: Alunos podem buscar e visualizar perfis de professores.

Blog de Solicitação de Aulas: Alunos publicam necessárias aulas; professores podem responder.

Chat de Comunicação: Canal em tempo real entre aluno e professor.

Video Call Integrado: Sessões de aula de 1 hora de duração.

Modelo de Pagamento: Cobrança por hora/aula.

3. Arquitetura em Camadas

Fluxo de requisição:

Controller -> Service -> Repository

Controller: Recebe e valida requisiões via DTOs, chama Services.

Service: Orquestra lógica de negócio, transações, aplica regras, utiliza interfaces de Repository.

Repository: Implementa interação com o banco via TypeORM.

4. Modelagem de Domínio

Entidades: Contêm atributos, métodos e regras de negócio.

Value Objects: Substituem tipos primitivos para dados com validações ou comportamentos específicos (ex.: Email, Price, Duration).

DTOs (Data Transfer Objects):

Request: Formato de entrada, com validações via class-validator e transformação via class-transformer.

Response: Formato de saída, garantindo encapsulamento e segurança.

5. Design da API REST

REST Semântico: Uso correto de verbos HTTP (GET, POST, PUT, PATCH, DELETE).

Endpoints por Recurso: URI clara e consistente

Prefixo: (/api).

Paginacão e Filtros: Parâmetros page, limit, sort, search.

Tratamento de Erros:

Middleware global de captura de exceções.

Formato padronizado de resposta de erro.

6. Validação e Tratamento de Erros

validações de entrada: class-validator + class-transformer.

Middleware de Erros: Intercepta exceções e retorna HTTP Status adequados.

Logs: Integração com biblioteca de logging.

7. Injeção de Dependências e IoC

Container de IoC: Gerenciamento de dependências para Services, Repositories, Gateways.

Interfaces: Abstração de implementação de Repository, permitindo testes e desacoplamento.

8. Testes e Qualidade de Código

Unitários: Jest para Services e Models.

Integrados: Testes de endpoints (supertest / Jest).

Cobertura: Meta de cobertura de código (>= 80%).

Linting: ESLint + Prettier.

9. CI/CD

Pipeline: Execução de lint, testes, build e deploy automático.

Ambientes: staging, production.
