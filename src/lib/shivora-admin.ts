import { createClient } from "@/lib/supabase/server";
export async function adminClient() {
 const db=await createClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user) return {db,error:"Unauthorized",status:401};
 const {data:admin}=await db.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin) return {db,error:"Forbidden",status:403};
 return {db,user,error:null,status:200};
}
