"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  Navigation,
  Check,
  RefreshCw,
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

const POPULAR_LOCATIONS: LocationData[] = [
  {
    name: "Mumbai",
    formattedAddress: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    lat: 19.076,
    lon: 72.8777,
  },
  {
    name: "New Delhi",
    formattedAddress: "New Delhi, Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    lat: 28.6139,
    lon: 77.209,
  },
  {
    name: "Bengaluru",
    formattedAddress: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    lat: 12.9716,
    lon: 77.5946,
  },
  {
    name: "Hyderabad",
    formattedAddress: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    lat: 17.385,
    lon: 78.4867,
  },
  {
    name: "Dubai",
    formattedAddress: "Dubai, United Arab Emirates",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.1972,
    lon: 55.2744,
  },
  {
    name: "London",
    formattedAddress: "London, Greater London, United Kingdom",
    city: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    name: "New York",
    formattedAddress: "New York, NY, United States",
    city: "New York",
    state: "NY",
    country: "United States",
    lat: 40.7128,
    lon: -74.006,
  },
  {
    name: "San Francisco",
    formattedAddress: "San Francisco, CA, United States",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    lat: 37.7749,
    lon: -122.4194,
  },
  {
    name: "Singapore",
    formattedAddress: "Singapore",
    city: "Singapore",
    country: "Singapore",
    lat: 1.2847,
    lon: 103.861,
  },
  {
    name: "Tokyo",
    formattedAddress: "Tokyo, Japan",
    city: "Tokyo",
    country: "Japan",
    lat: 35.658,
    lon: 139.7016,
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

  const [activeLocation, setActiveLocation] = useState<LocationData | null>(() => {
    if (currentLocation) {
      const match = POPULAR_LOCATIONS.find(
        (l) =>
          l.name.toLowerCase() === currentLocation.toLowerCase() ||
          l.formattedAddress.toLowerCase().includes(currentLocation.toLowerCase())
      );
      if (match) return match;
      return {
        name: currentLocation,
        formattedAddress: currentLocation,
        lat: 19.076,
        lon: 72.8777,
      };
    }
    return null;
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentLocation) {
      const match = POPULAR_LOCATIONS.find(
        (l) =>
          l.name.toLowerCase() === currentLocation.toLowerCase() ||
          l.formattedAddress.toLowerCase().includes(currentLocation.toLowerCase())
      );
      if (match) {
        setActiveLocation(match);
      } else {
        setActiveLocation({
          name: currentLocation,
          formattedAddress: currentLocation,
          lat: 19.076,
          lon: 72.8777,
        });
      }
    } else {
      setActiveLocation(null);
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
        )}&limit=8`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const parsedResults: LocationData[] = (data || []).map((item: any) => {
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.county ||
              "";
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
            };
          });
          setSearchResults(parsedResults);
        }
      } catch (err) {
        console.error("Location search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Device GPS Detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
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
            };

            setActiveLocation(detected);
          }
        } catch {
          setActiveLocation({
            name: "Current Location",
            formattedAddress: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            lat,
            lon,
          });
        } finally {
          setIsDetectingGps(false);
        }
      },
      () => {
        setIsDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelect = (loc: LocationData) => {
    setActiveLocation(loc);
  };

  const handleConfirm = () => {
    onSelectLocation(activeLocation);
    onClose();
  };

  const handleClear = () => {
    setActiveLocation(null);
    onSelectLocation(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Location
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Search real places, landmarks, and cities
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

        {/* Content Body */}
        <div className="p-4 flex flex-col space-y-3 overflow-y-auto max-h-[460px]">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, place, or address..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              autoFocus
            />
            {isSearching ? (
              <RefreshCw className="absolute right-3 top-2.5 w-3.5 h-3.5 text-purple-600 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition cursor-pointer"
          >
            <Navigation
              className={`w-3.5 h-3.5 ${isDetectingGps ? "animate-spin text-purple-600" : ""}`}
            />
            <span>{isDetectingGps ? "Locating..." : "Use Current Location"}</span>
          </button>

          {/* Active selection banner if chosen */}
          {activeLocation && (
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeLocation.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {activeLocation.formattedAddress}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected
              </span>
            </div>
          )}

          {/* Results or Popular Places */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
              {searchResults.length > 0
                ? `Results (${searchResults.length})`
                : searchQuery.trim().length > 1
                ? "No Places Found"
                : "Popular Places"}
            </div>

            {/* Dynamic Search Results */}
            {searchResults.length > 0
              ? searchResults.map((loc, idx) => {
                  const isSelected =
                    activeLocation &&
                    activeLocation.lat === loc.lat &&
                    activeLocation.lon === loc.lon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isSelected ? "text-purple-600" : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {loc.name}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {loc.formattedAddress}
                        </p>
                      </div>
                    </button>
                  );
                })
              : POPULAR_LOCATIONS.map((loc) => {
                  const isSelected =
                    activeLocation &&
                    activeLocation.name.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-purple-600" : "text-slate-400"
                          }`}
                        />
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {loc.country}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Clear Location
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
              disabled={!activeLocation}
              className="px-5 py-1.5 rounded-xl bg-[#5846A8] hover:bg-[#48388d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Attach Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealLocationMapModal;
