import React, { useEffect, useState } from "react";
import { ListingsMap } from "../components/ListingsMap";

export const MapPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for map initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

    if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-white text-xl">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-6">
 {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
          <p className="text-sm text-gray-500">Browse listings by location</p>
        </div>
      </div>

      {/* Content - Constrained height */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
        <ListingsMap />
      </div>
    </div>
  );
};
