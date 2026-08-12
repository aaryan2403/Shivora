"use client";

import Image from "next/image";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useProducts } from "@/lib/useProducts";
import { useToast } from "@/hooks/useToast";
import type { Product } from "@/context/ShopContext";
import { useShop, ADMIN_EMAIL } from "@/context/ShopContext";
import { useCollections } from "@/hooks/useCollections";
import {
  ShieldAlert,
  Clock,
  Package,
  ShoppingBag,
  LogOut,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Loader2,
  Github,
  Sparkles,
  Eye,
  Palette,
  Tag,
  Layers,
  DollarSign,
  Box,
  FileText,
  Crown,
  Save,
  RefreshCw,
} from "lucide-react";
import ThemePanel from "@/components/admin/ThemePanel";

function getSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

/* ─── Toast Component ─── */
function ToastContainer({ toasts, removeToast }: { toasts: ReturnType<typeof useToast>["toasts"]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto min-w-[320px] max-w-[420px] flex items-start gap-3 px-5 py-4 rounded-sm border shadow-xl backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
                : toast.type === "error"
                ? "bg-red-950/90 border-red-500/30 text-red-100"
                : toast.type === "loading"
                ? "bg-obsidian/90 border-primary/30 text-creme"
                : "bg-obsidian/90 border-primary/30 text-creme"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && <Check size={16} className="text-emerald-400" />}
              {toast.type === "error" && <AlertCircle size={16} className="text-red-400" />}
              {toast.type === "loading" && <Loader2 size={16} className="text-primary animate-spin" />}
              {toast.type === "info" && <Sparkles size={16} className="text-primary" />}
            </div>
            <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ash/60 hover:text-creme transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-obsidian/40 border border-ash/10 p-6 rounded-sm relative overflow-hidden group hover:border-ash/25 transition-colors duration-300"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={14} className="text-ash" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-ash">{label}</span>
        </div>
        <div className="font-serif text-3xl text-creme">{value}</div>
      </div>
    </motion.div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-ash"
    >
      <Package size={40} className="mb-4 opacity-30" />
      <p className="text-sm">{message}</p>
    </motion.div>
  );
}

/* ─── Admin Access Denied ─── */
function AdminAccessDenied() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.replace("/");
    }
  }, [countdown, router]);

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-obsidian/60 border border-red-500/20 backdrop-blur-md p-10 rounded-sm shadow-2xl text-center"
      >
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <h1 className="font-serif text-3xl mb-3">Access Restricted</h1>
        <p className="text-ash text-sm mb-8 leading-relaxed">Only accessible by the admin.</p>
        <div className="flex items-center justify-center gap-2 text-red-300 text-xs uppercase tracking-[0.2em]">
          <Clock size={14} />
          <span>Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}</span>
        </div>
      </motion.div>
    </main>
  );
}

