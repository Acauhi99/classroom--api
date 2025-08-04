🧪 Guideline de Testes para Aplicação Node.js com TypeScript
Este documento define as regras, estruturas e padrões para os testes da aplicação.

🧭 Visão Geral
Arquitetura da aplicação:
Route → Controller → Service → Repository

Tipos de teste permitidos:

✅ Value Objects: testes unitários

✅ Services: testes de integração (com banco real)

✅ Routes: testes de integração (HTTP completo)

Biblioteca de testes:
Utilizamos apenas o módulo nativo node:test do Node.js 24+ (node:test e assert), sem Jest ou qualquer lib externa.

📐 Regras Gerais
Cada teste deve testar apenas um comportamento.

Testes devem ser isolados e independentes.

Não são permitidos mocks em Service Tests, pois devem interagir com um banco PostgreSQL real de testes.

Devemos manter pelo menos 90% de cobertura nas linhas de código.

Use describe e it como aliases nos testes, conforme o padrão do node:test.

Utilize beforeEach/afterEach para setup/teardown, evitando estados compartilhados.

🧪 Value Objects - Testes Unitários
Objetivo: garantir que objetos de valor tratem corretamente validações e edge cases.

Exemplo:

ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Email } from './email.value-object.ts';

describe('Email', () => {
it('should create a valid email', () => {
const email = new Email('user@example.com');
assert.strictEqual(email.value, 'user@example.com');
});

it('should throw if email is invalid', () => {
assert.throws(() => new Email('invalid-email'));
});
});

🔄 Services - Testes de Integração
Objetivo: testar lógica de domínio e persistência real, sem mocks.

Regras:

Utilize o container customizado (container.get(...)) para injetar as dependências reais.

Garanta que o banco de testes esteja disponível e seja limpo antes de cada teste.

Use transações ou truncamento para isolar testes.

Exemplo:

ts
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { services } from '';

describe('UserService', () => {
beforeEach(async () => {
await truncateDatabase(); // função que limpa as tabelas
});

it('should create a user successfully', async () => {
const userService = services.userService;

    const user = await userService.createUser({
      name: 'Acauhi',
      email: 'test@example.com'
    });

    assert.ok(user.id);
    assert.strictEqual(user.name, 'Acauhi');

});
});

🌐 Routes - Testes de Integração HTTP
Objetivo: testar o roteamento, entrada/saída HTTP e comportamento do controller.

Regras:

Utilize http.request para fazer chamadas reais para a aplicação em execução.

Garanta que a aplicação esteja rodando em modo teste.

Valide status codes, headers e payloads.

Exemplo:

ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { startApp, stopApp } from '../../utils/test-server';

describe('User Routes', () => {
beforeEach(async () => {
await truncateDatabase();
await startApp(); // inicia servidor em modo teste
});

it('should return 201 on user creation', async () => {
const res = await fetch('http://localhost:8888/api/users', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name: 'Mateus', email: 'mateus@email.com' }),
});

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.name, 'Mateus');

});
});

🧹 Banco de Dados em Testes
Utilize um banco PostgreSQL dedicado para testes.

Em beforeEach, limpe as tabelas ou reinicie as transações.

Nunca compartilhe estado entre os testes.

Sugestão de utilitário para truncar o banco:

ts
import { AppDataSource } from '../../src/@infrastructure/database/data-source';

export const truncateDatabase = async () => {
const manager = AppDataSource.manager;
await manager.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
};

🧾 Cobertura de Código
Cobertura mínima obrigatória:

✅ 90% de linhas

✅ 90% de branches

🚫 O que NÃO fazer
❌ Usar jest, sinon, mocha, etc.

❌ Criar mocks para repositórios em testes de services.

❌ Usar try/catch para esconder falhas nos testes.

❌ Escrever vários expects no mesmo it, testando comportamentos distintos.

✅ Checklist para Novo Teste
O teste está em uma das três categorias aprovadas?

Está usando apenas node:test?

Está testando um único comportamento?

É isolado e não depende de nenhum outro?

Está utilizando corretamente o container e as dependências reais?

O banco está limpo antes de começar?

A cobertura de código será impactada positivamente?
