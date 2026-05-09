# gerenciador-edocs — Documentação Técnica

## Stack e versões relevantes

| Ferramenta | Versão | Função |
|---|---|---|
| NestJS | 11.x | Framework principal |
| Prisma | 7.7.0 | ORM e migrations |
| `@prisma/adapter-pg` | — | Driver Adapter PostgreSQL |
| `passport-local` | — | Estratégia de login com email/senha |
| `passport-jwt` | — | Estratégia de autenticação por token |
| `bcryptjs` | — | Hash de senha |
| `@nestjs/config` | — | Leitura de variáveis de ambiente |

---

## Estrutura de módulos

```
src/
├── main.ts                          # Entry point da aplicação
├── app.module.ts                    # Módulo raiz
├── prisma/
│   ├── prisma.module.ts             # Módulo global do Prisma
│   └── prisma.service.ts            # Wrapper do PrismaClient
├── users/
│   ├── users.module.ts
│   ├── users.service.ts             # CRUD de usuários
│   └── dto/
│       └── create-user.dto.ts       # Validação dos dados de criação
└── auth/
    ├── auth.module.ts
    ├── auth.service.ts              # Lógica de autenticação
    ├── auth.controller.ts           # Rotas POST /auth/register e /auth/login
    ├── strategies/
    │   ├── local.strategy.ts        # Valida email + senha
    │   └── jwt.strategy.ts          # Valida Bearer token
    ├── guards/
    │   ├── local-auth.guard.ts      # Ativa local.strategy no endpoint
    │   └── jwt-auth.guard.ts        # Protege rotas autenticadas
    └── dto/
        └── login.dto.ts
```

---

## Como o NestJS organiza o código (módulos)

No NestJS, tudo é organizado em **módulos**. Cada módulo declara seus `providers` (serviços, strategies, guards) e `controllers`. Um módulo pode `export` providers para que outros módulos os usem.

```
AppModule
├── ConfigModule (global)   → disponibiliza ConfigService em toda a app
├── PrismaModule (global)   → disponibiliza PrismaService em toda a app
├── UsersModule             → exporta UsersService
└── AuthModule              → importa UsersModule, PassportModule, JwtModule
```

O `@Global()` no `PrismaModule` significa que qualquer módulo pode injetar o `PrismaService` sem precisar importar explicitamente o `PrismaModule`.

---

## Fluxo de autenticação

### Registro — `POST /auth/register`

```
Request body → CreateUserDto (validado pelo ValidationPipe)
    → AuthService.register()
    → UsersService.create()
        → verifica email duplicado
        → bcrypt.hash(password, 10)   ← custo 10 = 2^10 iterações
        → prisma.user.create()
    → retorna usuário sem passwordHash
```

### Login — `POST /auth/login`

```
Request body { email, password }
    → LocalAuthGuard ativa LocalStrategy.validate()
        → AuthService.validateUser()
            → busca usuário por email
            → bcrypt.compare(password, passwordHash)
            → retorna usuário sem passwordHash (ou null se inválido)
        → se null → lança UnauthorizedException (401)
        → se válido → injeta em req.user
    → AuthController.login(req.user)
        → JwtService.sign({ sub: id, email })
    → retorna { accessToken: "eyJ..." }
```

### Rotas protegidas (a usar futuramente)

```ts
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // { id, email, name }
}
```

O `JwtAuthGuard` extrai o token do header `Authorization: Bearer <token>`, valida a assinatura com `JWT_SECRET` e chama `JwtStrategy.validate()` que busca o usuário no banco.

---

## Prisma — decisões e problemas encontrados

### Generator `prisma-client-js` vs `prisma-client`

O Prisma 6+ introduziu um novo generator chamado `prisma-client` que gera arquivos TypeScript nativos (ESM). O problema é que o NestJS compila para **CommonJS** por padrão, e o novo generator gera código ESM incompatível (`import.meta.url`, `exports is not defined`).

**Solução:** usar o generator clássico `prisma-client-js`, que gera para `node_modules/@prisma/client` em CommonJS.

```prisma
generator client {
  provider = "prisma-client-js"  // ✅ correto para NestJS
}
```

### Driver Adapter obrigatório no Prisma 7

O Prisma 7 removeu a conexão direta via `DATABASE_URL` no construtor do `PrismaClient`. Agora é obrigatório usar um **Driver Adapter** — uma camada que abstrai o driver nativo do banco.

```ts
// Prisma 5/6 (funcionava assim)
new PrismaClient()  // lia DATABASE_URL do process.env automaticamente

// Prisma 7 (obrigatório agora)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
new PrismaClient({ adapter });
```

### Problema — `DATABASE_URL` undefined na construção

O `PrismaService` estende `PrismaClient` e chama `super({ adapter })` no construtor. Se `process.env.DATABASE_URL` não estiver disponível nesse momento, o adapter conecta no banco padrão do PostgreSQL em vez do banco configurado no `.env`.

O `ConfigModule.forRoot()` do NestJS carrega o `.env` via lifecycle hooks — mas o construtor do `PrismaService` pode rodar antes disso. A correção é adicionar `import 'dotenv/config'` no topo do `main.ts` para garantir que as variáveis estejam disponíveis antes de qualquer instanciação.

---

## Variáveis de ambiente (`.env`)

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/gerenciador_edoc"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="7d"
```

O `prisma.config.ts` (usado pela CLI do Prisma para migrations) lê o `.env` via `import 'dotenv/config'`. A aplicação em runtime lê via `ConfigModule`.

---

## Comandos úteis

```bash
# Criar e aplicar uma migration
npx prisma migrate dev --name <nome>

# Verificar se as migrations estão aplicadas
npx prisma migrate status

# Regenerar o cliente após mudar o schema
npx prisma generate

# Abrir o Prisma Studio (GUI do banco)
npx prisma studio
```
