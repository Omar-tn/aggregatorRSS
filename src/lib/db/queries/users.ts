import { readConfig } from "src/config";
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name)).limit(1);
    return result;
}

export async function deleteUsers() {

  const res = await db.delete(users)//.returning();//.where(eq(users.name,users.name)).returning();
  return res;
  
}

export async function getUsers() {
  
  const res = db.select().from(users);
  return res;

}

export async function getUserById(id:string) {
  

  let [res] = await db.select().from(users).where(eq(users.id , id)).limit(1);
  return res;
}

export async function getCurrentUser() {
  
  let name = readConfig().currentUserName;
  let user = await getUserByName(name);
  return user;

}