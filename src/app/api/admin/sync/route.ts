import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

async function requireAdmin(request: Request) {
  // Check demo admin cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const isDemo = cookieHeader.includes("shivora_admin_demo=true");
  
  if (isDemo) {
    return { authorized: true as const, supabase: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false as const, status: 401, error: "Unauthorized" };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow?.user_id) {
    return { authorized: false as const, status: 403, error: "Forbidden" };
  }

  return { authorized: true as const, supabase };
}

function generateProductsFile(products: Record<string, unknown>[]) {
  const items = products.map((p) => {
    const imgs = Array.isArray(p.images) ? p.images as string[] : [];
    const images = imgs.length > 0 ? `images: [${imgs.map((img: string) => `"${img}"`).join(", ")}],` : "";
    const desc = typeof p.description === "string" ? `description: "${p.description.replace(/"/g, '\\"')}",` : "";
    const coll = typeof p.collection === "string" ? `collection: "${p.collection}",` : "";
    const high = p.is_high_jewelry ? `isHighJewelry: true,` : "";
    const stock = typeof p.stock === "number" ? `stock: ${p.stock},` : "";
    const color = typeof p.color === "string" ? `color: "${p.color}",` : "";
    const name = typeof p.name === "string" ? p.name : "";
    const category = typeof p.category === "string" ? p.category : "";
    const price = typeof p.price === "string" ? p.price : "";
    const image = typeof p.image === "string" ? p.image : "";
    const id = typeof p.id === "number" ? p.id : 0;

    return `  {
    id: ${id},
    name: "${name.replace(/"/g, '\\"')}",
    category: "${category}",
    ${coll}
    price: "${price}",
    image: "${image}",
    ${images}
    ${desc}
    ${high}
    ${stock}
    ${color}
  }`;
  });

  return `import { Product } from "@/context/ShopContext";

export const products: Product[] = [
${items.join(",\n")},
];
`;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status || 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { message = "Update products from admin panel" } = body;

    // Fetch all products from Supabase
    let products: Record<string, unknown>[] = [];
    if (auth.supabase) {
      const { data, error } = await auth.supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch products: ${error.message}` },
          { status: 500 }
        );
      }
      products = data || [];
    } else {
      // Demo mode - no DB access, skip file generation but allow git push
      // if there are pending changes in the working directory
    }

    // Write products to file
    if (products.length > 0) {
      const fileContent = generateProductsFile(products);
      const filePath = path.join(process.cwd(), "src", "data", "products.ts");
      await fs.writeFile(filePath, fileContent, "utf-8");
    }

    // Git operations
    const cwd = process.cwd();
    const results: string[] = [];

    try {
      const { stdout: statusOut } = await execAsync("git status --porcelain", { cwd });
      
      if (!statusOut.trim()) {
        return NextResponse.json({
          success: true,
          pushed: false,
          message: "No changes to push",
          details: results,
        });
      }

      const { stdout: addOut } = await execAsync("git add -A", { cwd });
      results.push(`git add: ${addOut || "OK"}`);

      const { stdout: commitOut } = await execAsync(
        `git commit -m "${message.replace(/"/g, '\\"')}"`,
        { cwd }
      );
      results.push(`git commit: ${commitOut || "OK"}`);

      const { stdout: pushOut } = await execAsync("git push", { cwd });
      results.push(`git push: ${pushOut || "OK"}`);

      return NextResponse.json({
        success: true,
        pushed: true,
        message: "Changes synced and pushed to GitHub successfully",
        details: results,
      });
    } catch (gitError: unknown) {
      const gitErr = gitError as { stderr?: string; message?: string };
      return NextResponse.json({
        success: false,
        pushed: false,
        error: gitErr.stderr || gitErr.message || "Git operation failed",
        details: results,
        hint: "Make sure git is configured with valid credentials and remote origin is set.",
      }, { status: 500 });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
