import { supabase } from "../../supabaseClient";

export type ListingFeedRow = {
  id: string;
  title: string;
  description: string | null;

  housing_category?: "student" | "affordable" | "accessible" | "shelter" | null;


  address_line1: string | null;
  city: string;
  state: string;
  postal_code: string | null;

  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;

  available_from: string | null;
  lease_length_months: number | null;
  pets_allowed: boolean;

  parking_available: boolean;
  parking_type: string | null;
  accessible: boolean;

  wifi: boolean;
  ac: boolean;
  furnished: boolean;
  gym_access: boolean;
  laundry_type: "none" | "shared" | "in_unit";

  electricity: boolean;
  gas: boolean;
  water: boolean;
  trash: boolean;

  cover_photo_url: string | null;

  photo_urls: string[];
  owner: null | {
    display_name: string;
    avatar_url: string | null;
  };
  
};

export async function fetchListingsFeed(limit = 50): Promise<ListingFeedRow[]> {
  const { data, error } = await supabase
    .from("listings_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    ...row,
    photo_urls: Array.isArray(row.photo_urls) ? row.photo_urls : [],
  }));
}
