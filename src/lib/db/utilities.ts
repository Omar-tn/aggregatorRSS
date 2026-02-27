
export async function firstOrUndefined(res: any[]) {

   
    if (res.length == 0)
        return undefined;

    else
        return res[0];


}
