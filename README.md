# 🪿 Cinegoose: International Goose Movie Database

A delightful API that catalogs famous geese in cinema history, along with their memorable quotes. Built with the [HONC](https://honc.dev/) stack (Hono, OpenAPI, Node.js, Cloudflare).

## Features

- 🎬 Browse movies featuring iconic goose characters
- 🪿 Discover famous geese from cinema history
- 💬 Collection of memorable quotes from goose characters
- 📚 Full OpenAPI documentation
- 🔍 RESTful API endpoints for easy integration

## API Endpoints

- `GET /` - Welcome message with emojis
- `GET /api/movies` - List all movies
- `GET /api/movies/{id}` - Get movie details
- `POST /api/movies` - Add a new movie
- `GET /api/geese` - List all famous geese
- `GET /api/geese/{id}` - Get details about a specific goose
- `POST /api/geese` - Add a new famous goose
- `GET /api/quotes` - List all goose quotes
- `GET /api/quotes/{id}` - Get a specific quote
- `POST /api/quotes` - Add a new quote

## Project Structure

```
├── src/
│   ├── index.ts          # Main application entry point with API routes
│   └── db/
│       └── schema.ts     # Database schema (movies, geese, quotes)
├── drizzle/
│   └── migrations/       # Database migrations
├── .dev.vars            # Development environment variables
├── .prod.vars           # Production environment variables
├── seed.ts              # Database seeding script
├── drizzle.config.ts    # Drizzle ORM configuration
├── package.json         # Project dependencies and scripts
├── pnpm-lock.yaml       # pnpm lock file
├── tsconfig.json        # TypeScript configuration
└── wrangler.toml        # Cloudflare Workers configuration
```

## Getting Started

1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Set up the database:
   ```sh
   pnpm run db:setup
   ```

3. Start the development server:
   ```sh
   pnpm run dev
   ```

4. Visit the interactive API documentation:
   - OpenAPI Spec: `http://localhost:8787/openapi.json`
   - Interactive UI: `http://localhost:8787/fp`

## Development

As you modify the database schema, generate and apply migrations:

```sh
pnpm run db:generate  # Generate new migration
pnpm run db:migrate   # Apply migration locally
```

## Deployment

1. Create a D1 database on Cloudflare:
   ```sh
   npx wrangler d1 create cinegoose-db
   ```

2. Update `wrangler.toml` with your database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "cinegoose-db"
   database_id = "<your-database-id>"
   migrations_dir = "drizzle/migrations"
   ```

3. Set up production variables in `.prod.vars`:
   ```sh
   CLOUDFLARE_D1_TOKEN="<your-api-token>"
   CLOUDFLARE_ACCOUNT_ID="<your-account-id>"
   CLOUDFLARE_DATABASE_ID="<your-database-id>"
   ```

4. Deploy to Cloudflare:
   ```sh
   pnpm run db:migrate:prod  # Run migrations in production
   pnpm run deploy           # Deploy the worker
   ```

## Built With

The [The HONC stack](https://honc.dev/), consisting of:

- [Hono](https://hono.dev) - Fast, Lightweight, Web-standards
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge Runtime
- [Cloudflare D1](https://developers.cloudflare.com/d1) - SQL Database
- [OpenAPI](https://www.openapis.org) - API Documentation
- [Zod](https://zod.dev) - TypeScript-first schema validation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
