// Calculate skill match percentage between user skills and job description
export const calculateSkillMatch = (userSkills, jobDescription) => {
  if (!userSkills || userSkills.length === 0 || !jobDescription) {
    return 0;
  }

  let matchCount = 0;
  const jobDescLower = jobDescription.toLowerCase();

  userSkills.forEach(skill => {
    if (jobDescLower.includes(skill.toLowerCase())) {
      matchCount++;
    }
  });

  // Calculate percentage with at least 10% base match
  const percentage = Math.min(
    100, 
    Math.round((matchCount / userSkills.length) * 100) + 10
  );
  
  return percentage;
};

// Get color based on match percentage
export const getMatchColor = (percentage) => {
  if (percentage >= 70) {
    return "text-green-600";
  } else if (percentage >= 40) {
    return "text-yellow-600";
  } else {
    return "text-red-600";
  }
};