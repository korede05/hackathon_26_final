// Define how much each category matters to the total score
const WEIGHTS = {
  budget: 0.25,      // 25% - Financial alignment
  lifestyle: 0.40,   // 40% - Sleep, Cleanliness, Social
  interests: 0.20,   // 20% - Shared hobbies
  bio: 0.15          // 15% - Personality/Vibe from text
};

export const calculateDeepMatch = (me: any, potential: any) => {
  let lifestyleScore = 0;
  
  // 1. Lifestyle Math (Steps 2 of Onboarding)
  if (me.sleep_habit === potential.sleep_habit) lifestyleScore += 33;
  if (me.cleanliness_habit === potential.cleanliness_habit) lifestyleScore += 34;
  if (me.social_level === potential.social_level) lifestyleScore += 33;

  // 2. Budget Logic
  const budgetDiff = Math.abs(me.budget - potential.budget);
  const budgetScore = budgetDiff < 200 ? 100 : Math.max(0, 100 - (budgetDiff / 5));

  // 3. Interests Overlap (Step 3 of Onboarding)
  const common = me.interests?.filter((i: string) => potential.interests?.includes(i)) || [];
  const interestScore = Math.min(100, common.length * 25);

  // Combine them based on weights
  const finalScore = 
    (budgetScore * WEIGHTS.budget) + 
    (lifestyleScore * WEIGHTS.lifestyle) + 
    (interestScore * WEIGHTS.interests);

  return Math.round(finalScore);
};