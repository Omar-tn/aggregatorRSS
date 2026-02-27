import { create } from "node:domain";
import { readConfig, setUser } from "./config";
import { createUser, deleteUsers, getCurrentUser, getUserById, getUserByName, getUsers } from "./lib/db/queries/users";
import { get } from "node:http";
import { fetchFeed } from "./rss";
import { createFeed, createFeedFollow, getAllFeeds, getFeedByURL, getFeedFollowForUser, printFeed, scrapeFeeds, unfollow, User } from "./Feed";
import { integer } from "drizzle-orm/gel-core";
import { parseDuration, convertToMilliseconds } from "./parseDuration";
import { getPostsForUser } from "./lib/db/Post";
import { middlewareLoggedIn } from "./middlewareLoggedIn";
import { feeds } from "./lib/db/schema";
import { cp } from "node:fs";

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if(!args.length){
        console.error("Error: Username is required for login command");
        process.exit(1);
    }
     let res = await getUserByName(args[0])
    if(!res){
        console.error(`Error: User ${args[0]} not exists`);
        process.exit(1);
    }
    setUser(args[0]);
    console.log(`Logged in as ${args[0]}`);
}

export async function registerHandler(cmdName: string, ...args: string[]) {
    
  

    if(!args.length){
        console.error("Error: Username is required for register command");
        process.exit(1);
    }
    let res = await getUserByName(args[0])
    if(res){
        console.error(`Error: User ${args[0]} already exists`);
        process.exit(1);
    }
      
    let result = await createUser(args[0]);
    setUser(result.name);
    console.log(`Created user ${ await result.name}`);
    

}

export async function resetHandler(cmdName:string, ...args: string[]) {

    let res = await deleteUsers();
    if(!res){
        console.log(`result: ${res}`);
        console.error('Error: users deletion fails!');
        process.exit(1);
    }
    console.log (`result: ${res}`);
    console.log('Users deleted !');
    process.exit(0);

    
}

export async function usersHandler(cmdName: string, ...args: string[]) {
    
    let res = await getUsers();
    let curr = await readConfig().currentUserName;
    res.forEach((user) => console.log(`* ${user.name}${user.name === curr? ' (current)':''}`));
    //console.log(res);

}

export async function aggHandler(cmdName:string, ...args: string[]) {
    
    if(args.length<1){
        console.error('Error: Expect duration argument');
        process.exit(1);
    }
    
   /*  let obj = await fetchFeed('https://techcrunch.com/feed/');// fetchFeed('https://www.wagslane.dev/index.xml');

    console.log(obj); */
    
    let duration = args[0];

    let match = parseDuration(duration);
    if(match)
        if(match.length<3){
            console.error('Error: Expect valid duration argument');
            process.exit(1);
        }

    let num = parseInt(match![1]);
    let unit = match![2];
    
    let intervalMs = convertToMilliseconds(num, unit);
    console.log('Collecting feeds every ', match![1], match![2]);

    //scrapeFeeds().catch(handleError);
     
    scrapeFeeds();//.catch(handleError)
    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, intervalMs);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
    
    


}

export async function addfeedHandler(cmdName: string, user: User, ...args: string[]) {
    
    if(args.length<2){
        console.error('Error: addfeed require 2 arguments !');
        process.exit(1);
    }
    let feed = await createFeed(user.id, ...args);
    let ff= await createFeedFollow(feed.id,user.id);



}


export async function feedsHandler(cmdName:string, ...args: string[]) {
    
   

    let feeds = await getAllFeeds();
    
    for (const e of feeds) {
        let user = await getUserById(e.user_id);
        await printFeed(e,user);
    }

}

export async function followHandler(cmdName: string, user: User, ...args:string[]) {// params
    
    if(args.length<1){
        console.error('Error: Expect URL !');
        process.exit(1);
    }
    let url = args[0];

    let feed = await getFeedByURL(url);
    
    let res = await createFeedFollow(feed.id,user.id);
    console.log('Feed\'s name: ',feed.name);
    console.log('User\'s name: ', user.name);



}

