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
  addBrand: (data: { name: string; industry?: string; website?: string; color?: string; avatarUrl?: string }) => Promise<Brand> | Brand;
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
      // 1. Fetch user brands from /api/brand/all
      const resAll = await fetch("/api/brand/all", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (resAll.ok) {
        const dataAll = await resAll.json();
        if (Array.isArray(dataAll.brands) && dataAll.brands.length > 0) {
          const loadedBrands: Brand[] = dataAll.brands.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            handle: b.handle || `@${b.slug}`,
            avatarUrl: b.avatarUrl || b.logoUrl || "",
            coverUrl: b.coverUrl || "",
            connectedAccountsCount: b.connectedAccountsCount || 0,
            industry: b.description || "Digital Media & Tech",
            description: b.description || "",
            timezone: b.timezone || "Asia/Kolkata",
            color: "#2563eb",
            createdAt: b.createdAt || new Date().toISOString(),
          }));

          setBrands(loadedBrands);

          const savedId = typeof window !== "undefined" ? localStorage.getItem("pulsesocial_active_brand") : null;
          const targetId = (savedId && loadedBrands.some((x) => x.id === savedId))
            ? savedId
            : dataAll.activeBrandId || loadedBrands[0].id;

          setActiveBrandId(targetId);
          try {
            localStorage.setItem("pulsesocial_active_brand", targetId);
          } catch {}
          return;
        }
      }

      // 2. Fallback to /api/auth/me
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.activeOrganization) {
          const org = data.user.activeOrganization;

          const orgBrand: Brand = {
            id: org.id,
            name: org.name,
            slug: org.slug,
            handle: `@${org.slug}`,
            avatarUrl: org.logoUrl || data.user.avatarUrl || "",
            coverUrl: org.coverUrl || "",
            connectedAccountsCount: org._count?.socialAccounts || 0,
            industry: "Enterprise Media",
            description: "",
            timezone: org.timezone || "Asia/Kolkata",
            color: "#2563eb",
            createdAt: org.createdAt || new Date().toISOString(),
          };

          setBrands((prev) => {
            const filtered = prev.filter((b) => b.id !== org.id);
            return [orgBrand, ...filtered];
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

  const switchBrand = async (id: string) => {
    setActiveBrandId(id);
    try {
      localStorage.setItem("pulsesocial_active_brand", id);
      await fetch("/api/brand/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: id }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulsesocial_active_brand_changed", { detail: { id } }));
      }
      await syncActiveBrandFromBackend();
    } catch {}
  };

  const addBrand = async (data: { name: string; industry?: string; website?: string; color?: string; avatarUrl?: string }) => {
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          industry: data.industry,
          website: data.website,
          color: data.color,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.brand) {
          const created: Brand = {
            id: json.brand.id,
            name: json.brand.name,
            slug: json.brand.slug,
            handle: `@${json.brand.slug}`,
            avatarUrl: json.brand.avatarUrl || data.avatarUrl || "",
            connectedAccountsCount: 0,
            industry: data.industry || "Digital Media",
            color: data.color || "#2563eb",
            createdAt: json.brand.createdAt || new Date().toISOString(),
          };

          setBrands((prev) => [...prev, created]);
          setActiveBrandId(created.id);
          try {
            localStorage.setItem("pulsesocial_active_brand", created.id);
          } catch {}
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("pulsesocial_active_brand_changed", { detail: { id: created.id } }));
          }
          return created;
        }
      }
    } catch {}

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const fallbackBrand: Brand = {
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

    setBrands((prev) => [...prev, fallbackBrand]);
    setActiveBrandId(fallbackBrand.id);
    return fallbackBrand;
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
