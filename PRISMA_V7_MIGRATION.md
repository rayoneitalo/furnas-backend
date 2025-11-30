# Guia de Atualização para Prisma ORM v7

## Visão Geral
Este documento detalha os passos necessários para migrar o projeto para o Prisma ORM v7, incluindo a resolução de problemas comuns de autenticação com PostgreSQL.

## Passo 1: Atualizar Dependências do Prisma

Execute os seguintes comandos para atualizar para a versão 7 do Prisma:

```bash
npm install @prisma/client@latest
npm install -D prisma@latest
npm install @prisma/adapter-pg@latest
```

**O que muda:**
- `@prisma/client` é atualizado para a versão 7
- `prisma` (devDependency) é atualizado para a versão 7
- `@prisma/adapter-pg` é adicionado para suporte ao PostgreSQL com adaptadores de conexão

## Passo 2: Regenerar o Cliente Prisma

Após atualizar as dependências, regenere o cliente Prisma:

```bash
npx prisma generate
```

Isso irá atualizar os arquivos em `prisma/generated/` com a nova versão do cliente.

## Passo 3: Configurar Exclusão de Arquivos Gerados no TypeScript

O Prisma v7 gera arquivos que não devem ser incluídos no build do TypeScript. Atualize `tsconfig.build.json`:

```json
## Passo 3.1: Configuração do `ConfigModule` e carregamento de `.env`

Prisma v7 (especialmente quando usado com `@prisma/adapter-pg`) exige que a variável `DATABASE_URL` esteja disponível cedo no ciclo de inicialização da aplicação. A forma recomendada é usar o `ConfigModule` do NestJS e garantir que ele carregue os arquivos `.env` corretos com um fallback.

No seu `AppModule` use uma configuração que sempre carregue o `.env` base e uma variante por `NODE_ENV` com fallback para `development`:

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './modules/prisma/prisma.module'
import { PlayersModule } from './modules/players/players.module'
import { ListStateModule } from './modules/list-state/list-state.module'
import { InvitesModule } from './modules/invites/invites.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Carrega '.env' primeiro e depois a variante (ex: '.env.development')
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    PrismaModule,
    PlayersModule,
    ListStateModule,
    InvitesModule,
  ],
})
export class AppModule {}
```

Por que isto funciona:
- Se `process.env.NODE_ENV` for `undefined`, a expressão usa `'development'` como fallback e evita caminhos como `.env.undefined`.
- `.env` é sempre carregado primeiro (contendo valores por padrão) e o `.env.<env>` substitui chaves específicas quando existir.

Nota alternativa (fallback robusto): em ambientes onde `NODE_ENV` é sempre setado na linha de comando (scripts), considere configurar os scripts `package.json` com `cross-env` para garantir consistência entre plataformas:

```json
"scripts": {
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "start:prod": "cross-env NODE_ENV=production node dist/main"
}
```

Se, por algum motivo, seu ambiente ainda não expõe `DATABASE_URL` cedo o suficiente, use uma das opções abaixo:

- Importe `dotenv` o mais cedo possível (apenas como fallback):

```ts
// top of src/main.ts
import 'dotenv/config'
```

- Ou garanta que `ConfigModule.forRoot(...)` seja o primeiro item na lista `imports` do `AppModule` (como no exemplo acima). Isso faz com que o `ConfigService` esteja disponível antes dos módulos que dependem dele.

{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "prisma/generated"]
}
```

**Motivo:** Os arquivos gerados pelo Prisma em `prisma/generated/` contêm código CommonJS que não deve ser compilado junto com o código ES modules do projeto.

## Passo 4: Corrigir Erro de Autenticação PostgreSQL

### Problema
O erro `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` ocorre quando:
- A variável de ambiente `DATABASE_URL` contém `undefined` ou não é uma string válida
- A senha no formato de URL da conexão é `null` ou não está sendo interpolada corretamente

### Solução

#### 4.1 Verificar Arquivo `.env`

Certifique-se de que o arquivo `.env` contém `DATABASE_URL` corretamente formatado:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

**Formato esperado:**
```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

#### 4.2 Atualizar `prisma.service.ts`

