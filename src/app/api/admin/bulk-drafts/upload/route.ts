import {NextRequest,NextResponse} from "next/server";
import {adminClient} from "@/lib/shivora-admin";
export async function POST(req:NextRequest){
 const a=await adminClient();if(a.error)return NextResponse.json({error:a.error},{status:a.status});
 const form=await req.formData().catch(()=>null);const file=form?.get("file");
 if(!(file instanceof File)||!file.type.startsWith("image/")||file.size>8*1024*1024||file.size===0)return NextResponse.json({error:"Image required (max 8 MB)"},{status:400});
 const ext=({ "image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif" } as Record<string,string>)[file.type];
 if(!ext)return NextResponse.json({error:"Unsupported image format"},{status:400});
 const path=a.user!.id+"/"+crypto.randomUUID()+"."+ext;
 const {error}=await a.db.storage.from("product-images").upload(path,file,{contentType:file.type,upsert:false});
 if(error)return NextResponse.json({error:error.message},{status:500});
 const {data}=a.db.storage.from("product-images").getPublicUrl(path);
 return NextResponse.json({url:data.publicUrl});
}