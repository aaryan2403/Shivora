import {NextRequest,NextResponse} from "next/server";
import {adminClient} from "@/lib/shivora-admin";
export async function POST(req:NextRequest){
 const a=await adminClient();if(a.error)return NextResponse.json({error:a.error},{status:a.status});
 const key=process.env.OPENAI_API_KEY;
 if(!key)return NextResponse.json({error:"AI generation is not configured. Add OPENAI_API_KEY to server environment."},{status:503});
 const body=await req.json().catch(()=>null);const url=body?.imageUrl;
 if(typeof url!=="string"||!url.startsWith("https://")||!url.includes("/storage/v1/object/public/product-images/"))return NextResponse.json({error:"Invalid product image URL"},{status:400});
 const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.SHIVORA_VISION_MODEL||"gpt-4o-mini",temperature:0.3,response_format:{type:"json_object"},messages:[{role:"system",content:"You write concise ecommerce jewellery names and descriptions. Describe only visible characteristics. Never assert metal, gemstone authenticity, anti-tarnish performance, plating, size or origin from an image. Return JSON object with name and description strings."},{role:"user",content:[{type:"text",text:"Generate a short appealing product name and 1-2 sentence description for this jewellery item."},{type:"image_url",image_url:{url}}]}]})});
 const data=await response.json().catch(()=>null);
 if(!response.ok)return NextResponse.json({error:"AI service failed"},{status:502});
 try{const parsed=JSON.parse(data.choices[0].message.content);return NextResponse.json({name:String(parsed.name||"").slice(0,150),description:String(parsed.description||"").slice(0,1000)});}catch{return NextResponse.json({error:"AI response could not be parsed"},{status:502});}
}