/* ─── Main Page ─── */
export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useShop();
  const { products, loading, error, refetch } = useProducts();
  const { toasts, addToast, removeToast, updateToast } = useToast();
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCollection, setFormCollection] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState<number | "">("");
  const [formColor, setFormColor] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const collectionFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Hero image state
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);

  // Collections (dynamic "Shop by Collection" homepage tiles)
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const [collectionUploadingId, setCollectionUploadingId] = useState<number | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/hero", { cache: "no-store" });
        const data = await res.json();
        setHeroImageUrl(data.heroImageUrl ?? null);
      } catch {
        setHeroImageUrl(null);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = getSupabaseClient();
      if (!supabase) { setIsAdminVerified(false); return; }
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) { setIsAdminVerified(false); return; }
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", sbUser.id).maybeSingle();
      setIsAdminVerified(!!data);
    }
    checkAdmin();
  }, []);

  // These must run unconditionally, before the early returns below — React
  // requires the same hooks in the same order on every render. They used to
  // sit after the isAdminVerified checks, which meant an actual admin (whose
  // first render bails out early on isAdminVerified === null, then re-renders
  // without bailing once verification resolves) called three more hooks than
  // the previous render did. React throws "Rendered more hooks than during
  // the previous render" (minified error #310) the instant that happens —
  // which is exactly why this only ever crashed for a real admin account.
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalStock = useMemo(() => products.reduce((sum, p) => sum + (p.stock || 0), 0), [products]);

  const resetForm = useCallback(() => {
    setFormName("");
    setFormCollection("");
    setFormMaterial("");
    setFormPrice("");
    setFormDescription("");
    setFormStock("");
    setFormColor("");
    setFormImages([]);
    setImageUrlInput("");
    setEditingProduct(null);
  }, []);

  if (isAdminVerified === null) {
    return (
      <main className="min-h-screen bg-obsidian text-creme flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ash" />
      </main>
    );
  }

  if (!isAdminVerified) {
    return <AdminAccessDenied />;
  }

  const validateImageRatio = (file: File): Promise<{ valid: boolean; ratio: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const is16by9 = Math.abs(ratio - 16 / 9) < 0.05;
        resolve({ valid: is16by9, ratio });
      };
      img.onerror = () => resolve({ valid: false, ratio: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const filename = `${folder}-${Date.now()}-${file.name}`;
    const path = `${folder}/${filename}`;
    const { error: uploadError } = await supabase.storage.from("hero-images").upload(path, file, { upsert: true });
    if (uploadError) return null;
    const { data } = supabase.storage.from("hero-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveSetting = async (key: string, value: string): Promise<boolean> => {
    const res = await fetch("/api/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  };

  const deleteSetting = async (key: string): Promise<boolean> => {
    const res = await fetch(`/api/admin/hero?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    return res.ok;
  };

  const handleHeroUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setHeroUploading(true);
    const toastId = addToast("Validating image ratio...", "loading", 0);

    const { valid, ratio } = await validateImageRatio(file);
    if (!valid) {
      updateToast(toastId, `Image ratio must be 16:9 (got ${ratio.toFixed(2)}). Please upload 1920x1080, 4K, or similar.`, "error");
      setHeroUploading(false);
      return;
    }

    updateToast(toastId, "Uploading hero image...", "loading");
    const publicUrl = await uploadToStorage(file, "hero");

    if (!publicUrl) {
      updateToast(toastId, "Failed to upload hero image", "error");
      setHeroUploading(false);
      return;
    }

    const saved = await saveSetting("hero_image_url", publicUrl);
    if (!saved) {
      updateToast(toastId, "Failed to save hero image", "error");
      setHeroUploading(false);
      return;
    }

    setHeroImageUrl(publicUrl);
    updateToast(toastId, "Hero image updated!", "success");
    setHeroUploading(false);
  };

  const handleHeroRemove = async () => {
    const toastId = addToast("Removing hero image...", "loading", 0);
    const ok = await deleteSetting("hero_image_url");
    if (ok) {
      setHeroImageUrl(null);
      updateToast(toastId, "Hero image removed", "success");
    } else {
      updateToast(toastId, "Failed to remove hero image", "error");
    }
  };

  const handleAddCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;

    setCreatingCollection(true);
    const toastId = addToast("Creating collection...", "loading", 0);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create collection");

      updateToast(toastId, `"${name}" added — it'll show up on the homepage now.`, "success");
      setNewCollectionName("");
      setIsAddingCollection(false);
      await refetchCollections();
    } catch (err: unknown) {
      updateToast(toastId, err instanceof Error ? err.message : "Failed to create collection", "error");
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleCollectionImageUpload = async (id: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setCollectionUploadingId(id);
    const toastId = addToast("Uploading collection image...", "loading", 0);

    const publicUrl = await uploadToStorage(file, "collections");
    if (!publicUrl) {
      updateToast(toastId, "Failed to upload image", "error");
      setCollectionUploadingId(null);
      return;
    }

    try {
      const res = await fetch("/api/admin/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, imageUrl: publicUrl }),
      });
      if (!res.ok) throw new Error("Failed to save image");
      updateToast(toastId, "Collection image updated!", "success");
      await refetchCollections();
    } catch {
      updateToast(toastId, "Failed to save collection image", "error");
    } finally {
      setCollectionUploadingId(null);
    }
  };

  const handleCollectionRemove = async (id: number, name: string) => {
    if (!confirm(`Remove the "${name}" collection? This also removes its section from the homepage.`)) return;
    const toastId = addToast("Removing collection...", "loading", 0);
    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove collection");
      updateToast(toastId, "Collection removed", "success");
      await refetchCollections();
    } catch {
      updateToast(toastId, "Failed to remove collection", "error");
    }
  };

  const categories = ["All", "Necklaces", "Earrings", "Bracelets"];

  const openNewProduct = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCollection(product.collection || "");
    setFormMaterial(product.material || "");
    setFormPrice(product.price);
    setFormDescription(product.description || "");
    setFormStock(product.stock ?? "");
    setFormColor(product.color || "");
    setFormImages(product.images || [product.image]);
    setImageUrlInput("");
    setIsEditorOpen(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const toastId = addToast("Uploading images...", "loading", 0);

    const uploadedUrls: string[] = [];
    const supabase = getSupabaseClient();
    if (!supabase) {
      updateToast(toastId, "Supabase is not configured — cannot upload images", "error");
      return;
    }
    for (const file of Array.from(files)) {
      const filename = `${Date.now()}-${file.name}`;
      const path = `products/${filename}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormImages((prev) => [...prev, ...uploadedUrls]);
      updateToast(toastId, `${uploadedUrls.length} image(s) uploaded`, "success");
    } else {
      updateToast(toastId, "Failed to upload images", "error");
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formImages.length) return;
    setFormImages((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!formName || !formPrice) {
      addToast("Name and price are required", "error");
      return;
    }
    if (formImages.length === 0) {
      addToast("At least one image is required", "error");
      return;
    }

    setIsSaving(true);
    const toastId = addToast(editingProduct ? "Updating product..." : "Creating product...", "loading", 0);

    try {
     const payload = {
  id: editingProduct?.id,
  name: formName,
  category: editingProduct?.category || "Jewelry",
  collection: formCollection || null,
  material: formMaterial || null,
  price: formPrice,
        description: formDescription,
        stock: formStock === "" ? null : Number(formStock),
        color: formColor || null,
        image: formImages[0],
        images: formImages,
      };

      const res = await fetch("/api/admin/products", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to save product (${res.status})`);
      }

      updateToast(toastId, editingProduct ? "Product updated successfully" : "Product created successfully", "success");
      setIsEditorOpen(false);
      resetForm();
      await refetch();
    } catch (err: unknown) {
      updateToast(toastId, err instanceof Error ? err.message : "Failed to save product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(id);
    const toastId = addToast("Deleting product...", "loading", 0);

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      updateToast(toastId, "Product deleted successfully", "success");
      await refetch();
    } catch (err: unknown) {
      updateToast(toastId, err instanceof Error ? err.message : "Failed to delete product", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePushToGitHub = async () => {
    setIsPushing(true);
    const toastId = addToast("Syncing changes to GitHub...", "loading", 0);

    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Update products from admin - ${new Date().toLocaleString()}` }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Push failed");
      }

      if (data.pushed) {
        updateToast(toastId, "Changes synced and pushed to GitHub!", "success");
      } else {
        updateToast(toastId, data.message || "No changes to push", "info");
      }
    } catch (err: unknown) {
      updateToast(toastId, err instanceof Error ? err.message : "Failed to push to GitHub", "error");
    } finally {
      setIsPushing(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    const supabase = getSupabaseClient();
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    logout();
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pt-4 pb-8">
        {/* ─── Admin Toolbar ─── */}
        <div className="flex items-center justify-between h-16 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Crown size={14} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-wide">Shivora Admin</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePushToGitHub}
              disabled={isPushing}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-creme text-obsidian text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {isPushing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Github size={12} />
              )}
              Apply & Push
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/orders")}
              className="flex items-center gap-2 px-4 py-2 border border-ash/20 text-[10px] uppercase tracking-[0.2em] text-ash hover:text-creme hover:border-ash/40 transition-colors"
            >
              <ShoppingBag size={12} />
              Orders
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-ash/20 text-[10px] uppercase tracking-[0.2em] text-ash hover:text-red-300 hover:border-red-300/30 transition-colors"
            >
              <LogOut size={12} />
              Exit
            </motion.button>
          </div>
        </div>
        {/* ─── Theme Panel ─── */}
        <ThemePanel />

        {/* ─── Hero Image ─── */}
        <section className="mb-10 border border-ash/10 bg-ash/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={13} className="text-primary" />
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Homepage Hero</h3>
          </div>
          <p className="text-ash text-xs mb-4">
            Upload a 16:9 image (e.g., 1920×1080, 3840×2160) to replace the default hero background color.
          </p>

          {heroImageUrl ? (
            <div className="space-y-4">
              <div className="relative w-full h-40 bg-obsidian/40 border border-ash/10 overflow-hidden rounded-sm">
                <Image src={heroImageUrl} alt="Hero preview" fill className="object-cover" />
              </div>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={heroFileInputRef}
                  onChange={(e) => handleHeroUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => heroFileInputRef.current?.click()}
                  disabled={heroUploading}
                  className="flex items-center gap-2 px-4 py-2 border border-ash/20 text-[10px] uppercase tracking-[0.2em] text-ash hover:text-creme hover:border-ash/40 transition-colors disabled:opacity-50"
                >
                  {heroUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  Change Image
                </button>
                <button
                  onClick={handleHeroRemove}
                  disabled={heroUploading}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-[10px] uppercase tracking-[0.2em] text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="w-full h-40 bg-obsidian/40 border border-dashed border-ash/20 flex items-center justify-center text-ash text-xs">
                No hero image set — default color will be used
              </div>
              <input
                type="file"
                accept="image/*"
                ref={heroFileInputRef}
                onChange={(e) => handleHeroUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => heroFileInputRef.current?.click()}
                disabled={heroUploading}
                className="self-start flex items-center gap-2 px-4 py-2 bg-creme text-obsidian text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors disabled:opacity-50"
              >
                {heroUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                Upload Hero Image
              </button>
            </div>
          )}
        </section>

        {/* ─── Collections ─── */}
        <section className="mb-10 border border-ash/10 bg-ash/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-primary" />
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Collections</h3>
            </div>
            <button
              onClick={() => setIsAddingCollection((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-ash/20 text-[10px] uppercase tracking-[0.15em] text-ash hover:text-creme hover:border-ash/40 transition-colors"
            >
              <Plus size={11} /> Add Collection
            </button>
          </div>
          <p className="text-ash text-xs mb-4">
            Each collection here gets its own tile in the &quot;Shop by Collection&quot; section on the homepage, with its own image.
          </p>

          {isAddingCollection && (
            <div className="flex gap-2 mb-4 p-3 border border-ash/10 bg-obsidian/20">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
                placeholder="Collection name, e.g. Anklets"
                autoFocus
                className="flex-1 bg-obsidian/40 border border-ash/20 px-3 py-2 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
              />
              <button
                onClick={handleAddCollection}
                disabled={creatingCollection || !newCollectionName.trim()}
                className="px-4 py-2 bg-creme text-obsidian text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creatingCollection ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Create
              </button>
              <button
                onClick={() => { setIsAddingCollection(false); setNewCollectionName(""); }}
                className="px-3 py-2 border border-ash/20 text-ash hover:text-creme transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {collectionsLoading ? (
            <div className="flex items-center gap-2 text-ash text-xs py-6">
              <Loader2 size={14} className="animate-spin" /> Loading collections...
            </div>
          ) : collections.length === 0 ? (
            <div className="text-ash text-xs py-6 text-center border border-dashed border-ash/20">
              No collections yet — add one above to create its homepage section.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collections.map((col) => {
                const isUploading = collectionUploadingId === col.id;
                return (
                  <div key={col.id} className="border border-ash/10 bg-obsidian/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-creme">{col.name}</h4>
                      <button
                        onClick={() => handleCollectionRemove(col.id, col.name)}
                        className="text-ash/60 hover:text-red-400 transition-colors"
                        aria-label={`Remove ${col.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {col.image_url ? (
                      <div className="relative w-full h-28 bg-obsidian/40 border border-ash/10 overflow-hidden rounded-sm mb-3">
                        <Image src={col.image_url} alt={`${col.name} preview`} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-obsidian/40 border border-dashed border-ash/20 flex items-center justify-center text-ash text-[10px] mb-3">
                        No image set
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => { collectionFileRefs.current[col.id] = el; }}
                      onChange={(e) => handleCollectionImageUpload(col.id, e.target.files)}
                      className="hidden"
                    />
                    <button
                      onClick={() => collectionFileRefs.current[col.id]?.click()}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-ash/20 text-[10px] uppercase tracking-[0.15em] text-ash hover:text-creme hover:border-ash/40 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                      {col.image_url ? "Change Image" : "Upload Image"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Package} label="Total Products" value={products.length} color="bg-primary" />
          <StatCard icon={Box} label="Total Stock" value={totalStock} color="bg-blue-500" />
          <StatCard icon={Layers} label="Collections" value={collections.length} color="bg-emerald-500" />
        </div>

        {/* ─── Toolbar ─── */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-obsidian/40 border border-ash/20 pl-10 pr-4 py-2.5 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/40"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-obsidian/40 border border-ash/20 px-4 py-2.5 text-sm text-creme outline-none focus:border-primary/50 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-obsidian">{c}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openNewProduct}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-creme text-obsidian text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors"
          >
            <Plus size={14} />
            New Product
          </motion.button>
        </div>

        {/* ─── Mobile Push Button ─── */}
        <div className="sm:hidden mb-6">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handlePushToGitHub}
            disabled={isPushing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-creme text-obsidian text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors disabled:opacity-50"
          >
            {isPushing ? <Loader2 size={12} className="animate-spin" /> : <Github size={12} />}
            Apply & Push to GitHub
          </motion.button>
        </div>

        {/* ─── Products Grid ─── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-ash">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="text-xs uppercase tracking-[0.2em] text-ash hover:text-creme transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group bg-obsidian/30 border border-ash/10 hover:border-primary/30 rounded-sm overflow-hidden transition-colors duration-300"
                >
                  <div className="relative aspect-[4/5] bg-ash/5 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {product.color && (
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white/20 shadow-sm"
                        style={{ backgroundColor: product.color }}
                        title={`Color: ${product.color}`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => openEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-creme/90 text-obsidian text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-creme transition-colors backdrop-blur-sm"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                        className="flex items-center justify-center px-3 py-2 bg-red-500/80 text-white hover:bg-red-500 transition-colors backdrop-blur-sm disabled:opacity-50"
                      >
                        {isDeleting === product.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-serif text-base leading-tight">{product.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-ash">{product.price}</span>
                      <span className="text-[10px] uppercase tracking-wider text-ash/70">
                        Stock: <span className={product.stock && product.stock > 0 ? "text-emerald-400" : "text-red-400"}>{product.stock ?? 0}</span>
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-ash/10 text-ash/80">{product.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredProducts.length === 0 && <EmptyState message="No products found matching your criteria." />}
          </div>
        )}
      </div>

      {/* ─── Editor Drawer ─── */}
      <AnimatePresence>
        {isEditorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-obsidian border-l border-ash/20 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-obsidian/95 backdrop-blur-md border-b border-ash/10 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-serif text-xl">
                    {editingProduct ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ash mt-0.5">
                    {editingProduct ? `ID: ${editingProduct.id}` : "Create a new product listing"}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="w-8 h-8 flex items-center justify-center border border-ash/20 hover:border-creme/40 hover:text-creme transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={13} className="text-primary" />
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Basic Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-1.5 block">Product Name *</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g., Obsidian Core Ring"
                        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
                      />
                    </div>
                   <div>
  <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-1.5 block">
    Collection
  </label>

  <select
    value={formCollection}
    onChange={(e) => setFormCollection(e.target.value)}
    className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors"
  >
    <option value="" className="bg-obsidian">
      No Collection
    </option>

    {collections.map((collection) => (
      <option
        key={collection.id}
        value={collection.name}
        className="bg-obsidian"
      >
        {collection.name}
      </option>
    ))}
  </select>
</div>
                    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-1.5 block">
        Material
      </label>

      <input
        type="text"
        value={formMaterial}
        onChange={(e) => setFormMaterial(e.target.value)}
        placeholder="e.g., 18K Gold, Sterling Silver, Stainless Steel"
        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
      />
    </div>
  </div>
</section>
                

                {/* Pricing & Stock */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign size={13} className="text-primary" />
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Pricing & Stock</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-1.5 block">Price *</label>
                      <input
                        type="text"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="e.g., $2,400"
                        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-ash mb-1.5 block">Stock Quantity</label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value ? Number(e.target.value) : "")}
                        placeholder="0"
                        min={0}
                        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
                      />
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={13} className="text-primary" />
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Description</h3>
                  </div>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                    className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30 resize-none"
                  />
                </section>

                {/* Color */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={13} className="text-primary" />
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Product Color</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formColor || "#e3b388"}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-12 h-12 rounded-sm border border-ash/20 cursor-pointer bg-transparent"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        placeholder="#e3b388"
                        className="w-full bg-obsidian/40 border border-ash/20 px-4 py-3 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30 font-mono"
                      />
                      <p className="text-[10px] text-ash/60 mt-1">Hex color code for product display</p>
                    </div>
                  </div>
                </section>

                {/* Images */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Eye size={13} className="text-primary" />
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary">Images</h3>
                  </div>

                  {/* Image Grid */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                      {formImages.map((img, idx) => (
                        <motion.div
                          key={`${img}-${idx}`}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square bg-ash/5 border border-ash/10 group overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              onClick={() => moveImage(idx, -1)}
                              disabled={idx === 0}
                              className="w-7 h-7 flex items-center justify-center bg-creme/90 text-obsidian hover:bg-creme transition-colors disabled:opacity-30"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              onClick={() => moveImage(idx, 1)}
                              disabled={idx === formImages.length - 1}
                              className="w-7 h-7 flex items-center justify-center bg-creme/90 text-obsidian hover:bg-creme transition-colors disabled:opacity-30"
                            >
                              <ChevronDown size={12} />
                            </button>
                            <button
                              onClick={() => removeImage(idx)}
                              className="w-7 h-7 flex items-center justify-center bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          {idx === 0 && (
                            <div className="absolute bottom-1 left-1 bg-primary text-obsidian text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5">
                              Main
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add Images */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 border border-ash/20 text-[10px] uppercase tracking-[0.15em] text-ash hover:text-creme hover:border-creme/40 transition-colors"
                      >
                        <Upload size={12} /> Upload Files
                      </button>
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash/40" />
                          <input
                            type="text"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
                            placeholder="Paste image URL..."
                            className="w-full bg-obsidian/40 border border-ash/20 pl-9 pr-4 py-2.5 text-sm text-creme outline-none focus:border-primary/50 transition-colors placeholder:text-ash/30"
                          />
                        </div>
                        <button
                          onClick={addImageUrl}
                          disabled={!imageUrlInput.trim()}
                          className="px-4 py-2.5 bg-ash/20 text-[10px] uppercase tracking-[0.15em] text-ash hover:text-creme hover:bg-ash/30 transition-colors disabled:opacity-30"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="sticky bottom-0 bg-obsidian border-t border-ash/10 -mx-6 px-6 py-4 flex gap-3">
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-3 border border-ash/20 text-[10px] uppercase tracking-[0.2em] text-ash hover:text-creme hover:border-ash/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-[2] py-3 bg-creme text-obsidian text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
