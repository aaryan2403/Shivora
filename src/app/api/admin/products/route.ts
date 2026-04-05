import { NextResponse, type NextRequest } from "next/server";
import type { Product } from "@/context/ShopContext";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, status: 401 as const, error: "Unauthorized" };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    return { supabase, status: 500 as const, error: adminError.message };
  }

  if (!adminRow?.user_id) {
    return { supabase, status: 403 as const, error: "Forbidden" };
  }

  return { supabase, status: 200 as const, error: null };
}

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
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = auth.supabase;

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

type CreateProductBody = {
  name: string;
  category: string;
  collection?: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  isHighJewelry?: boolean;
  stock?: number;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = auth.supabase;

  const body = (await request.json()) as Partial<CreateProductBody>;

  if (!body.name || !body.category || !body.price || !body.image) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const insertRow = {
    name: body.name,
    category: body.category,
    collection: body.collection ?? null,
    price: body.price,
    image: body.image,
    images: body.images ?? null,
    description: body.description ?? null,
    is_high_jewelry: body.isHighJewelry ?? false,
    stock: body.stock ?? null,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(insertRow)
    .select("id,name,category,collection,price,image,images,description,is_high_jewelry,stock")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ product: mapProduct(data as DbProduct) }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = auth.supabase;

  const body = (await request.json()) as Partial<CreateProductBody> & { id?: number };

  if (!body.id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const updateRow: any = {};
  if (body.name !== undefined) updateRow.name = body.name;
  if (body.category !== undefined) updateRow.category = body.category;
  if (body.collection !== undefined) updateRow.collection = body.collection;
  if (body.price !== undefined) updateRow.price = body.price;
  if (body.image !== undefined) updateRow.image = body.image;
  if (body.images !== undefined) updateRow.images = body.images;
  if (body.description !== undefined) updateRow.description = body.description;
  if (body.isHighJewelry !== undefined) updateRow.is_high_jewelry = body.isHighJewelry;
  if (body.stock !== undefined) updateRow.stock = body.stock;

  const { data, error } = await supabase
    .from("products")
    .update(updateRow)
    .eq("id", body.id)
    .select("id,name,category,collection,price,image,images,description,is_high_jewelry,stock")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ product: mapProduct(data as DbProduct) }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.status !== 200) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = auth.supabase;

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
