import { pgTable, text, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").notNull().unique(),
  title: text("title").notNull(),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  voteAverage: text("vote_average"),
  genres: text("genres"),
  runtime: integer("runtime"),
  cast: text("cast"),
  mediaType: text("media_type").default("movie").notNull(), // "movie" or "tv"
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(), // ID of the movie or TV show
  mediaType: text("media_type").default("movie").notNull(), // "movie" or "tv"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
