import { CommandHandler, UserCommandHandler, addfeedHandler } from "./commands";
import { getUserByName } from "./lib/db/queries/users";
import { readConfig } from "./config";


export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {

    return async (cmdName: string, ...args:string[]): Promise<void> => {
        


        const userName = readConfig().currentUserName;
        if (!userName) {
            throw new Error("User not logged in");
        }     
       
        let user = await getUserByName(userName);
            
        if (!user) {
           throw new Error(`User ${userName} not found`);
        }

        await handler (cmdName, user, ...args);

    }
    

}
