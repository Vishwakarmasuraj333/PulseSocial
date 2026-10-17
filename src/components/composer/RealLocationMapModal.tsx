"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  Navigation,
  Check,
  Globe,
  Compass,
  Building2,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Maximize2,
} from "lucide-react";

export interface LocationData {
  name: string;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
  placeType?: string;
}

interface RealLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string | null;
  onSelectLocation: (loc: LocationData | null) => void;
}

// Popular Global Verified Locations
const POPULAR_LOCATIONS: LocationData[] = [
  {
    name: "Mumbai",
    formattedAddress: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    lat: 19.076,
    lon: 72.8777,
    placeType: "Metro Hub",
  },
  {
    name: "New Delhi",
    formattedAddress: "New Delhi, Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    lat: 28.6139,
    lon: 77.209,
    placeType: "Capital City",
  },
  {
    name: "Bengaluru",
    formattedAddress: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    lat: 12.9716,
    lon: 77.5946,
    placeType: "Tech Capital",
  },
  {
    name: "Hyderabad",
    formattedAddress: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    lat: 17.385,
    lon: 78.4867,
    placeType: "Cyberabad Hub",
  },
  {
    name: "Dubai",
    formattedAddress: "Downtown Dubai, Dubai, United Arab Emirates",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.1972,
    lon: 55.2744,
    placeType: "Global Center",
  },
  {
    name: "London",
    formattedAddress: "City of London, Greater London, United Kingdom",
    city: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
    placeType: "Global Financial City",
  },
  {
    name: "New York City",
    formattedAddress: "Manhattan, New York, NY, United States",
    city: "New York",
    state: "NY",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
    placeType: "Media & Tech Capital",
  },
  {
    name: "San Francisco",
    formattedAddress: "Silicon Valley, San Francisco, CA, United States",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    lat: 37.7749,
    lon: -122.4194,
    placeType: "Innovation Valley",
  },
  {
    name: "Singapore",
    formattedAddress: "Marina Bay, Central Region, Singapore",
    city: "Singapore",
    country: "Singapore",
    lat: 1.2847,
    lon: 103.861,
    placeType: "Asian Hub",
  },
  {
    name: "Tokyo",
    formattedAddress: "Shibuya, Tokyo, Japan",
    city: "Tokyo",
    country: "Japan",
    lat: 35.658,
    lon: 139.7016,
    placeType: "Metropolis",
  },
];

