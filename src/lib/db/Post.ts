import { getFeedsFromUser, User } from "src/Feed";
import { db } from ".";
import { feed_follows, feeds, Post, posts } from "./schema";
import { desc, inArray,eq } from "drizzle-orm";
import { firstOrUndefined } from "./utilities";
import { title } from "node:process";


export async function createPost(title: string,
  url: string,
  publishedAt: Date,
  feed_id: string,
  description?: string) {
    let now = new Date();
    let res = await db.insert(posts).values({
        feed_id: feed_id,
        publishedAt: publishedAt,
        title:title,
        url: url,
        description: description,
        updatedAt: now,
        createdAt: now

    }).returning();

    return res;


}

export async function getPostsForUser(user:User, num: number) {
    
    //let userFeeds = await getFeedsFromUser(user.id);
    /* let feedIds: string[] =[];
     userFeeds.forEach((e) =>{
        feedIds.push(e.id);
     })
 */
    let res = await db.
    select({
        id: posts.id,
        ceatedAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        title: posts.title,
        url: posts.url,
        description: posts.description,
        publishedAt: posts.publishedAt,
        feedName: feeds.name,

    }).
    from(posts)
    .innerJoin(feed_follows,eq(feed_follows.feed_id, posts.feed_id))
    .innerJoin(feeds,eq(feeds.id,feed_follows.feed_id))
    .where(eq(feed_follows.user_id,user.id))
    .orderBy(desc(posts.publishedAt))
    .limit(num);

    return res;


}

export async function getPostByURL(url: string) {

    let res = await db.select().from(posts).where(eq(posts.url, url));

    return firstOrUndefined(res);

}
