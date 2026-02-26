import { readConfig } from "./config";
import { db } from "./lib/db";
import { getUserByName } from "./lib/db/queries/users";
import { feed_follows, feeds, users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

/* export type Feed = {
    title: string;
    link: string;
    description: string;
    items: FeedItem[];
}; */

export type FeedItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;


export async function createFeed(id: string, ...args: string[]) {

    let result  ;
    
    try{

         [result] = await db.insert(feeds).values({ 
            name: args[0],
            url: args[1],
            user_id: id }).returning();
        
        console.log('Feed added successfully');

        
    }catch(error){
        console.error('Error: ', error);
        process.exit(1);
    }
        
    
    return result;

}

export async function printFeed(feed: Feed, user: User) {
   
    console.log('title: ',feed.name);
    console.log ('URL: ' ,feed.url);
    console.log('Created At: ',feed.createdAt);
    console.log('By: ',user.name);


}

export async function getAllFeeds() {
    
    let res = await db.select().from(feeds);
    //console.log(res);
    
    return res;

}

export async function createFeedFollow(feedId: string, userId: string) {
    


    let [res] = await db.insert(feed_follows).values({
        user_id: userId,
        feed_id: feedId
    }).returning();
     let resp = await db.select({
        feedid: feed_follows.id,
        userid: feed_follows.user_id,
        createdat: feed_follows.createdAt,
        updatedat: feed_follows.updatedAt,
        feedname: feeds.name,
        username: users.name
     }).from(feed_follows).innerJoin(feeds, eq(feed_follows.feed_id , feeds.id))
     .innerJoin(users, eq(users.id, feed_follows.user_id));

    return resp;

}

export async function getFeedByURL(url:string) {
    
    let [res] = await db.select().from(feeds).where(eq(feeds.url,url));
    return res;
}

export async function getFeedFollowForUser(user:User) {
    
    let res = await db.select().from(feed_follows).where(eq(feed_follows.user_id, user.id))
    .innerJoin(users,eq(users.id, feed_follows.user_id))
    .innerJoin(feeds, eq(feed_follows.feed_id , feeds.id));
    return res;

}