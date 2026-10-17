import { NextRequest,NextResponse } from "next/server";
import { adminClient } from "@/lib/shivora-admin";
export const dynamic="force-dynamic";
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
export async function GET(request:NextRequest){
 const a=await adminClient();if(a.error)return fail(a.error,a.status);
 const collectionId=request.nextUrl.searchParams.get("collectionId");
 let q=a.db.from("product_drafts").select("*,product_draft_collections(collection_id)").order("created_at",{ascending:false});
 const {data,error}=await q;
 if(error)return fail(error.message,500);
 return NextResponse.json({drafts:collectionId?data?.filter(d=>d.product_draft_collections?.some((c:{collection_id:number})=>c.collection_id===Number(collectionId))):data});
}
export async function POST(request:NextRequest){
 const a=await adminClient();if(a.error)return fail(a.error,a.status);
 const body=await request.json().catch(()=>null);
 const collectionIds=body?.collectionIds;
 if(!Array.isArray(collectionIds)||!collectionIds.length||!collectionIds.every((n:unknown)=>Number.isInteger(n)))return fail("Select a collection");
 const {data:collections,error:ce}=await a.db.from("collections").select("id").in("id",collectionIds);
 if(ce||collections?.length!==new Set(collectionIds).size)return fail("Invalid collections");
 const {data,error}=await a.db.from("product_drafts").insert({created_by:a.user!.id,name:String(body.name||""),description:String(body.description||""),image_paths:Array.isArray(body.images)?body.images:[],material:"Anti-tarnish",stock:1}).select("*").single();
 if(error)return fail(error.message,500);
 const {error:linkError}=await a.db.from("product_draft_collections").insert(collectionIds.map((id:number)=>({draft_id:data.id,collection_id:id})));
 if(linkError){await a.db.from("product_drafts").delete().eq("id",data.id);return fail(linkError.message,500);}
 return NextResponse.json({draft:data},{status:201});
}
export async function PATCH(request:NextRequest){
 const a=await adminClient();if(a.error)return fail(a.error,a.status);
 const body=await request.json().catch(()=>null);if(!body?.id)return fail("Draft ID required");
 const allowed=["name","description","material","price_cad","stock","image_paths"] as const;
 const patch:Record<string,unknown>={updated_at:new Date().toISOString()};
 for(const key of allowed)if(Object.prototype.hasOwnProperty.call(body,key))patch[key]=body[key];
 if(patch.price_cad!==undefined&&patch.price_cad!==null&&(!Number.isFinite(Number(patch.price_cad))||Number(patch.price_cad)<0))return fail("Invalid price");
 if(patch.stock!==undefined&&(!Number.isInteger(patch.stock)||Number(patch.stock)<0))return fail("Invalid stock");
 if(patch.image_paths!==undefined&&(!Array.isArray(patch.image_paths)||!patch.image_paths.every((v:unknown)=>typeof v==="string")))return fail("Invalid images");
 const {data,error}=await a.db.from("product_drafts").update(patch).eq("id",body.id).eq("status","draft").select().single();
 if(error)return fail(error.message,500);
 if(Array.isArray(body.collectionIds)){
  if(!body.collectionIds.length||!body.collectionIds.every((v:unknown)=>Number.isInteger(v)))return fail("Invalid collections");
  const {data:existing}=await a.db.from("collections").select("id").in("id",body.collectionIds);
  if(existing?.length!==new Set(body.collectionIds).size)return fail("Invalid collections");
  const {error:delError}=await a.db.from("product_draft_collections").delete().eq("draft_id",body.id);
  if(delError)return fail(delError.message,500);
  const {error:insError}=await a.db.from("product_draft_collections").insert(body.collectionIds.map((id:number)=>({draft_id:body.id,collection_id:id})));
  if(insError)return fail(insError.message,500);
 }
 return NextResponse.json({draft:data});
}
export async function DELETE(request:NextRequest){
 const a=await adminClient();if(a.error)return fail(a.error,a.status);
 const id=request.nextUrl.searchParams.get("id");if(!id)return fail("ID required");
 const {error}=await a.db.from("product_drafts").delete().eq("id",id).eq("status","draft");
 if(error)return fail(error.message,500);return NextResponse.json({ok:true});
}
