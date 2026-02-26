
import {XMLParser} from 'fast-xml-parser';
import { Feed } from './Feed';

export async function fetchFeed(feedURL:string) {
    

    const res = await fetch(feedURL,{

        method: 'get',
        headers: {
            'content-Type' :'application/json',
            'User-Agent' : 'gator'
        },
        mode: 'cors'


        
    })

    let text =  await res.text();
    let parsObj = new XMLParser();
    let parsed = await parsObj.parse(text);
    console.log(parsed);
    parsed = parsed.rss;
    if(!parsed.channel){
        console.error('No channel found!')
        process.exit(1);
    }

    if(!parsed.channel.title || !parsed.channel.link || !parsed.channel.description ){
        console.error('Fields not found!')
        process.exit(1);
    }
    let channel = parsed.channel;
    let title = channel.title, link = channel.link, description = channel.descripition ;
    
    let items:{
        title: string,
        link: string,
        description: string,
        pubDate: string        
    }[] = [];
    if(Array.isArray(channel.item))
        channel.item.forEach((element: any) => {
           if(!element.title || !element.link || !element.description || !element.pubDate) 
            return;
           items.push({
            title : element.title,
            link: element.link,
            description: element.description,
            pubDate: element.pubDate
            }) ;
        });
    else
        channel.item = [];

    let obj = {
        title: channel.title,
        link: channel.link,
        description: channel.description,
        items: items
    }

    return obj;


    
    



}

