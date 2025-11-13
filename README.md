# Furnas Backend

## Visão Geral
Backend desenvolvido com NestJS para gerenciar a lista de jogadores do projeto Furnas. A aplicação expõe endpoints REST documentados via Swagger e utiliza Prisma como ORM conectado a um banco PostgreSQL.

## Arquitetura e Tecnologias
- NestJS 11 com TypeScript
- Prisma ORM com PostgreSQL
- Validação de entrada com `class-validator` e `class-transformer`
- Documentação automática com Swagger em `/docs`
- Docker Compose para infraestrutura local de banco de dados

## Pré-requisitos
- Node.js 20 LTS ou superior
- npm 10 ou superior
- Docker e Docker Compose (para executar o Postgres localmente)

## Configuração do Ambiente
1. Instale as dependências:  
   `npm install`
2. Configure variáveis de ambiente:  
   `cp .env.example .env`  
   Ajuste `DATABASE_URL` se necessário.
3. Inicie o banco de dados local:  
   `docker compose up -d postgres`
4. Atualize o schema do banco com Prisma:  
   `npm run prisma:db-push`

## Execução
- Desenvolvimento com hot-reload: `npm run start:dev`
- Ambiente de produção (build prévio necessário):  
  `npm run build` e depois `npm run start:prod`

A API fica disponível por padrão em `http://localhost:3000`. A documentação Swagger é exposta em `http://localhost:3000/docs`.

## Scripts Úteis
- `npm run lint` – Analisa o código com ESLint
- `npm run format` – Formata com Prettier
- `npm run test` – Executa a suíte de testes unitários
- `npm run test:watch` – Testes em modo watch
- `npm run test:cov` – Gera relatório de cobertura
- `npm run prisma:generate` – Gera o cliente Prisma
- `npm run prisma:studio` – Abre o Prisma Studio

## Estrutura de Pastas (resumo)
- `src/` – Código-fonte da aplicação NestJS
- `prisma/` – Schema e migrações do Prisma
- `dist/` – Build compilado (gerado em tempo de execução)
- `test/` – Testes automatizados

## Contribuição
1. Abra uma nova branch a partir da `main`.
2. Faça suas alterações seguindo os padrões do projeto.
3. Garanta que lint e testes passam antes de abrir um PR.

## Licença
Projeto proprietário. Uso restrito à equipe Furnas.