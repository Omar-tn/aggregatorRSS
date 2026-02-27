import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { table } from "node:console";
import { title } from "node:process";
import test, { describe } from "node:test";



export const users = pgTable("users",{
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {

  id : uuid('id').primaryKey().defaultRandom().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  user_id: uuid('user_id').notNull().references(() =>users.id,{
    onDelete: 'cascade'
  }),
  last_fetched_at: timestamp('last_fetched_at').$onUpdate(() => new Date()),

    
    

}); 

export const feed_follows = pgTable('feed_follows',{
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid('user_id').notNull().references(()=> users.id, {
                                                                  onDelete: 'cascade',
                                                                }),
  feed_id: uuid('feed_id').notNull().references(() => feeds.id, {
                                                                  onDelete: 'cascade' 
                                                                }),
                                                                  

}, (table) =>({
  uniqueFollow: unique().on(table.feed_id, table.user_id)
})
);

export const posts = pgTable('posts',{
  id: uuid('id').notNull().defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  description: text('description'),
  publishedAt: timestamp('published_at'),
  feed_id: uuid('feed_id').notNull().references(()=> feeds.id, {
                                                                  onDelete: 'cascade',
                                                                }),

})

export type  Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

