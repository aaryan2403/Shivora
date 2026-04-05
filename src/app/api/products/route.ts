import { NextResponse } from "next/server";
import type { Product } from "@/context/ShopContext";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbProduct = {
  id: number;
  name: string;
  category: string;
  collection: string | null;
  price: string;
  image: string;
  images: string[] | null;
  description: string | null;
  is_high_jewelry: boolean | null;
  stock: number | null;
};

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    collection: row.collection ?? undefined,
    price: row.price,
    image: row.image,
    images: row.images ?? undefined,
    description: row.description ?? undefined,
    isHighJewelry: row.is_high_jewelry ?? undefined,
    stock: row.stock ?? undefined,
  };
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,category,collection,price,image,images,description,is_high_jewelry,stock")
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data as DbProduct[]).map(mapProduct);

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
