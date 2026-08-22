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
  material: string | null;
  price: string;
  image: string;
  images: string[] | null;
  description: string | null;
  is_high_jewelry: boolean | null;
  stock: number | null;
};

type ProductPayload = {
  id?: number;
  name?: string;
  category?: string;
  collection?: string | null;
  material?: string | null;
  price?: string;
  image?: string;
  images?: string[];
  description?: string | null;
  isHighJewelry?: boolean;
  stock?: number | null;
};

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    collection: row.collection ?? undefined,
    material: row.material ?? undefined,
    price: row.price,
    image: row.image,
    images: row.images ?? undefined,
    description: row.description ?? undefined,
    isHighJewelry: row.is_high_jewelry ?? undefined,
    stock: row.stock ?? undefined,
  };
}

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    return {
      supabase,
      errorResponse: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { supabase, errorResponse: null };
}

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,category,collection,material,price,image,images,description,is_high_jewelry,stock"
    )
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

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const body = (await request.json()) as ProductPayload;

    const name = body.name?.trim();
    const price = body.price?.trim();
    const image = body.image?.trim();

    if (!name || !price || !image) {
      return NextResponse.json(
        { error: "Name, price, and main image are required" },
        { status: 400 }
      );
    }

    const payload = {
      name,
      category: body.category?.trim() || "Jewelry",
      collection: body.collection?.trim() || null,
      material: body.material?.trim() || null,
      price,
      image,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [image],
      description: body.description?.trim() || null,
      is_high_jewelry: body.isHighJewelry ?? false,
      stock:
        body.stock === null || body.stock === undefined
          ? null
          : Math.max(0, Number(body.stock)),
    };

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select(
        "id,name,category,collection,material,price,image,images,description,is_high_jewelry,stock"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { product: mapProduct(data as DbProduct) },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const body = (await request.json()) as ProductPayload;

    if (typeof body.id !== "number") {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    const name = body.name?.trim();
    const price = body.price?.trim();
    const image = body.image?.trim();

    if (!name || !price || !image) {
      return NextResponse.json(
        { error: "Name, price, and main image are required" },
        { status: 400 }
      );
    }

    const payload = {
      name,
      category: body.category?.trim() || "Jewelry",
      collection: body.collection?.trim() || null,
      material: body.material?.trim() || null,
      price,
      image,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [image],
      description: body.description?.trim() || null,
      is_high_jewelry: body.isHighJewelry ?? false,
      stock:
        body.stock === null || body.stock === undefined
          ? null
          : Math.max(0, Number(body.stock)),
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", body.id)
      .select(
        "id,name,category,collection,material,price,image,images,description,is_high_jewelry,stock"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      product: mapProduct(data as DbProduct),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid product id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