export async function followingHandler(cmdName: string, user: User, ...args: string[]) { //params
    
    
    let res = await getFeedFollowForUser(user);
    res.forEach(e => {
        console.log(e.feeds.name);
    })

}

export async function unfollowHandler(cmdName: string, user: User, ...args: string[]) {
    
        if(args.length<1){
        console.error('Error: Expect URL !');
        process.exit(1);
    }
    let url = args[0];

    let feed = await getFeedByURL(url);

    let res = await unfollow(feed,user);

    if(!res){
        console.error('Error: Unfollow Failed !');
        process.exit(1);
    }
    console.log('Unfollowed!');



}

export async function browseHandler(nmdName: string, user: User, ...args: string[]) {
    
    let limit;
    if(args.length> 0)
        limit = parseInt(args[0]);

    let res = await getPostsForUser(user, limit??2);
    console.log(`Found ${res.length} posts for user ${user.name}`);
    res.forEach((e)=>{
         console.log(`${e.publishedAt} from ${e.feedName}`);
        console.log('*** title: ',e.title);
        console.log('   ',e.description);
        console.log(`Link: ${e.url}`);
        console.log(`=====================================`);   
    })

}

export async function helpHanler(cmdName:string, ...args:string[]) {
    
    let commands = getCommands();
    
    for( let command in commands){

        console.log(command,"usage: ",commands[command].usage);
        console.log("description: ",commands[command].description);
        console.log('=============================================\n');
        


    }


}

export type commmandDocs ={
    [cmdName: string] : Command

}

export type Command = {
    name: string,
    usage: string,
    description: string
    callback: CommandHandler
}

export function getCommands(): Record<string,Command>{

    return {
        register: {
        name: "register",
        usage: "register <username>",
        description: "registers user in database",
        callback: registerHandler,
        },
        // can add more commands here
        login :{
            name: "login",
            description: "login as user",
            usage: "login <username>",
            callback: handlerLogin
        },
        reset: {
            name: "reset",
            usage: "reset",
            description: "Clears database's users",
            callback: resetHandler
        },
        users: {
            name: "users",
            usage: "users",
            description: "Lists all the users and indicates which one is currently logged in.",
            callback: usersHandler
        },
        agg: {
            name: "agg",
            usage: "agg <duration>",
            description: "Fetches the olddest/never fetched feed and prints its posts every specific period in this format: (amount)(ms | s | m | h )",
            callback: aggHandler
        },
        addfeed: {
            name: "addfeed",
            usage: "addfeed <name> <url>",
            description: "Adds feed to feeds database by the current user",
            callback: middlewareLoggedIn(addfeedHandler)


        },
        feeds: {
            name: "feeds",
            usage: "feeds ",
            description: "Lists all feeds in database",
            callback: feedsHandler
        },
        follow: {
            name: "follow",
            usage: "follow <url>",
            description: "Makes the current user to follow the feeds of the url",
            callback: middlewareLoggedIn(followHandler)
        },
        following: {
            name: "following",
            usage: "following",
            description: "Prints all the names of the feeds the current user is following",
            callback: middlewareLoggedIn(followingHandler)
        },
        unfollow: {
            name: "unfollow",
            usage: "unfollow <url>",
            description: "Makes the current user to unfollow the feeds of the url",
            callback: middlewareLoggedIn(unfollowHandler)
        },
        browse: {
            name: "browse",
            usage: "browse [limit]",
            description: "Gets the latest posts for the user with optional number limit of posts",
            callback: middlewareLoggedIn(browseHandler)
        }
    };


}


export type CommmandsRegistry = {
    [cmdName: string]: CommandHandler
}

export function registerCommand( registry: CommmandsRegistry, cmdName: string, handler: CommandHandler) {

    registry[cmdName] = handler;
}

export async function runCommand (registry: CommmandsRegistry, cmdName: string, ...args: string[]) {

    const handler = registry[cmdName];
    if(!handler) {
        console.error(`Error: Command ${cmdName} not found`);
        process.exit(1);
    }
    let res = await handler(cmdName, ...args);
}
function handleError(reason: any): PromiseLike<never> {
    console.error("Error during feed scraping:", reason);
    return Promise.reject(reason);
}

