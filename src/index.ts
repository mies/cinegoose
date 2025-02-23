import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { createFiberplane } from "@fiberplane/hono";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as schema from "./db/schema";

// Types for environment variables and context
type Bindings = {
  DB: D1Database; // Cloudflare D1 database binding
};

type Variables = {
  db: DrizzleD1Database;
};

// Create the app with type-safe bindings and variables
const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up D1 database connection for all routes
app.use(async (c, next) => {
  const db = drizzle(c.env.DB);
  c.set("db", db);
  await next();
});

// Define the expected response shape using Zod
const MovieSchema = z.object({
  id: z.number().openapi({
    example: 1,
  }),
  title: z.string().openapi({
    example: "The Goosefather",
  }),
  director: z.string().openapi({
    example: "Goose Coppola",
  }),
  releaseDate: z.string().openapi({
    example: "1972-03-24",
  }),
}).openapi("Movie");

const FamousGooseSchema = z.object({
  id: z.number().openapi({
    example: 1,
  }),
  name: z.string().openapi({
    example: "Honkleone",
  }),
  movieId: z.number().openapi({
    example: 1,
  }),
  character: z.string().openapi({
    example: "Don Vito Honkleone",
  }),
  description: z.string().nullable().openapi({
    example: "The patriarch of the Honkleone crime family",
  }),
}).openapi("FamousGoose");

const GooseQuoteSchema = z.object({
  id: z.number().openapi({
    example: 1,
  }),
  gooseId: z.number().openapi({
    example: 1,
  }),
  quote: z.string().openapi({
    example: "I'm gonna make him a honk he can't refuse.",
  }),
  context: z.string().nullable().openapi({
    example: "Speaking to Tom Hagen about resolving a dispute",
  }),
  timestamp: z.string().nullable().openapi({
    example: "00:45:30",
  }),
}).openapi("GooseQuote");

const NewFamousGooseSchema = z.object({
  name: z.string().openapi({
    example: "Honkleone",
  }),
  movieId: z.number().openapi({
    example: 1,
  }),
  character: z.string().openapi({
    example: "Don Vito Honkleone",
  }),
  description: z.string().optional().openapi({
    example: "The patriarch of the Honkleone crime family",
  }),
}).openapi("NewFamousGoose");

const NewGooseQuoteSchema = z.object({
  gooseId: z.number().openapi({
    example: 1,
  }),
  quote: z.string().openapi({
    example: "I'm gonna make him a honk he can't refuse.",
  }),
  context: z.string().optional().openapi({
    example: "Speaking to Tom Hagen about resolving a dispute",
  }),
  timestamp: z.string().optional().openapi({
    example: "00:45:30",
  }),
}).openapi("NewGooseQuote");

const NewMovieSchema = z.object({
  title: z.string().openapi({
    example: "The Goosefather",
  }),
  director: z.string().openapi({
    example: "Goose Coppola",
  }),
  releaseDate: z.string().openapi({
    example: "1972-03-24",
  }),
}).openapi("NewMovie");

const RootResponseSchema = z.object({
  message: z.string().openapi({
    example: "International Goose Movie Database 🪿 🎬",
    description: "A description and a goose and movie emoji"
  })
}).openapi("RootResponse");

const getMovies = createRoute({
  method: "get",
  path: "/api/movies",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(MovieSchema) } },
      description: "Movies fetched successfully",
    },
  },
});

const getMovie = createRoute({
  method: "get",
  path: "/api/movies/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: MovieSchema } },
      description: "Movie fetched successfully",
    },
  },
});

const createMovie = createRoute({
  method: "post",
  path: "/api/movie",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: NewMovieSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: MovieSchema,
        },
      },
      description: "Movie created successfully",
    },
  },
});

const getFamousGeese = createRoute({
  method: "get",
  path: "/api/geese",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(FamousGooseSchema) } },
      description: "Famous geese fetched successfully",
    },
  },
});

const getFamousGoose = createRoute({
  method: "get",
  path: "/api/geese/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: FamousGooseSchema } },
      description: "Famous goose fetched successfully",
    },
  },
});

const createFamousGoose = createRoute({
  method: "post",
  path: "/api/geese",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: NewFamousGooseSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: FamousGooseSchema,
        },
      },
      description: "Famous goose created successfully",
    },
  },
});

const getGooseQuotes = createRoute({
  method: "get",
  path: "/api/quotes",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(GooseQuoteSchema) } },
      description: "Goose quotes fetched successfully",
    },
  },
});

const getGooseQuote = createRoute({
  method: "get",
  path: "/api/quotes/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: GooseQuoteSchema } },
      description: "Goose quote fetched successfully",
    },
  },
});

const createGooseQuote = createRoute({
  method: "post",
  path: "/api/quotes",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: NewGooseQuoteSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: GooseQuoteSchema,
        },
      },
      description: "Goose quote created successfully",
    },
  },
});

const getRoot = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: { "application/json": { schema: RootResponseSchema } },
      description: "Welcome message with goose and movie emojis",
    },
  },
});

// Route Implementations
app.openapi(getRoot, async (c) => {
  return c.json({ message: "International Goose Movie Database 🪿 🎬" });
})
  .openapi(getMovies, async (c) => {
    const db = c.get("db");
    const movies = await db.select().from(schema.movies);
    return c.json(movies);
  })
  .openapi(getMovie, async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const [movie] = await db.select().from(schema.movies).where(eq(schema.movies.id, id));
    return c.json(movie);
  })
  .openapi(createMovie, async (c) => {
    const db = c.get("db");
    const { title, director, releaseDate } = c.req.valid("json");

    const [newMovie] = await db
      .insert(schema.movies)
      .values({
        title,
        director,
        releaseDate,
      })
      .returning();

    return c.json(newMovie, 201);
  })
  .openapi(getFamousGeese, async (c) => {
    const db = c.get("db");
    const geese = await db.select().from(schema.famousGeese);
    return c.json(geese);
  })
  .openapi(getFamousGoose, async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const [goose] = await db.select().from(schema.famousGeese).where(eq(schema.famousGeese.id, id));
    return c.json(goose);
  })
  .openapi(createFamousGoose, async (c) => {
    const db = c.get("db");
    const { name, movieId, character, description } = c.req.valid("json");

    const [newGoose] = await db
      .insert(schema.famousGeese)
      .values({
        name,
        movieId,
        character,
        description,
      })
      .returning();

    return c.json(newGoose, 201);
  })
  .openapi(getGooseQuotes, async (c) => {
    const db = c.get("db");
    const quotes = await db.select().from(schema.gooseQuotes);
    return c.json(quotes);
  })
  .openapi(getGooseQuote, async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const [quote] = await db.select().from(schema.gooseQuotes).where(eq(schema.gooseQuotes.id, id));
    return c.json(quote);
  })
  .openapi(createGooseQuote, async (c) => {
    const db = c.get("db");
    const { gooseId, quote, context, timestamp } = c.req.valid("json");

    const [newQuote] = await db
      .insert(schema.gooseQuotes)
      .values({
        gooseId,
        quote,
        context,
        timestamp,
      })
      .returning();

    return c.json(newQuote, 201);
  })
  // Generate OpenAPI spec at /openapi.json
  .doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Cinegoose API",
      version: "1.0.0",
      description: "A movie collection API featuring famous geese and their memorable quotes",
    },
  })
  .use("/fp/*", createFiberplane({
    openapi: { url: "/openapi.json" },
  }));

export default app;
