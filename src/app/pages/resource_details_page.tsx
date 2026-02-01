import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { Calendar, MapPin, ArrowLeft, ExternalLink, Globe } from "lucide-react";

export const ResourceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching details:", error);
        navigate("/resources"); // Redirect back if not found
      } else {
        setResource(data);
      }
      setLoading(false);
    };

    fetchResourceDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Opportunity Details</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {/* Header Info */}
          <div className="mb-6">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold inline-block mb-4 ${
              resource.category === "volunteering" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {resource.category === "volunteering" ? "Volunteering" : "Giving Back"}
            </span>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{resource.title}</h2>
            
            <div className="flex flex-wrap gap-6 text-gray-600">
              {resource.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  <span className="font-medium">{resource.location}</span>
                </div>
              )}
              {resource.date && (
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-purple-500" />
                  <span className="font-medium">
                    {new Date(resource.date).toLocaleString([], { 
                      dateStyle: 'long', 
                      timeStyle: 'short' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About this opportunity</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {resource.description}
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4">
            {resource.link && (
              <a 
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-br from-blue-600 to-purple-500 text-white py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg"
              >
                Visit Official Website <ExternalLink size={18} />
              </a>
            )}
            <button className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">
              Share Opportunity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};