"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  handle: string;
  avatarUrl: string;
  connectedAccountsCount: number;
  industry: string;
  color?: string;
  description?: string;
  timezone?: string;
  coverUrl?: string;
  createdAt: string;
}

const DEFAULT_BRANDS: Brand[] = [
  {
    id: "brand-primary",
    name: "Pulse Media Global",
    slug: "pulse-media-global",
    handle: "@pulsemedia",
    avatarUrl: "",
    connectedAccountsCount: 0,
    industry: "Digital Media & Technology",
    color: "#2563eb",
    createdAt: "2026-01-15T10:00:00Z",
  },
];

interface BrandContextType {
  brands: Brand[];
  activeBrand: Brand;
  switchBrand: (id: string) => void;
  addBrand: (data: { name: string; industry?: string; website?: string; color?: string; avatarUrl?: string }) => Brand;
  updateBrand: (id: string, data: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [activeBrandId, setActiveBrandId] = useState<string>("brand-primary");

  const syncActiveBrandFromBackend = async () => {
    try {
      // 1. Clean legacy demo data from localStorage if present
      try {
        const savedBrands = localStorage.getItem("pulsesocial_brands");
        if (savedBrands) {
          const parsed = JSON.parse(savedBrands);
          if (parsed.length > 0) {
            setBrands(parsed);
          }
        }
      } catch {}

      // 2. Fetch authenticated session
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.activeOrganization) {
          const org = data.user.activeOrganization;

          // Fetch full brand metadata
          let brandMeta: any = {};
          try {
            const bRes = await fetch("/api/brand");
            if (bRes.ok) {
              const bData = await bRes.json();
              if (bData.brand) brandMeta = bData.brand;
            }
          } catch {}

          const orgBrand: Brand = {
            id: org.id,
            name: brandMeta.name || org.name,
            slug: brandMeta.slug || org.slug,
            handle: `@${brandMeta.slug || org.slug}`,
            avatarUrl: brandMeta.avatarUrl || org.logoUrl || data.user.avatarUrl || "",
            coverUrl: brandMeta.coverUrl || org.coverUrl || "",
            connectedAccountsCount: brandMeta.channelsCount || 0,
            industry: brandMeta.description ? "Enterprise SaaS" : "General Business",
            description: brandMeta.description || "",
            timezone: brandMeta.timezone || org.timezone || "Asia/Kolkata",
            color: "#2563eb",
            createdAt: org.createdAt || new Date().toISOString(),
          };

          setBrands((prev) => {
            const filtered = prev.filter((b) => b.id !== org.id);
            const updated = [orgBrand, ...filtered];
            try {
              localStorage.setItem("pulsesocial_brands", JSON.stringify(updated));
              localStorage.setItem("pulsesocial_active_brand", org.id);
            } catch {}
            return updated;
          });
          setActiveBrandId(org.id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    syncActiveBrandFromBackend();

    const handleExternalUpdate = (e: any) => {
      if (e.detail) {
        setBrands((prev) =>
          prev.map((b) => (b.id === activeBrandId ? { ...b, ...e.detail } : b))
        );
      }
    };

    window.addEventListener("pulsesocial_brand_updated", handleExternalUpdate);
    return () => window.removeEventListener("pulsesocial_brand_updated", handleExternalUpdate);
  }, [activeBrandId]);

  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0] || DEFAULT_BRANDS[0];

  const switchBrand = (id: string) => {
    setActiveBrandId(id);
    try {
      localStorage.setItem("pulsesocial_active_brand", id);
    } catch {}
  };

  const addBrand = (data: { name: string; industry?: string; website?: string; color?: string; avatarUrl?: string }) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: data.name,
      slug,
      handle: `@${slug}`,
      avatarUrl: data.avatarUrl || "",
      connectedAccountsCount: 0,
      industry: data.industry || "General Business",
      color: data.color || "#0284c7",
      createdAt: new Date().toISOString(),
    };

    const updated = [...brands, newBrand];
    setBrands(updated);
    setActiveBrandId(newBrand.id);

    try {
      localStorage.setItem("pulsesocial_brands", JSON.stringify(updated));
      localStorage.setItem("pulsesocial_active_brand", newBrand.id);
    } catch {}

    return newBrand;
  };

  const updateBrand = (id: string, data: Partial<Brand>) => {
    setBrands((prev) => {
      const updated = prev.map((b) => (b.id === id || b.id === activeBrandId ? { ...b, ...data } : b));
      try {
        localStorage.setItem("pulsesocial_brands", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pulsesocial_brand_updated", { detail: data }));
    }
  };

  const deleteBrand = (id: string) => {
    if (brands.length <= 1) return;
    const updated = brands.filter((b) => b.id !== id);
    setBrands(updated);
    setActiveBrandId(updated[0].id);
    try {
      localStorage.setItem("pulsesocial_brands", JSON.stringify(updated));
      localStorage.setItem("pulsesocial_active_brand", updated[0].id);
    } catch {}
  };

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        switchBrand,
        addBrand,
        updateBrand,
        deleteBrand,
        refreshBrands: syncActiveBrandFromBackend,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
