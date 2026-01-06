import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Present';
  const date = new Date(dateStr + '-01');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function generateResume(data: ResumeData): string {
  const { personalInfo, experiences, education, skills } = data;
  
  let resume = '';
  
  // Header
  resume += `${'='.repeat(60)}\n`;
  resume += `${personalInfo.fullName.toUpperCase()}\n`;
  resume += `${'='.repeat(60)}\n\n`;
  
  // Contact Info
  const contactParts = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (contactParts.length > 0) {
    resume += contactParts.join(' | ') + '\n';
  }
  
  const linkParts = [];
  if (personalInfo.linkedin) linkParts.push(`LinkedIn: ${personalInfo.linkedin}`);
  if (personalInfo.portfolio) linkParts.push(`Portfolio: ${personalInfo.portfolio}`);
  if (linkParts.length > 0) {
    resume += linkParts.join(' | ') + '\n';
  }
  
  resume += '\n';
  
  // Professional Summary
  if (personalInfo.summary) {
    resume += `${'─'.repeat(60)}\n`;
    resume += `PROFESSIONAL SUMMARY\n`;
    resume += `${'─'.repeat(60)}\n\n`;
    resume += `${personalInfo.summary}\n\n`;
  }
  
  // Experience
  if (experiences.length > 0) {
    resume += `${'─'.repeat(60)}\n`;
    resume += `PROFESSIONAL EXPERIENCE\n`;
    resume += `${'─'.repeat(60)}\n\n`;
    
    for (const exp of experiences) {
      resume += `${exp.position.toUpperCase()}\n`;
      resume += `${exp.company} | ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}\n`;
      if (exp.description) {
        const bullets = exp.description.split('\n').filter(line => line.trim());
        for (const bullet of bullets) {
          resume += `  • ${bullet.trim()}\n`;
        }
      }
      resume += '\n';
    }
  }
  
  // Education
  if (education.length > 0) {
    resume += `${'─'.repeat(60)}\n`;
    resume += `EDUCATION\n`;
    resume += `${'─'.repeat(60)}\n\n`;
    
    for (const edu of education) {
      resume += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n`;
      resume += `${edu.institution} | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n\n`;
    }
  }
  
  // Skills
  if (skills.length > 0) {
    resume += `${'─'.repeat(60)}\n`;
    resume += `SKILLS\n`;
    resume += `${'─'.repeat(60)}\n\n`;
    
    // Group skills in rows of 4
    const skillRows = [];
    for (let i = 0; i < skills.length; i += 4) {
      skillRows.push(skills.slice(i, i + 4).join(' • '));
    }
    resume += skillRows.join('\n') + '\n';
  }
  
  resume += `\n${'='.repeat(60)}\n`;
  
  return resume;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData } = await req.json() as { resumeData: ResumeData };
    
    if (!resumeData || !resumeData.personalInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid resume data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resume = generateResume(resumeData);

    return new Response(
      JSON.stringify({ resume }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating resume:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate resume' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});