Certifique-se de que o serviço Prisma está lidando corretamente com as variáveis de ambiente:

```typescript
import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from 'prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

/*
  Duas abordagens válidas aqui (escolha uma dependendo do seu fluxo):

  A) Usar `ConfigService` no construtor (requer que `ConfigModule` seja importado primeiro no `AppModule`).
  B) Evitar ler variáveis no construtor e, em vez disso, lançar um erro descritivo em `onModuleInit` se `DATABASE_URL` estiver ausente.

  Exemplo A (construtor):
*/

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  constructor(private readonly config: ConfigService) {
    // obtém a connection string do ConfigService
    const connectionString = config.get<string>('DATABASE_URL')

    if (!connectionString) {
      // falha rápida com mensagem clara — útil durante o startup
      throw new Error('DATABASE_URL is not defined (checked in PrismaService constructor)')
    }

    // cria adapter com a connection string e passa para o PrismaClient
    const adapter = new PrismaPg({ connectionString })
    super({ adapter })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Database connected successfully')
    } catch (err) {
      this.logger.error('Failed to connect to the database', err as any)
      throw err
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
```

#### 4.3 Verificar Variáveis de Ambiente em Runtime

Adicione logging para debugging:

```typescript
// No seu main.ts ou app.module.ts
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

if (!process.env.DATABASE_URL.includes(':') || !process.env.DATABASE_URL.includes('@')) {
  throw new Error('DATABASE_URL format is invalid')
}

console.log('Database URL configured successfully')
```

#### 4.4 Usar Adaptador PostgreSQL (Recomendado para v7)

Para o Prisma v7 com PostgreSQL, considere usar o adaptador nativo:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "generated"
}
```

Se estiver usando adaptador externo:

```prisma
// prisma/schema.prisma com @prisma/adapter-pg
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "generated"
  previewFeatures = ["postgresqlExtensions"]
}
```

## Passo 5: Limpar e Reconstruir

```bash
# Limpar artefatos de build anteriores
rm -rf dist node_modules/.prisma

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
npm install

# Regenerar cliente
npx prisma generate

# Reconstruir projeto
npm run build
```

## Passo 6: Testar Conexão com Banco de Dados

Execute um teste rápido de conexão:

```bash
npx prisma db push
# ou
npx prisma migrate dev
```

Se tudo estiver configurado corretamente, você verá uma confirmação de conexão bem-sucedida.

## Passo 7: Iniciar Aplicação

```bash
npm run dev
# ou
npm start
```

## Checklist de Validação

- [ ] `@prisma/client` v7.x instalado
- [ ] `prisma` v7.x instalado (devDependency)
- [ ] `@prisma/adapter-pg` instalado (se aplicável)
- [ ] `prisma/generated` adicionado ao `exclude` em `tsconfig.build.json`
- [ ] `DATABASE_URL` configurado corretamente em `.env`
- [ ] Arquivo `.env` não commitado no Git (verificar `.gitignore`)
- [ ] Build TypeScript executa sem erros
- [ ] Teste de conexão com banco de dados bem-sucedido
- [ ] Aplicação inicia sem erros de autenticação

## Possíveis Erros Adicionais e Soluções

### Erro: "client password must be a string"
- **Causa:** `DATABASE_URL` é `undefined` ou contém `undefined` como string
- **Solução:** Verificar arquivo `.env` e reiniciar o servidor de desenvolvimento

### Erro: "ECONNREFUSED"
- **Causa:** PostgreSQL não está rodando
- **Solução:** Verificar se o container/serviço PostgreSQL está ativo

### Erro: "relation does not exist"
- **Causa:** Migrations não foram aplicadas
- **Solução:** Executar `npx prisma migrate deploy`

### Erro: "The provided database string is invalid"
- **Causa:** Formato da URL de conexão está incorreto
- **Solução:** Validar formato: `postgresql://user:password@host:port/dbname`

## Referências

- [Prisma v7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7)
- [Prisma PostgreSQL Adapter](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Prisma Environment Variables](https://www.prisma.io/docs/orm/references/environment-variables-reference)
- [Connection String Format](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
