import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export const AddResourceForm = ({ onRefresh }: { onRefresh: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "volunteering",
    location: "",
    date: "",
    link: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("resources").insert([{
      ...formData,
      posted_by: user?.id,
      date: formData.date || null
    }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Event posted!");
      setIsOpen(false);
      onRefresh(); // Refresh the list
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2 font-bold"
    >
      <Plus size={24} /> Post Event
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Opportunity</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select 
            className="w-full p-3 border rounded-xl bg-gray-50"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="volunteering">Volunteering</option>
            <option value="giving_back">Giving Back</option>
          </select>

          <input 
            required placeholder="Title" 
            className="w-full p-3 border rounded-xl"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />

          <textarea 
            placeholder="Description" 
            className="w-full p-3 border rounded-xl h-24"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />

          <input 
            placeholder="Location" 
            className="w-full p-3 border rounded-xl"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
          />

          <input 
            type="datetime-local" 
            className="w-full p-3 border rounded-xl"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Opportunity"}
          </button>
        </form>
      </div>
    </div>
  );
};