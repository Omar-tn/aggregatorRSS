================================================================
================================================================

Set Up:

    - install NVM
    - run: nvm use
    - install postgres
    - install drizzle
    - install drizzle-kit
    -create a config file in your home directory, ~/.gatorconfig.json, with the following content: {
        "db_url": "connection_string_goes_here",
        "current_user_name": "username_goes_here"
        }
    - start postgres server in background eg.: sudo service postgresql start
    - enter psql client and create DATABASE gator
    -after seting password ( or if not required) edit "db_url" value in .gatorconfig.json to this format: protocol://username:password@host:port/database
    -after that it should be something like this: psql "postgres://wagslane:@localhost:5432/gator"




Runnig CLI:


    * npm run migrate
    * tpye npm run start <command-expression>
    * npm run start help => shows the <command-expression> usage and description for all commands
    * eg.: for register: npm run start register <username>

    
================================================================
================================================================