import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Calendar, MapPin, Info, Plus } from "lucide-react";
import { AddResourceForm } from "../components/AddResourceForm";
import { useNavigate } from "react-router-dom";

export const ResourcesPage = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [filter, setFilter] = useState<"volunteering" | "giving_back">("volunteering");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchResources = async (showLoading = false) => {
    if (showLoading) setInitialLoading(true);

    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("category", filter)
      .order("created_at", { ascending: false });

    setResources(data || []);
    if (showLoading) setInitialLoading(false);
  };

  const scrollToForm = () => {
    const formElement = document.querySelector('[class*="space-y-4"][class*="bg-white"][class*="p-6"]');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstInput = formElement.querySelector('input, select, textarea');
      if (firstInput instanceof HTMLElement) {
        setTimeout(() => firstInput.focus(), 500);
      }
    }
  };

  useEffect(() => {
    fetchResources(true);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchResources(false);
    }
  }, [filter]);

  // if (initialLoading) {
  //   return (
  //     <div className="h-screen bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
  //         <p className="font-bold text-white text-xl">Loading resources...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900">Community Resources</h1>
          <p className="text-sm text-gray-500">
            {resources.length} {resources.length === 1 ? "opportunity" : "opportunities"} available
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-24">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            onClick={() => setFilter("volunteering")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              filter === "volunteering"
                ? "bg-gradient-to-br from-blue-600 to-purple-500 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Volunteering
          </button>
          <button
            onClick={() => setFilter("giving_back")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              filter === "giving_back"
                ? "bg-gradient-to-br from-blue-600 to-purple-500 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Giving Back
          </button>
        </div>

        {/* Add Resource Form */}
        <div className="mb-6">
          <AddResourceForm />
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No opportunities yet</p>
              <p className="text-sm">Be the first to post one!</p>
            </div>
          ) : (
            resources.map((res) => (
              <div
                key={res.id}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Header Row - Title and Info Button */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {res.title}
                  </h3>
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                    title="More info"
                  >
                    <Info size={20} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      filter === "volunteering"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {res.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-3 text-sm">{res.description}</p>

                {/* Location and Date */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  {res.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{res.location}</span>
                    </div>
                  )}
                  {res.date && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(res.date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button - Bottom Right */}
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/resources/${res.id}`)}
                    className="bg-gradient-to-br from-blue-600 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) - Gradient
      <button
        onClick={scrollToForm}
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 100%)',
        }}
        className="fixed bottom-28 right-6 text-white px-5 py-3 rounded-full shadow-2xl hover:opacity-90 transition-all hover:scale-110 active:scale-95 flex items-center gap-2 z-20"
      >
        <Plus size={20} />
        <span className="font-semibold">Post Event</span>
      </button> */}
    </div>
  );
};