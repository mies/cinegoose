import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type NewUser = typeof users.$inferInsert;
export type NewMovie = typeof movies.$inferInsert;
export type NewFamousGoose = typeof famousGeese.$inferInsert;
export type NewGooseQuote = typeof gooseQuotes.$inferInsert;

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const movies = sqliteTable("movies", {
  id: integer("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  director: text("director").notNull(),
  releaseDate: text("release_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const famousGeese = sqliteTable("famous_geese", {
  id: integer("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  character: text("character").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const gooseQuotes = sqliteTable("goose_quotes", {
  id: integer("id", { mode: "number" }).primaryKey(),
  gooseId: integer("goose_id").references(() => famousGeese.id).notNull(),
  quote: text("quote").notNull(),
  context: text("context"),
  timestamp: text("timestamp"), // For storing the movie timestamp of the quote
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});