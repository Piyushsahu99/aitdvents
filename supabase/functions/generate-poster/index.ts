import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const requestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  type: z.enum(['event', 'job']).default('event'),
  category: z.string().optional(),
  company: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request', details: validationResult.error.errors.map(e => e.message)
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { title, description, type, category, company, date, location } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const isJob = type === 'job';
    
    const prompt = isJob
      ? `Create a professional job/internship poster with these details:
- The title "${title}" MUST be prominently displayed in LARGE, BOLD text at the top center of the poster
- Company: ${company || 'N/A'}
- Category: ${category || 'General'}
- Location: ${location || 'N/A'}
- Description: ${description}
Style: Modern corporate design, clean typography, professional color scheme (blues, teals). Include a subtle tech/business pattern background. The company name should appear below the title. Add "APPLY NOW" call-to-action at the bottom. Size: 1024x1536 vertical poster.`
      : `Create a professional event poster with these details:
- The event name "${title}" MUST be prominently displayed in LARGE, BOLD, eye-catching text as the main focal point
- Category: ${category || 'Event'}
- Date: ${date || 'TBA'}
- Location: ${location || 'TBA'}
- Description: ${description}
Style: Modern, vibrant, appealing to college students. Use bold gradients and dynamic shapes. The event name should be the BIGGEST text element on the poster. Include "AITD Events" branding subtly. Add "REGISTER NOW" call-to-action at the bottom. Size: 1024x1536 vertical poster.`;

    console.log(`Generating ${type} poster for: ${title}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) throw new Error('No image generated');

    console.log(`${type} poster generated successfully for: ${title}`);

    return new Response(JSON.stringify({ imageUrl: imageData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-poster:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
