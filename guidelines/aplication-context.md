# Visão Geral

Esta documentação fornece o contexto e as diretrizes para a API de uma plataforma de aulas online, orientando modelos de AI e equipes de desenvolvimento sobre a arquitetura, tecnologias, fluxos e boas práticas.

## 1. Tecnologias e Infraestrutura

- **Gerenciamento de Pacotes:** pnpm
- **Runtime:** Node.js v24 (usando nvm para controle de versões)
- **Transpilação / Tipagem:** TypeScript nativo
- **Conteinerização:** Docker e Docker Compose
- **Banco de Dados Relacional:** PostgreSQL
- **Cache Distribuído:** Memcached
- **ORM:** TypeORM
- **Comunicação em Tempo Real:** WebSocket nativo do Node.js
- **Autenticação / Autorização:** JWT

## 2. Objetivo da Aplicação

Uma plataforma de aulas online que contempla:

- **Catálogo de Professores:** Alunos podem buscar e visualizar perfis de professores.
- **Blog de Solicitação de Aulas:** Alunos publicam necessárias aulas; professores podem responder.
- **Chat de Comunicação:** Canal em tempo real entre aluno e professor.
- **Video Call Integrado:** Sessões de aula de 1 hora de duração.
- **Modelo de Pagamento:** Cobrança por hora/aula.

## 3. Arquitetura em Camadas

Fluxo de requisição:

**Controller → Service → Repository**

- **Controller:** Recebe e valida requisiões via DTOs, chama Services.
- **Service:** Orquestra lógica de negócio, transações, aplica regras, utiliza interfaces de Repository.
- **Repository:** Implementa interação com o banco via TypeORM.

## 4. Modelagem de Domínio

- **Entidades:** Contêm atributos, métodos e regras de negócio.
- **Value Objects:** Substituem tipos primitivos para dados com validações ou comportamentos específicos (ex.: `Email`, `Price`, `Duration`, `Password` etc).
- **DTOs (Data Transfer Objects):**
  - **Request:** Formato de entrada, com validações via `class-validator` e transformação via `class-transformer`.
  - **Response:** Formato de saída, garantindo encapsulamento e segurança.

## 5. Design da API REST

- **REST Semântico:** Uso correto de verbos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Endpoints por Recurso:** URI clara e consistente
- **Prefixo:** (`/api`).
- **Paginacão e Filtros:** Parâmetros `page`, `limit`, `sort`, `search`.
- **Tratamento de Erros:**
  - Middleware global de captura de exceções.
  - Formato padronizado de resposta de erro.

## 6. Validação e Tratamento de Erros

- **Validações de entrada:** `class-validator` + `class-transformer`.
- **Middleware de Erros:** Intercepta exceções e retorna HTTP Status adequados.
- **Logs:** Integração com biblioteca de logging.

## 7. Injeção de Dependências e IoC

- **Container de IoC:** Gerenciamento de dependências para Services, Repositories, Gateways.
- **Interfaces:** Abstração de implementação de Repository, permitindo testes e desacoplamento.

## 8. Testes e Qualidade de Código

- **Unitários:** Jest para Services e Models.
- **Integrados:** Testes de endpoints (supertest / Jest).
- **Cobertura:** Meta de cobertura de código (>= 80%).
- **Linting:** ESLint + Prettier.

## 9. CI/CD

- **Pipeline:** Execução de lint, testes, build e deploy automático.
- **Ambientes:** staging, production.

## 10. Estrutura da Aplicação

```
src/
├── @domain/               # Lógica de negócio
│   ├── entities/          # Entidades do domínio
│   ├── value-objects/     # Objetos de valor imutáveis
│   ├── interfaces/        # Interfaces de repositórios, gateways, websocket, etc.
│   └── services/          # Serviços que implementam a lógica de negócio
│
├── @http/                 # Camada de entrada via HTTP
│   ├── controllers/       # Controladores Express e Definições de rotas
│   ├── middlewares/       # Middlewares HTTP
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
│   └── repositories/      # Implementação dos repositórios (TypeORM)
│
├── shared/                # Utilitários compartilhados
└── main.ts                # Ponto de entrada da aplicação
```

## 11. Regras de Negócio e Funcionalidades Principais

### 11.1. Perfis de Usuário

**Aluno**

- Pode se cadastrar, editar perfil e buscar professores.
- Acessa o catálogo de professores e visualiza detalhes (áreas de atuação, biografia, avaliações).
- Cria publicações de "Pedido de Aula" no blog, especificando disciplina, nível, formato (online/presencial) e disponibilidade.
- Inicia chats privados e ingressa em salas de aula em vídeo/voz agendadas.

**Professor**

- Pode se cadastrar e preencher perfil (formação, experiências, tarifas).
- Recebe notificações sobre novos pedidos de aula que batem com suas áreas e disponibilidade.
- Responde a pedidos de aula no blog, propondo horário e formato.
- Inicia chats privados com alunos interessados e gerencia suas próprias salas de vídeo/voz.

**Admin**

- Tem acesso total às operações de CRUD sobre usuários, pedidos de aula, chats e salas.
- Pode monitorar métricas de uso (número de aulas realizadas, avaliações, gráficos de atividade).
- Intervém em casos de denúncias ou problemas de segurança/comunicação.
- Acesso a logs e relatórios históricos de toda a plataforma.

### 11.2. Catálogo de Professores

- **Listagem:** endpoint com filtros por disciplina, valor por hora, idioma e classificação.
- **Detalhamento:** endpoint retorna perfil completo, média de avaliações e disponibilidade calendarizada.
- **Favoritos:** alunos podem "favoritar" professores, mantendo lista própria para acesso rápido.

### 11.3. Blog de Pedidos de Aula

- **Publicação de Pedido:** endpoint com campos obrigatórios: disciplina, nível do aluno, descrição do tema e opções de horário.
- **Visibilidade:** todos os professores ativos visualizam os pedidos, podendo filtrar por disciplina e localização.
- **Interação:** professores respondem endpoint, propondo detalhes de agenda e valor.
- **Gerenciamento:** alunos validam ou recusam propostas; status do pedido evolui (Aberto → Em negociação → Agendado → Concluído).

### 11.4. Chat Privado (Mensagens em Tempo Real)

- **Canal único:** cada par aluno–professor tem um canal dedicado, identificado por `chatId`.
- **Protocolos:** comunicação via WebSocket, mensagens armazenadas no banco e paginação histórica.
- **Recursos:** envio de texto, emojis, anexos (PDF, imagens), indicadores de digitação e status "visto".

### 11.5. Salas de Aula em Vídeo e Voz

- **Criação de Sala:** endpoint com parâmetros: `chatId`, duração (padrão 1 hora), formato (vídeo/voz).
- **Acesso:** alunos e professores recebem um link único com token JWT de curto prazo.
- **Recursos:** compartilhamento de tela, quadro branco colaborativo, gravação opcional (armazenada em S3).
- **Encerramento:** ao término, sala é fechada e metadados (duração real, participantes, link de gravação) são salvos.

### 11.6. Monitoramento e Auditoria (Admin)

- **Painel de Controle:** dashboards com métricas em tempo real (número de usuários ativos, chats abertos, salas ativas).
- **Logs de Eventos:** API registra eventos de login, criação/edição/exclusão de recursos, e uso de WebSocket.
- **Relatórios:** gera relatórios diários/semanal/mensal via endpoint, enviados por e-mail ou disponíveis via API.
- **Alertas:** integração com serviço de alerta (Discord/Telegram) para notificações de erros críticos ou picos de uso.
