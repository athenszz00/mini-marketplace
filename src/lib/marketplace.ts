import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const categories = [
  "All",
  "Furniture",
  "Electronics",
  "Home & Garden",
  "Clothing",
  "Sports",
  "Other",
] as const;

export type Category = (typeof categories)[number];

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  seller_email: string;
  category: Exclude<Category, "All">;
  image_url: string;
  created_at: string;
};

let supabase: SupabaseClient | null = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("your-project")) return null;
  if (!supabase) supabase = createClient(url, key);
  return supabase;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export const demoListings: Listing[] = [
  {
    id: "sample-chair",
    title: "A very good chair",
    description:
      "A little mid-century moment for your reading corner. Solid wood legs, super comfy seat, and ready for a new home.",
    price: 85,
    seller_email: "hello@example.com",
    category: "Furniture",
    image_url:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=960&q=85",
    created_at: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "sample-camera",
    title: "Film camera, big feelings",
    description:
      "A dependable 35mm film camera for your next little adventure. Tested, working, and includes a strap.",
    price: 120,
    seller_email: "hello@example.com",
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=960&q=85",
    created_at: "2026-03-09T12:00:00.000Z",
  },
  {
    id: "sample-vase",
    title: "Handmade Sunday vase",
    description:
      "A one-of-a-kind ceramic vase in a soft, earthy glaze. Looks just as lovely with fresh blooms or all on its own.",
    price: 32,
    seller_email: "hello@example.com",
    category: "Home & Garden",
    image_url:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=960&q=85",
    created_at: "2026-03-08T12:00:00.000Z",
  },
  {
    id: "sample-bag",
    title: "The everyday tote",
    description:
      "Room for your book, snacks, and all the other little things. Gently loved, lots of life left.",
    price: 24,
    seller_email: "hello@example.com",
    category: "Clothing",
    image_url:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=960&q=85",
    created_at: "2026-03-07T12:00:00.000Z",
  },
];
