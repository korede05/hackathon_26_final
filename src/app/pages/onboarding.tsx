import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Camera, 
  Plus,
  GraduationCap,
  Briefcase 
} from "lucide-react";
import { toast } from "sonner";

const SUGGESTED_INTERESTS = ["Coding", "Gaming", "Sports", "Music", "Reading", "Cooking", "Hiking", "Yoga", "Photography", "Art", "Movies", "Fitness"];

interface ProfileData {
  full_name: string;
  age: string;
  university: string;
  major: string;
  year: string;
  occupation: string;
  bio: string;
  budget: string;
  interests: string[];
  sleep_habit: string;
  cleanliness_habit: string;
  social_habit: string;
  avatar_url: string;
}

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<number>(1);
  const [userType, setUserType] = useState<"student" | "professional" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [customInterest, setCustomInterest] = useState("");

  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    age: "",
    university: "",
    major: "",
    year: "",
    occupation: "",
    bio: "",
    budget: "",
    interests: [],
    sleep_habit: "Moderate",
    cleanliness_habit: "Clean",
    social_habit: "Moderate",
    avatar_url: "",
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Photo uploaded!");
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
      setCustomInterest("");
      toast.success(`Added "${trimmed}"`);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: dbError } = await supabase.from("profiles").upsert({
        id: user.id,
        onboarded: true,
        full_name: formData.full_name,
        age: parseInt(formData.age) || 0,
        university: formData.university,
        major: formData.major,
        year: formData.year,
        occupation: formData.occupation,
        bio: formData.bio,
        budget: parseFloat(formData.budget) || 0,
        interests: formData.interests,
        user_type: userType,
        sleep_habit: formData.sleep_habit,
        cleanliness_habit: formData.cleanliness_habit,
        social_habit: formData.social_habit,
        avatar_url: formData.avatar_url,
      });

      if (dbError) throw dbError;
      toast.success("Profile created!");
      navigate("/browse", { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round((step / 3) * 100);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's get started!</h2>
              <p className="text-gray-500">Tell us about yourself</p>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    userType === "student" 
                      ? "border-black bg-black text-white" 
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-sm font-semibold">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("professional")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    userType === "professional" 
                      ? "border-black bg-black text-white" 
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-sm font-semibold">Young Professional</span>
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div 
                className="relative w-32 h-32 cursor-pointer group" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                  {isUploading ? (
                    <div className="text-xs font-semibold text-gray-400">Uploading...</div>
                  ) : formData.avatar_url ? (
                    <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={28} />
                    </div>
                  )}
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Upload Photo</p>
              <p className="text-xs text-gray-400 mt-1">Add a profile picture</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Age</label>
                <input
                  type="number"
                  className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              {/* Conditional Fields Based on User Type */}
              {userType === "student" ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">University</label>
                    <input
                      className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Boston University"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Major</label>
                      <input
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Computer Science"
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                      <input
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Junior"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : userType === "professional" ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Occupation</label>
                    <input
                      className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Software Engineer"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company (Optional)</label>
                    <input
                      className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Tech Corp"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                <textarea
                  className="w-full p-3 bg-gray-50 border-0 rounded-xl h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell potential roommates about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-2">Share your personality, hobbies, and what you're looking for in a roommate</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Housing Preferences</h2>
              <p className="text-gray-500">Help us find your perfect match</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1200"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Enter your monthly housing budget</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Sleep Schedule</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Early Bird", "Night Owl", "Flexible"].map(habit => (
                    <button
                      key={habit}
                      onClick={() => setFormData({...formData, sleep_habit: habit})}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.sleep_habit === habit 
                          ? "bg-black text-white" 
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {habit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Cleanliness Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Very Clean", "Clean", "Moderate", "Relaxed"].map(habit => (
                    <button
                      key={habit}
                      onClick={() => setFormData({...formData, cleanliness_habit: habit})}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.cleanliness_habit === habit 
                          ? "bg-black text-white" 
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {habit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Social Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Very Social", "Social", "Moderate", "Quiet"].map(habit => (
                    <button
                      key={habit}
                      onClick={() => setFormData({...formData, social_habit: habit})}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.social_habit === habit 
                          ? "bg-black text-white" 
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {habit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Interests</h2>
              <p className="text-gray-500">Select from suggestions or add your own</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Add Your Own Interest</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 bg-gray-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rock Climbing, Anime, Baking..."
                  value={customInterest}
                  onChange={e => setCustomInterest(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addCustomInterest()}
                />
                <button
                  onClick={addCustomInterest}
                  className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Suggested Interests</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.interests.includes(interest)
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {formData.interests.includes(interest) ? "- " : "+ "}{interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Show selected custom interests */}
            {formData.interests.filter(i => !SUGGESTED_INTERESTS.includes(i)).length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Your Custom Interests</label>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.filter(i => !SUGGESTED_INTERESTS.includes(i)).map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white border-black"
                    >
                      - {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">Step {step} of 3</span>
            <span className="text-sm font-medium text-gray-500">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : handleComplete())}
            disabled={isSubmitting || isUploading || (step === 1 && !userType)}
            className="flex-1 bg-black text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Creating Profile..." : step === 3 ? "Get Started" : "Continue"}
            {step < 3 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};