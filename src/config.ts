import * as os from "os";
import fs from "fs";
import path from "path";



export type Config ={
    dbUrl: string,
    currentUserName: string

}

export function setUser( n: string) {
    //set user to gatorconfig.json 
    let c= readConfig();
    c.currentUserName = n;
    writeConfig(c);
}

export function readConfig(): Config {
    //read gatorconfig.json from HOME directory and decode json string and return the config object
    
    let raw = fs.readFileSync(getConfigFilePath(), "utf-8");
    let c = validateConfig(JSON.parse(raw));
    return c;
}

function getConfigFilePath(): string {
    //get the path to gatorconfig.json in the home directory
    return path.join(os.homedir(), ".gatorconfig.json");
    //courses/ts/aggregatorRSS/
}

function writeConfig( c : Config) : void {
    //write the config object to gatorconfig.json in the home directory as a json string
   
    let d ={
    db_url: c.dbUrl,
    current_user_name: c.currentUserName
    }
    
   fs.writeFileSync(getConfigFilePath(), JSON.stringify(d));

}

function validateConfig( raw : any) :Config{

    if (typeof raw.db_url !== "string") {
        throw new Error("Invalid config: db_url must be a string");
    }
    if(raw.current_user_name)    
        if (typeof raw.current_user_name !== "string") {
            throw new Error("Invalid config: current_user_name must be a string");
    }
    return {
        dbUrl: raw.db_url,
        currentUserName: raw.current_user_name
    }




}