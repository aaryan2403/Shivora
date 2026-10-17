import { NextRequest,NextResponse } from "next/server";
import { adminClient } from "@/lib/shivora-admin";
export async function POST(req:NextRequest){
 const a=await adminClient();if(a.error)return NextResponse.json({error:a.error},{status:a.status});
 const body=await req.json().catch(()=>null);
 if(!Array.isArray(body?.ids)||!body.ids.length)return NextResponse.json({error:"Select drafts"},{status:400});
 const results:{id:string;ok:boolean;error?:string}[]=[];
 for(const id of [...new Set(body.ids as string[])]){
  const {data:d,error}=await a.db.from("product_drafts").select("*,product_draft_collections(collection_id)").eq("id",id).single();
  if(error||!d||d.status!=="draft"){results.push({id,ok:false,error:"Draft unavailable"});continue;}
  if(!d.name?.trim()||!d.image_paths?.length||d.price_cad===null||!Number.isFinite(Number(d.price_cad))||Number(d.price_cad)<0){results.push({id,ok:false,error:"Name, photo and valid price required"});continue;}
  const collectionIds=(d.product_draft_collections||[]).map((c:{collection_id:number})=>c.collection_id);
  const {data:collections}=await a.db.from("collections").select("id,name").in("id",collectionIds);
  if(!collections?.length){results.push({id,ok:false,error:"Collection required"});continue;}
  // Mark as publishing before insertion to avoid duplicate submissions.
  const {data:claimed}=await a.db.from("product_drafts").update({status:"publishing"}).eq("id",id).eq("status","draft").select("id").maybeSingle();
  if(!claimed){results.push({id,ok:false,error:"Already being published"});continue;}
  const {data:p,error:pe}=await a.db.from("products").insert({name:d.name.trim(),description:d.description,material:d.material||"Anti-tarnish",price:"$"+Number(d.price_cad).toFixed(2),category:"Jewelry",collection:collections[0].name,image:d.image_paths[0],images:d.image_paths,stock:d.stock??1,is_high_jewelry:false}).select("id").single();
  if(pe||!p){await a.db.from("product_drafts").update({status:"draft"}).eq("id",id);results.push({id,ok:false,error:pe?.message||"Insert failed"});continue;}
  const {error:le}=await a.db.from("product_collections").insert(collections.map(c=>({product_id:p.id,collection_id:c.id})));
  if(le){await a.db.from("products").delete().eq("id",p.id);await a.db.from("product_drafts").update({status:"draft"}).eq("id",id);results.push({id,ok:false,error:le.message});continue;}
  await a.db.from("product_drafts").update({status:"published",published_product_id:p.id}).eq("id",id);
  results.push({id,ok:true});
 }
 return NextResponse.json({results});
}
