"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProducts } from "@/lib/useProducts";

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const { products, loading, error, refetch } = useProducts();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Rings");
  const [collection, setCollection] = useState("Obsidian");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isHighJewelry, setIsHighJewelry] = useState(false);
  const [stock, setStock] = useState<number | "">("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const handleEdit = (p: typeof products[0]) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setCollection(p.collection || "Obsidian");
    setPrice(p.price);
    setDescription(p.description || "");
    setIsHighJewelry(p.isHighJewelry || false);
    setStock(p.stock ?? "");
    setImageFiles([]); // Editing images requires re-uploading for now or we just keep old if empty
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setCategory("Rings");
    setCollection("Obsidian");
    setPrice("");
    setDescription("");
    setIsHighJewelry(false);
    setStock("");
    setImageFiles([]);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      if (!editingId && imageFiles.length === 0) {
        throw new Error("Please choose at least one image file for new products");
      }

      let uploadedUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const filename = `${Date.now()}-${file.name}`;
          const path = `products/${filename}`;

          const upload = await supabase.storage.from("product-images").upload(path, file, {
            upsert: false,
          });

          if (upload.error) {
            throw new Error(upload.error.message);
          }

          const publicUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
          uploadedUrls.push(publicUrl);
        }
      }

      const payload: any = {
        name,
        category,
        collection,
        price,
        description,
        isHighJewelry,
        stock: stock === "" ? null : Number(stock),
      };

      if (uploadedUrls.length > 0) {
        payload.image = uploadedUrls[0];
        payload.images = uploadedUrls;
      }

      const res = await fetch("/api/admin/products", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, id: editingId }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || `Failed to save product (${res.status})`);
      }

      cancelEdit();
      await refetch();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await refetch();
    }
  };

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-24">
        <div className="flex items-start justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl mb-2">Admin</h1>
            <p className="text-ash">Create and manage products.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/orders")}
              className="text-xs uppercase tracking-[0.2em] border border-primary/50 bg-primary/20 px-4 py-2 hover:bg-primary/40 hover:text-creme transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-[0.2em] border border-ash/30 px-4 py-2 hover:border-creme/50 hover:text-creme transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-5 bg-primary/20 border border-primary/20 p-8 rounded-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">{editingId ? "Edit Product" : "Add Product"}</h2>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="text-xs uppercase tracking-[0.2em] text-ash hover:text-creme"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={onSave} className="space-y-4">
              <input
                id="product-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  id="product-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
                >
                  {[
                    "Rings",
                    "Necklaces",
                    "Earrings",
                    "Bracelets",
                    "Headwear",
                  ].map((v) => (
                    <option key={v} value={v} className="bg-obsidian">
                      {v}
                    </option>
                  ))}
                </select>

                <select
                  id="product-collection"
                  name="collection"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
                >
                  {["Obsidian", "Ash", "Pearl"].map((v) => (
                    <option key={v} value={v} className="bg-obsidian">
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  id="product-price"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (e.g. $2,400)"
                  className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
                  required
                />
                
                <input
                  type="number"
                  id="product-stock"
                  name="stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Stock count"
                  className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40"
                />
              </div>

              <textarea
                id="product-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm outline-none focus:border-creme/40 min-h-28"
              />

              <label className="block text-xs uppercase tracking-[0.2em] text-ash">
                <span className="block mb-2">Images (select multiple)</span>
                <input
                  type="file"
                  id="product-images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="block w-full text-sm"
                  required={!editingId}
                />
                {editingId && (
                  <span className="text-[10px] lowercase text-ash/60 mt-1 block">
                    Leave empty to keep existing images.
                  </span>
                )}
              </label>

              <label className="flex items-center gap-3 text-sm text-ash">
                <input
                  type="checkbox"
                  id="product-high-jewelry"
                  name="isHighJewelry"
                  checked={isHighJewelry}
                  onChange={(e) => setIsHighJewelry(e.target.checked)}
                />
                High Jewelry
              </label>

              {saveError && <div className="text-sm text-red-300">{saveError}</div>}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-creme text-obsidian tracking-[0.2em] uppercase text-xs font-semibold hover:bg-primary hover:text-creme transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <h2 className="font-serif text-2xl mb-6">Products</h2>

            {loading && <div className="text-ash">Loading...</div>}
            {error && <div className="text-red-300 text-sm">{error}</div>}

            {!loading && products.length === 0 && (
              <div className="text-ash">No products yet.</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="border border-ash/20 bg-primary/10 rounded-sm overflow-hidden"
                >
                  <div className="relative aspect-[4/5] w-full bg-ash/10">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-ash mb-2">
                        {p.collection}
                      </div>
                      <div className="font-serif text-lg">{p.name}</div>
                      <div className="text-sm text-ash mt-1">{p.price}</div>
                      <div className="text-xs text-ash/80 mt-1">Stock: {p.stock ?? "N/A"}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-xs uppercase tracking-[0.2em] border border-ash/30 px-3 py-2 hover:border-creme hover:text-creme transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-xs uppercase tracking-[0.2em] border border-ash/30 px-3 py-2 hover:border-red-300 hover:text-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
