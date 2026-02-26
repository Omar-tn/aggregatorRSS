import { register } from "node:module";
import { registerCommand, CommmandsRegistry, handlerLogin, registerHandler, runCommand, resetHandler, usersHandler, aggHandler, addfeedHandler, feedsHandler, followHandler, followingHandler } from "./commands.js";
import { middlewareLoggedIn } from "./middlewareLoggedIn.js";
import { setUser, readConfig } from "./config.js";
import {argv} from 'node:process';
import { getUserByName } from "./lib/db/queries/users.js";
async function main() {
  //console.log("Hello, world!");
  
  let commandRegistry : CommmandsRegistry = {}; 
  registerCommand(commandRegistry, 'login', handlerLogin);
  registerCommand(commandRegistry, 'register', registerHandler);
  registerCommand(commandRegistry, 'reset', resetHandler);
  registerCommand(commandRegistry, 'users', usersHandler);
  registerCommand(commandRegistry, 'agg', aggHandler);
  registerCommand(commandRegistry, 'addfeed', middlewareLoggedIn(addfeedHandler));
  registerCommand(commandRegistry, 'feeds' , feedsHandler);
  registerCommand(commandRegistry, 'follow', middlewareLoggedIn(followHandler));
  registerCommand(commandRegistry, 'following', middlewareLoggedIn(followingHandler))
  
  
  //console.log (await getUserByName('lane'));
  let arg = argv.slice(2);
  if(!arg.length) {
    // exit with code 1 and print error message not enough arguments were provided
    console.error("Error: Not enough arguments provided");


    process.exit(1);
  
    
  }
  let cmdName = arg[0];
  let cmdArgs = arg.slice(1);
  try {
  
    await runCommand(commandRegistry, cmdName, ...cmdArgs);
  }catch (error) {
    console.error(error);
    process.exit(1);
  }

  let config = readConfig();
  //console.log(config);
  //console.log (await getUserByName('lane'));
  process.exit(0);
}

main();

