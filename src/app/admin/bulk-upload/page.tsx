"use client";
import {useEffect,useState} from "react";
type Collection={id:number;name:string};
type Draft={id:string;name:string;description:string;material:string;price_cad:number|null;stock:number;image_paths:string[];status:string;product_draft_collections:{collection_id:number}[]};
async function json(url:string,options?:RequestInit){const r=await fetch(url,options);const d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");return d;}
const body=(data:unknown):RequestInit=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
export default function BulkUploadPage(){
 const [collections,setCollections]=useState<Collection[]>([]),[selected,setSelected]=useState<number|null>(null),[drafts,setDrafts]=useState<Draft[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[newName,setNewName]=useState("");
 const [saving,setSaving]=useState<Record<string,boolean>>({});
 async function refresh(){const c=await json("/api/collections");setCollections(c.collections);if(!selected&&c.collections.length)setSelected(c.collections[0].id);}
 async function load(id:number){const d=await json("/api/admin/bulk-drafts?collectionId="+id);setDrafts(d.drafts||[]);}
 useEffect(()=>{refresh().catch(e=>setMessage(e.message));},[]);
 useEffect(()=>{if(selected)load(selected).catch(e=>setMessage(e.message));},[selected]);
 async function collection(action:"create"|"rename"|"delete",id?:number){
  const name=action==="delete"?"":prompt("Collection name",action==="create"?newName:collections.find(c=>c.id===id)?.name||"");
  if(action!=="delete"&&!name?.trim())return;
  if(action==="delete"&&!confirm("Delete this collection? Products remain in inventory."))return;
  try{await json("/api/admin/collections"+(action==="delete"?"?id="+id:""),{method:action==="create"?"POST":action==="rename"?"PUT":"DELETE",headers:{"Content-Type":"application/json"},...(action!=="delete"?{body:JSON.stringify({id,name})}:{})});await refresh();if(action==="delete"&&selected===id)setSelected(null);setNewName("");}catch(e){setMessage(String(e));}
 }
 async function upload(files:FileList|null){if(!files||!selected)return;setBusy(true);setMessage("Uploading photos...");
  let ok=0;for(const file of Array.from(files)){try{
   const f=new FormData();f.append("file",file);
   const uploaded=await json("/api/admin/bulk-drafts/upload",{method:"POST",body:f});
   const created=await json("/api/admin/bulk-drafts",body({collectionIds:[selected],images:[uploaded.url]}));
   ok++;
   try{const ai=await json("/api/admin/bulk-drafts/ai",body({imageUrl:uploaded.url}));await json("/api/admin/bulk-drafts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:created.draft.id,name:ai.name,description:ai.description})});}catch{ /* keep editable draft if AI unavailable */ }
  }catch(e){setMessage("Some uploads failed: "+String(e));}}
  await load(selected);setBusy(false);setMessage(ok+" product drafts uploaded. Review names and add prices.");}
 function update(id:string,patch:Partial<Draft>){setDrafts(prev=>prev.map(d=>d.id===id?{...d,...patch}:d));}
 async function save(d:Draft){setSaving(p=>({...p,[d.id]:true}));try{await json("/api/admin/bulk-drafts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:d.id,name:d.name,description:d.description,material:d.material,price_cad:d.price_cad,stock:d.stock,image_paths:d.image_paths,collectionIds:d.product_draft_collections.map(c=>c.collection_id)})});setMessage("Saved "+(d.name||"draft"));}catch(e){setMessage(String(e));}finally{setSaving(p=>({...p,[d.id]:false}));}}
 async function addPhotos(d:Draft,files:FileList|null){if(!files)return;setBusy(true);try{const images=[...d.image_paths];for(const file of Array.from(files)){const f=new FormData();f.append("file",file);const r=await json("/api/admin/bulk-drafts/upload",{method:"POST",body:f});images.push(r.url);}update(d.id,{image_paths:images});await json("/api/admin/bulk-drafts",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:d.id,image_paths:images})});}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 async function publish(){if(!selected)return;setBusy(true);try{for(const d of drafts.filter(d=>d.status==="draft"))await save(d);const ids=drafts.filter(d=>d.status==="draft").map(d=>d.id);const r=await json("/api/admin/bulk-drafts/publish",body({ids}));setMessage(r.results.filter((x:{ok:boolean})=>x.ok).length+" published; "+r.results.filter((x:{ok:boolean})=>!x.ok).length+" failed.");await load(selected);}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 return <main className="min-h-screen bg-obsidian text-creme px-4 py-10 md:px-12"><div className="mx-auto max-w-5xl space-y-6">
 <a href="/admin" className="text-sm underline">← Back to dashboard</a><h1 className="font-serif text-3xl">Collections & Bulk Upload</h1>
 <p className="text-sm text-ash">Create a collection, upload photos, review AI suggestions, enter prices and publish. Drafts are stored in Supabase.</p>
 <div className="flex flex-wrap gap-2"><button className="border p-3" onClick={()=>collection("create")}>+ New collection</button>{collections.map(c=><div key={c.id} className={"border p-2 "+(selected===c.id?"border-white":"border-gray-600")}><button onClick={()=>setSelected(c.id)}>{c.name}</button><button className="ml-3" title="Rename" onClick={()=>collection("rename",c.id)}>✎</button><button className="ml-2" title="Delete" onClick={()=>collection("delete",c.id)}>×</button></div>)}</div>
 {selected&&<><label className="block border border-dashed p-8 text-center cursor-pointer"> {busy?"Working...":"Choose multiple photos to bulk upload"}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="block mx-auto mt-3 max-w-full" disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value="";}}/></label>
 <div className="flex justify-between items-center"><h2 className="text-xl">Product drafts ({drafts.filter(d=>d.status==="draft").length})</h2><button className="bg-creme text-obsidian px-4 py-3 disabled:opacity-50" disabled={busy||!drafts.some(d=>d.status==="draft")} onClick={publish}>Save & publish drafts</button></div>
 {drafts.map(d=><section key={d.id} className="border border-ash/30 p-4 space-y-3"><div className="flex flex-wrap gap-2">{d.image_paths.map((url,i)=><div key={i} className="relative"><img src={url} alt="Jewellery" className="w-24 h-24 object-cover"/>{d.status==="draft"&&<button className="absolute top-0 right-0 bg-black px-2" onClick={()=>update(d.id,{image_paths:d.image_paths.filter((_,j)=>j!==i)})}>×</button>}</div>)}</div>
 <div className="grid gap-3 md:grid-cols-2"><label>Name<input className="block w-full p-2 bg-transparent border" value={d.name} disabled={d.status!=="draft"} onChange={e=>update(d.id,{name:e.target.value})}/></label><label>Price CAD<input className="block w-full p-2 bg-transparent border" type="number" min="0" step=".01" value={d.price_cad??""} disabled={d.status!=="draft"} onChange={e=>update(d.id,{price_cad:e.target.value===""?null:Number(e.target.value)})}/></label><label>Material<input className="block w-full p-2 bg-transparent border" value={d.material} disabled={d.status!=="draft"} onChange={e=>update(d.id,{material:e.target.value})}/></label><label>Quantity<input className="block w-full p-2 bg-transparent border" type="number" min="0" value={d.stock} disabled={d.status!=="draft"} onChange={e=>update(d.id,{stock:Number(e.target.value)})}/></label></div>
 <label className="block">Description<textarea className="block w-full p-2 bg-transparent border" value={d.description} disabled={d.status!=="draft"} onChange={e=>update(d.id,{description:e.target.value})}/></label>
 <label className="block">Collections<div className="flex flex-wrap gap-3">{collections.map(c=><label key={c.id} className="text-sm"><input type="checkbox" disabled={d.status!=="draft"} checked={d.product_draft_collections.some(x=>x.collection_id===c.id)} onChange={e=>update(d.id,{product_draft_collections:e.target.checked?[...d.product_draft_collections,{collection_id:c.id}]:d.product_draft_collections.filter(x=>x.collection_id!==c.id)})}/> {c.name}</label>)}</div></label>
 {d.status==="draft"?<div className="flex gap-4 flex-wrap"><label>Add photos<input type="file" multiple accept="image/*" disabled={busy} onChange={e=>{void addPhotos(d,e.target.files);e.target.value="";}}/></label><button className="border px-4 py-2" disabled={saving[d.id]} onClick={()=>save(d)}>{saving[d.id]?"Saving...":"Save draft"}</button><button className="text-red-300" onClick={async()=>{if(!confirm("Delete draft?"))return;await json("/api/admin/bulk-drafts?id="+d.id,{method:"DELETE"});await load(selected);}}>Delete draft</button></div>:<span>Published</span>}</section>)}</>}
 <p role="status" className="text-sm text-ash">{message}</p>
 </div></main>;
}