export function RealLocationMapModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: RealLocationMapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.015);

  // Active selected location state (defaults to first popular or current)
  const [activeLocation, setActiveLocation] = useState<LocationData>(() => {
    if (currentLocation) {
      const match = POPULAR_LOCATIONS.find(
        (l) => l.name.toLowerCase() === currentLocation.toLowerCase() || l.formattedAddress.toLowerCase().includes(currentLocation.toLowerCase())
      );
      if (match) return match;
      return {
        name: currentLocation,
        formattedAddress: currentLocation,
        lat: 19.076,
        lon: 72.8777,
        placeType: "Custom Location",
      };
    }
    return POPULAR_LOCATIONS[0];
  });

  const [customTag, setCustomTag] = useState(activeLocation.name);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentLocation) {
      const match = POPULAR_LOCATIONS.find(
        (l) => l.name.toLowerCase() === currentLocation.toLowerCase() || l.formattedAddress.toLowerCase().includes(currentLocation.toLowerCase())
      );
      if (match) {
        setActiveLocation(match);
        setCustomTag(match.name);
      } else {
        setActiveLocation({
          name: currentLocation,
          formattedAddress: currentLocation,
          lat: 19.076,
          lon: 72.8777,
          placeType: "Tagged Location",
        });
        setCustomTag(currentLocation);
      }
    }
  }, [currentLocation]);

  // Real geocoding search via OpenStreetMap Nominatim API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=6`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const parsedResults: LocationData[] = (data || []).map((item: any) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
            const state = addr.state || "";
            const country = addr.country || "";
            const primaryName = item.name || city || item.display_name.split(",")[0];

            return {
              name: primaryName,
              formattedAddress: item.display_name,
              city,
              state,
              country,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              placeType: item.type ? item.type.replace(/_/g, " ") : "Location",
            };
          });
          setSearchResults(parsedResults);
        }
      } catch (err) {
        console.error("Geocoding search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // GPS Device Detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || "";
            const country = addr.country || "";
            const name = addr.suburb || addr.neighbourhood || city || "Current Location";

            const detected: LocationData = {
              name,
              formattedAddress: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              city,
              state: addr.state || "",
              country,
              lat,
              lon,
              placeType: "Current GPS Location",
            };

            setActiveLocation(detected);
            setCustomTag(detected.name);
          }
        } catch {
          setActiveLocation({
            name: "GPS Location",
            formattedAddress: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
            lat,
            lon,
            placeType: "GPS Coordinates",
          });
          setCustomTag("GPS Location");
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        alert(`Location permission denied or unavailable (${err.message}).`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelect = (loc: LocationData) => {
    setActiveLocation(loc);
    setCustomTag(loc.name);
  };

  const handleConfirm = () => {
    onSelectLocation({
      ...activeLocation,
      name: customTag.trim() || activeLocation.name,
    });
    onClose();
  };

  const handleClear = () => {
    onSelectLocation(null);
    onClose();
  };

  if (!isOpen) return null;

  // Bounding box for OpenStreetMap embed
  const bbox = `${activeLocation.lon - zoomLevel * 1.5}%2C${activeLocation.lat - zoomLevel}%2C${
    activeLocation.lon + zoomLevel * 1.5
  }%2C${activeLocation.lat + zoomLevel}`;
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${activeLocation.lat}%2C${activeLocation.lon}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Add Real Location &amp; Geotag</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 font-semibold">
                  Live OpenStreetMap
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pinpoint real places, cities, and businesses to geotag your post across platforms.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Two Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left Column: Search & Place Selector (5 cols) */}
          <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 flex flex-col space-y-3 overflow-y-auto max-h-[460px] md:max-h-none">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real city, address, landmark..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                autoFocus
              />
              {isSearching ? (
                <RefreshCw className="absolute right-3 top-2.5 w-3.5 h-3.5 text-purple-600 animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={isDetectingGps}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold transition cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-purple-600" : ""}`} />
              <span>{isDetectingGps ? "Detecting GPS..." : "Use Current GPS Location"}</span>
            </button>

            {/* Results or Presets */}
            <div className="space-y-1.5 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {searchResults.length > 0
                  ? `Search Results (${searchResults.length})`
                  : searchQuery.trim().length > 1
                  ? "No Live Matches Found"
                  : "Popular Global Locations"}
              </div>

              {/* Dynamic Search Results */}
              {searchResults.length > 0 &&
                searchResults.map((loc, idx) => {
                  const isSelected =
                    activeLocation.lat === loc.lat && activeLocation.lon === loc.lon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-medium"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold flex items-center justify-between">
                          <span className="truncate">{loc.name}</span>
                          {loc.placeType && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal shrink-0">
                              {loc.placeType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mt-0.5">
                          {loc.formattedAddress}
                        </p>
                      </div>
                    </button>
                  );
                })}

              {/* Fallback Custom Location Button if searched */}
              {searchQuery.trim().length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelect({
                      name: searchQuery.trim(),
                      formattedAddress: searchQuery.trim(),
                      lat: activeLocation.lat,
                      lon: activeLocation.lon,
                      placeType: "Custom Tag",
                    })
                  }
                  className="w-full text-left p-2.5 rounded-xl border border-dashed border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300 text-xs flex items-center gap-2 font-medium hover:bg-purple-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">Tag custom name: &quot;{searchQuery.trim()}&quot;</span>
                </button>
              )}

              {/* Default Popular Presets */}
              {searchResults.length === 0 &&
                POPULAR_LOCATIONS.map((loc) => {
                  const isSelected =
                    activeLocation.name.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                      <div className="flex-1 truncate">
                        <span className="font-semibold">{loc.name}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                          {loc.country}
                        </span>
                      </div>
                      {loc.placeType && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-normal shrink-0">
                          {loc.placeType}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Real Interactive Map View (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-slate-100 dark:bg-slate-950 min-h-[300px]">
            {/* Map Frame Container */}
            <div className="relative flex-1 min-h-[260px] bg-slate-200 dark:bg-slate-900 overflow-hidden">
              <iframe
                title="Real OpenStreetMap Preview"
                src={mapIframeUrl}
                className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
                loading="lazy"
              />

              {/* Map Floating Control Overlay */}
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.003, prev / 2))}
                  className="w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(0.2, prev * 2))}
                  className="w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
              </div>

              {/* Coordinates Pill */}
              <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono shadow-md flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-purple-400" />
                <span>
                  {activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* Selected Location Card Preview */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Selected Location Tag
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Display Tag Name..."
                      className="text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-500 max-w-[280px]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {activeLocation.formattedAddress}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    <Check className="w-3 h-3" /> Geotag Ready
                  </span>
                </div>
              </div>

              {/* Multi-platform Geotag compatibility badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-400">Supported:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  📸 Instagram
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  📘 Facebook
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  🐦 X (Twitter)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  💼 LinkedIn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Clear / Remove Location
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#E08738] to-[#D97706] hover:brightness-105 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Attach Geotag Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealLocationMapModal;
