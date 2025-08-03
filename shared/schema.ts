import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const models = pgTable("models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  vertices: integer("vertices"),
  triangles: integer("triangles"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  filePath: text("file_path").notNull(),
  category: text("category"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  uploadedAt: true,
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
});

export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof models.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
