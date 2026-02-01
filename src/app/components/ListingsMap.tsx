import React, { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { supabase } from "../../../supabaseClient";

type ListingRow = {
  id: string;
  title: string;
  price: number | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;

  latitude: number | null;
  longitude: number | null;

  cover_photo_url: string | null;
  housing_category: "student" | "affordable" | "accessible" | "shelter" | null;
};

function formatAddress(l: ListingRow) {
  const parts = [
    l.address_line1,
    l.address_line2,
    `${l.city ?? ""}, ${l.state ?? ""} ${l.postal_code ?? ""}`.trim(),
    l.country ?? "US",
  ].filter(Boolean);
  return parts.join(", ");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ListingsMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [selected, setSelected] = useState<ListingRow | null>(null);

  // Default center: Albany (Capital Region)
  const defaultCenter = useMemo(() => ({ lat: 42.6526, lng: -73.7562 }), []);

  // Fetch listings from DB
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings_feed")
        .select(
          "id,title,price,address_line1,address_line2,city,state,postal_code,country,latitude,longitude,cover_photo_url,housing_category"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch listings_feed error:", error);
      } else {
        setRows((data ?? []) as ListingRow[]);
      }

      setLoading(false);
    };

    fetchListings();
  }, []);

  // Only pin listings that have coordinates
  const withCoords = rows.filter((r) => r.latitude != null && r.longitude != null);

  // Center map on first coordinate if available, else default
  const center = withCoords.length
    ? { lat: withCoords[0].latitude as number, lng: withCoords[0].longitude as number }
    : defaultCenter;

  // Geocode + store missing coordinates
  const geocodeMissingPins = async () => {
    if (!window.google?.maps) {
      console.error("Google Maps JS API not loaded yet.");
      return;
    }

    const missing = rows.filter((r) => r.latitude == null || r.longitude == null);
    if (missing.length === 0) return;

    setGeocoding(true);

    const geocoder = new google.maps.Geocoder();

    for (const l of missing) {
      const address = formatAddress(l);
      if (!address) continue;

      const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
  console.log("GEOCODE STATUS:", status, "| ADDRESS:", address, "| RESULTS:", results?.length);

  if (status === "OK" && results && results[0]) resolve(results[0]);
  else resolve(null);
});

      });

      if (!result) {
        await sleep(200);
        continue;
      }

      const loc = result.geometry.location;
      const lat = loc.lat();
      const lng = loc.lng();

      // Save to Supabase base table
      const { error: updErr } = await supabase
        .from("listings")
        .update({ latitude: lat, longitude: lng })
        .eq("id", l.id);

      if (updErr) console.error("Update coords failed:", l.id, updErr);

      // Update local state immediately so pins appear without refresh
      setRows((prev) =>
        prev.map((x) => (x.id === l.id ? { ...x, latitude: lat, longitude: lng } : x))
      );

      // rate-limit so you don’t spam geocoding
      await sleep(200);
    }

    setGeocoding(false);
  };

  if (!apiKey) {
    return <div className="p-6 text-white">Missing VITE_GOOGLE_MAPS_API_KEY</div>;
  }

  if (loading) return <div className="p-6 text-white">Loading…</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-xl font-bold">Listings Map</h2>

        <button
          onClick={geocodeMissingPins}
          disabled={geocoding}
          className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 disabled:opacity-50"
        >
          {geocoding ? "Geocoding..." : "Add Pins (Geocode)"}
        </button>
      </div>

      <div className="w-full h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <APIProvider apiKey={apiKey}>
          <Map defaultCenter={center} defaultZoom={12}>
            {withCoords.map((l) => (
              <Marker
                key={l.id}
                position={{ lat: l.latitude as number, lng: l.longitude as number }}
                title={l.title}
                onClick={() => setSelected(l)}
              />
            ))}

            {selected && selected.latitude != null && selected.longitude != null && (
              <InfoWindow
                position={{ lat: selected.latitude, lng: selected.longitude }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ maxWidth: 240 }}>
                  <div style={{ fontWeight: 800 }}>{selected.title}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {selected.city}, {selected.state}
                  </div>
                  {selected.price != null && (
                    <div style={{ fontWeight: 800, marginTop: 6 }}>
                      ${selected.price}/mo
                    </div>
                  )}
                  {selected.housing_category && (
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                      Category: <b>{selected.housing_category}</b>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      <p className="text-white/80 text-sm mt-3">
        Click <b>Add Pins (Geocode)</b> once. It converts addresses → coordinates and stores them in Supabase.
      </p>
    </div>
  );
};
