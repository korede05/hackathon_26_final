import { useState } from 'react';
import { supabase } from "../../../supabaseClient";
import { toast } from 'sonner';
import { Info } from 'lucide-react';

export const AddResourceForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'volunteering',
    location: '',
    date: '',
    link: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('resources').insert([{
      ...formData,
      posted_by: user?.id,
      date: formData.date || null
    }]);

    if (error) {
      toast.error("Error adding resource: " + error.message);
    } else {
      toast.success("Opportunity added successfully!");
      setFormData({ title: '', description: '', category: 'volunteering', location: '', date: '', link: '' });
      window.location.reload(); // Refresh the page to show new resource
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Post an Opportunity</h2>
        <button 
          type="button"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="More info"
        >
          <Info size={20} />
        </button>
      </div>
      
      <select 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.category}
        onChange={e => setFormData({...formData, category: e.target.value})}
      >
        <option value="volunteering">Volunteering Event</option>
        <option value="giving_back">Giving Back / Donations</option>
      </select>

      <input 
        placeholder="Title (e.g. Community Food Drive)"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
      />

      <textarea 
        placeholder="Description"
        className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
      />

      <input 
        placeholder="Location"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={formData.location}
        onChange={e => setFormData({...formData, location: e.target.value})}
      />

      {formData.category === 'volunteering' && (
        <input 
          type="datetime-local"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.date}
          onChange={e => setFormData({...formData, date: e.target.value})}
        />
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-gradient-to-br from-blue-600 to-purple-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Opportunity"}
      </button>
    </form>
  );
};