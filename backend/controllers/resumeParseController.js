const pdfParse = require("pdf-parse");

const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No resume file uploaded" 
      });
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    let text = data.text;
    
    // Log the original extracted text for debugging
    console.log("Extracted raw text (first 500 chars):", text.substring(0, 500));
    
    // Pre-process the text to handle common PDF extraction issues
    text = preprocessText(text);
    
    // Extract name - multiple patterns to try
    let name = extractName(text);
    
    // Extract email - Look for standard email patterns
    const email = extractEmail(text);
    
    // Extract phone with international formats support
    const phone = extractPhone(text);
    
    // Extract URLs for social profiles
    const linkedin = extractLinkedin(text);
    const github = extractGithub(text);
    const portfolio = extractPortfolio(text);
    
    // Try to extract years of experience
    const experience = extractYearsOfExperience(text);
    
    // Extract skills using expanded dictionary
    const skillsExtracted = extractSkills(text);
    
    // Detect role preference
    const role = detectRole(text, skillsExtracted);

    // Format the response
    const extracted = {
      name,
      email,
      phone,
      linkedin: formatUrl(linkedin, "linkedin.com"),
      github: formatUrl(github, "github.com"),
      portfolio: formatUrl(portfolio),
      skills: skillsExtracted,
      experience,
      role
    };

    // Log what we extracted for debugging
    console.log("Extracted data:", extracted);

    res.json({
      success: true,
      extracted
    });
  } catch (err) {
    console.error("Error parsing resume:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to parse resume. " + err.message
    });
  }
};

// Preprocess text to handle common PDF extraction issues
function preprocessText(text) {
  // Insert spaces around special characters that often indicate field boundaries
  text = text.replace(/([ÓR̄W+|@])/g, ' $1 ');
  
  // Fix commonly merged email patterns
  text = text.replace(/(\+\d{1,3}-\d+)([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i, 
                     '$1 $2');
  
  // Insert space between lowercase followed by uppercase (common in merged text)
  text = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Clean up multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to extract name with multiple patterns
function extractName(text) {
  // Look for name at the beginning of the resume
  const namePatterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m,
    /(?:Name|Full name|Candidate)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /^([A-Z]+\s+[A-Z][a-z]+)/m
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return "";
}

// Helper function to extract email
function extractEmail(text) {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
  const match = text.match(emailPattern);
  
  if (!match) return "";
  
  // Validate and clean up the email
  const email = match[0].trim();
  if (email.length > 100 || !email.includes('@') || !email.includes('.')) {
    return "";
  }
  
  return email;
}

// Helper function to extract phone
function extractPhone(text) {
  // First try to find a phone with country code
  const internationalPattern = /\+\d{1,3}[-\s.]?\d{1,14}/g;
  const intMatch = text.match(internationalPattern);
  
  if (intMatch) {
    return intMatch[0].trim();
  }
  
  // If no international format, try standard formats
  const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const stdMatch = text.match(phonePattern);
  
  if (stdMatch) {
    return stdMatch[0].trim();
  }
  
  return "";
}

// Helper function to extract LinkedIn URL or username
function extractLinkedin(text) {
  // Look for LinkedIn URL
  const linkedinPatterns = [
    /(?:linkedin\.com\/in\/[a-z0-9_-]+)/i,
    /(?:linkedin\.com\/[a-z0-9_-]+)/i,
    /(?:linkedin[:\s]+([a-z0-9_-]+))/i
  ];
  
  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/linkedin[:\s]+/i, '').trim();
    }
  }
  
  // Check if LinkedIn is mentioned
  if (/\bLinkedIn\b/i.test(text)) {
    // LinkedIn is mentioned but we couldn't extract the URL
    return "profile-not-extracted";
  }
  
  return "";
}

// Helper function to extract GitHub URL or username
function extractGithub(text) {
  // Look for GitHub URL
  const githubPatterns = [
    /(?:github\.com\/[a-z0-9_-]+)/i,
    /(?:github[:\s]+([a-z0-9_-]+))/i
  ];
  
  for (const pattern of githubPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/github[:\s]+/i, '').trim();
    }
  }
  
  // Check if GitHub is mentioned
  if (/\bGitHub\b/i.test(text)) {
    // GitHub is mentioned but we couldn't extract the URL
    return "profile-not-extracted";  
  }
  
  return "";
}

