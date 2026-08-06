export type UserRole = "owner" | "admin" | "editor" | "analyst";
export type ProductStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  public_code: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_text: string | null;
  external_url: string;
  affiliate_network: string | null;
  category_id: string | null;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  cover_url: string | null;
  video_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  brand_name: string;
  tagline: string;
  description: string;
  logo_url: string | null;
  social_links: Record<string, string>;
  homepage: Record<string, unknown>;
  theme: Record<string, string>;
  indexing_enabled: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  target_url: string | null;
  active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportJob {
  id: string;
  source: string;
  status: "pending" | "running" | "completed" | "failed";
  item_count: number;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface StudioUser {
  user_id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
}
