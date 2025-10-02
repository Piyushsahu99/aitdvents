import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating content for:', type, event.title);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'blog') {
      systemPrompt = "You are a professional content writer creating engaging blog posts about events, workshops, and opportunities for students in India. Write in a clear, informative, and engaging style.";
      userPrompt = `Write a comprehensive blog post about this event:
Title: ${event.title}
Description: ${event.description}
Date: ${event.date}
Location: ${event.location}
Category: ${event.category}

The blog should:
- Have an engaging introduction
- Explain why this event matters to students
- Highlight key benefits and takeaways
- Include practical tips for participants
- End with a call-to-action
- Be approximately 800-1000 words

Format the output as JSON with these fields:
{
  "title": "Blog title",
  "content": "Full blog content in markdown",
  "excerpt": "A compelling 2-sentence excerpt",
  "readTime": "Estimated read time (e.g., '5 min read')"
}`;
    } else if (type === 'hashtags') {
      systemPrompt = "You are a social media marketing expert creating trending hashtags for student events in India.";
      userPrompt = `Generate 8-10 relevant hashtags for this event:
Title: ${event.title}
Description: ${event.description}
Category: ${event.category}

Mix of:
- Event-specific hashtags
- General category hashtags
- Popular student/career hashtags
- Location-based hashtags (if applicable)

Return as JSON array: ["#hashtag1", "#hashtag2", ...]`;
    } else if (type === 'poster') {
      systemPrompt = "You are a professional graphic designer creating poster descriptions for student events.";
      userPrompt = `Create a detailed poster design description for:
Title: ${event.title}
Description: ${event.description}
Date: ${event.date}
Location: ${event.location}
Category: ${event.category}

Describe a vibrant, modern poster that would appeal to Indian students. Include:
- Color scheme
- Layout elements
- Key text to display
- Visual style (modern, professional, energetic, etc.)
- Any relevant imagery or graphics

Keep it concise but descriptive, suitable for AI image generation.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Generated content:', type, content.substring(0, 100));

    // Parse JSON response for structured content
    let result;
    if (type === 'blog' || type === 'hashtags') {
      try {
        result = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        result = { raw: content };
      }
    } else {
      result = { description: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