// Helper function to extract portfolio URL
function extractPortfolio(text) {
  // Look for portfolio URL or mention
  const portfolioPatterns = [
    /(?:portfolio:?\s*(https?:\/\/[^\s]+))/i,
    /(?:website:?\s*(https?:\/\/[^\s]+))/i,
    /(?:portfolio\s*[:-]?\s*([a-z0-9_.-]+\.[a-z]{2,}))/i
  ];
  
  for (const pattern of portfolioPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Check if Portfolio is mentioned
  if (/\bPortfolio\b/i.test(text)) {
    return "website-not-extracted";
  }
  
  return "";
}

// Helper function to extract years of experience
function extractYearsOfExperience(text) {
  // Look for explicit experience statements
  const experiencePatterns = [
    /(\d+)\+?\s*(?:years|yrs)(?:\s*of)?\s*(?:experience|work)/i,
    /(?:experience|work experience)[:\s]*(\d+)\+?\s*(?:years|yrs)/i,
    /(?:worked|working)(?:\s*for)?\s*(\d+)\+?\s*(?:years|yrs)/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Try to deduce from work experience sections
  // Look for date ranges like "2020-2023" or "Jan 2020 - Dec 2023"
  const dateRangePattern = /(?:20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s,-]+(?:to\s+)?(?:present|current|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi;
  const dateRanges = text.match(dateRangePattern);
  
  if (dateRanges && dateRanges.length > 0) {
    // We found date ranges, but can't reliably calculate years
    // Just use the count of different experiences
    if (dateRanges.length <= 2) return "0-2";
    if (dateRanges.length <= 5) return "3-5";
    return "5+";
  }
  
  return "";
}

// Helper function to format URL with proper prefix
function formatUrl(url, defaultDomain = "") {
  if (!url) return "";
  if (url === "profile-not-extracted" || url === "website-not-extracted") return "";
  
  // Clean up URL
  url = url.replace(/[,.\s]+$/, '');
  
  if (url.startsWith('http')) {
    return url;
  } else if (defaultDomain && !url.includes('.')) {
    // For usernames like "johndoe" -> "https://linkedin.com/in/johndoe"
    if (defaultDomain === "linkedin.com") {
      return `https://${defaultDomain}/in/${url}`;
    }
    return `https://${defaultDomain}/${url}`;
  } else if (url.includes('.')) {
    return `https://${url}`;
  }
  
  return url;
}

// Helper function to extract skills
function extractSkills(text) {
  const skills = [];
  const skillsKeywords = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "PHP", "Ruby", "Go", "Rust", 
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Shell", "PowerShell", "Bash",
    "C",
    
    // Web Technologies
    "HTML", "CSS", "SASS", "LESS", "TailwindCSS", "Tailwind CSS", "Bootstrap", "Material UI", 
    "jQuery", "GraphQL", "REST API", "SOAP", "XML", "JSON", "AJAX", "shadcn UI",
    
    // JavaScript Frameworks/Libraries
    "React", "React.js", "Angular", "Vue", "Next.js", "Nuxt.js", "Gatsby", "Svelte", 
    "Redux", "MobX", "Express", "Express.js", "Node.js", "Meteor", "Ember", "Backbone",
    "Axios", "chart.js",
    
    // Python Libraries/Frameworks
    "Django", "Flask", "FastAPI", "Pyramid", "Tornado", "Scrapy", "NumPy", 
    "Pandas", "SciPy", "Matplotlib", "TensorFlow", "PyTorch", "Keras",
    
    // Java Frameworks
    "Spring", "Hibernate", "Struts", "JSF", "JUnit", "Maven", "Gradle",
    
    // .NET Framework
    "ASP.NET", ".NET Core", "Entity Framework", "WPF", "Xamarin",
    
    // PHP Frameworks
    "Laravel", "Symfony", "CodeIgniter", "CakePHP", "Zend", "WordPress",
    
    // Mobile Development
    "Android", "iOS", "React Native", "Flutter", "Xamarin", "Ionic", "Cordova",
    
    // Databases
    "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server", "MongoDB", 
    "Cassandra", "Redis", "DynamoDB", "Firebase", "Elasticsearch",
    
    // DevOps Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Jenkins", "Travis CI", 
    "CircleCI", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", 
    "Ansible", "Puppet", "Chef", "Prometheus", "Grafana", "Apache",
    
    // Testing
    "Jest", "Mocha", "Jasmine", "Selenium", "Cypress", "JUnit", "TestNG", 
    "PyTest", "PHPUnit", "Cucumber", "Postman",
    
    // Design Tools
    "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
    
    // Other relevant tools
    "LaTeX", "MySQL Workbench", "NI Multisim", "Octave", "Wireshark", "Linux", "JWT", "STL"
  ];

  // Look specifically for skills sections
  const skillSection = text.match(/\b(?:skills|technical skills|key skills)[:\s]+([\s\S]+?)(?:\n\s*\n|\bexperience\b|\beducation\b|\bachievements\b|\bprojects\b)/i);
  
  let textToSearch = text;
  if (skillSection && skillSection[1]) {
    // If we found a skills section, focus our search there
    textToSearch = skillSection[1];
  }
  
  // Extract known skills
  skillsKeywords.forEach(skill => {
    // Escape special regex characters in the skill name
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(textToSearch) || regex.test(text)) {
      // Check if it's not already in the skills array (case-insensitive)
      const found = skills.some(s => s.toLowerCase() === skill.toLowerCase());
      if (!found) {
        skills.push(skill);
      }
    }
  });

  return skills;
}

// Helper function to detect role preference
function detectRole(text, skills) {
  text = text.toLowerCase();
  
  // First try to find explicit role statements
  const rolePatterns = [
    /(?:^|\n)([a-z\s]+(?:developer|engineer|designer|architect|scientist))(?:\s*\||\n|$)/i,
    /(?:position|role|designation)(?:sought|desired|preferred)?[:\s]+([a-z\s]+(?:developer|engineer|designer|architect|scientist))/i
  ];
  
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim();
      
      // Map to standard roles
      if (/front.?end/i.test(role)) return "Frontend Developer";
      if (/back.?end/i.test(role)) return "Backend Developer";
      if (/full.?stack/i.test(role)) return "Full Stack Developer";
      if (/software/i.test(role)) return "Software Engineer";
      if (/mobile/i.test(role)) return "Mobile Developer";
      if (/devops/i.test(role)) return "DevOps Engineer";
      if (/data.?scientist/i.test(role)) return "Data Scientist";
      if (/ux|ui|user.?experience|user.?interface/i.test(role)) return "UX/UI Designer";
      
      // If it's a standard role, return as is with proper capitalization
      if (/developer|engineer|designer|architect|scientist/i.test(role)) {
        return role.replace(/\b\w/g, c => c.toUpperCase());
      }
    }
  }
  
  // If no explicit role, try keywords
  const roleKeywords = {
    "Frontend Developer": ["frontend", "front-end", "front end", "ui developer", "react developer", "angular developer", "vue developer"],
    "Backend Developer": ["backend", "back-end", "back end", "api developer", "server-side", "node developer", "python developer", "java developer"],
    "Full Stack Developer": ["full stack", "fullstack", "full-stack", "end-to-end", "frontend and backend"],
    "DevOps Engineer": ["devops", "cloud engineer", "infrastructure", "ci/cd", "deployment", "kubernetes", "docker"],
    "Mobile Developer": ["mobile", "android", "ios", "flutter", "react native", "swift", "mobile app"],
    "Data Scientist": ["data scientist", "machine learning", "deep learning", "ml engineer", "ai engineer", "data analysis", "statistics"],
    "UX/UI Designer": ["ux designer", "ui designer", "user experience", "interaction design", "web designer", "product designer"],
    "QA Engineer": ["qa engineer", "quality assurance", "test engineer", "automation tester", "manual tester", "software tester"]
  };
  
  for (const [role, keywords] of Object.entries(roleKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return role;
    }
  }
  
  // If still no role, analyze skills
  const frontendSkills = ["React", "Angular", "Vue", "HTML", "CSS", "JavaScript", "TypeScript", "Next.js", "shadcn UI", "Tailwind CSS"].filter(
    skill => skills.includes(skill)
  ).length;
  
  const backendSkills = ["Node.js", "Express", "Django", "Flask", "Spring", "Java", "C#", "PHP", "Python", "Ruby", "MongoDB", "MySQL"].filter(
    skill => skills.includes(skill)
  ).length;
  
  if (frontendSkills > backendSkills && frontendSkills >= 3) {
    return "Frontend Developer";
  } else if (backendSkills > frontendSkills && backendSkills >= 3) {
    return "Backend Developer";
  } else if (frontendSkills >= 2 && backendSkills >= 2) {
    return "Full Stack Developer";
  }
  
  return "Software Engineer"; // Default role
}

module.exports = {
  parseResume
};