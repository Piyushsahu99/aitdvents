import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  external_link: string;
  is_online: boolean;
  is_free: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's JWT to check admin status
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify admin role using the is_admin RPC function
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc('is_admin');
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin authorization verified, proceeding with scrape');

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key for database operations after admin verification
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { source = 'unstop', category = 'all' } = await req.json().catch(() => ({}));

    console.log(`Starting scrape from ${source}, category: ${category}`);

    // Define URLs to scrape based on source
    const urls: string[] = [];
    
    if (source === 'unstop' || source === 'all') {
      urls.push(
        'https://unstop.com/hackathons',
        'https://unstop.com/competitions',
        'https://unstop.com/internships'
      );
    }

    const allEvents: ScrapedEvent[] = [];
    const errors: string[] = [];

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);
        
        // Use Firecrawl to scrape the page
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        if (!scrapeResponse.ok) {
          const errorData = await scrapeResponse.json();
          console.error(`Failed to scrape ${url}:`, errorData);
          errors.push(`Failed to scrape ${url}: ${errorData.error || 'Unknown error'}`);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
        const links = scrapeData.data?.links || scrapeData.links || [];

        console.log(`Got ${links.length} links from ${url}`);

        // Extract event links from Unstop
        const eventLinks = links.filter((link: string) => {
          return link.includes('unstop.com/') && (
            link.includes('/hackathons/') ||
            link.includes('/competitions/') ||
            link.includes('/internships/') ||
            link.includes('/p/')
          ) && !link.includes('?') && link.split('/').length > 4;
        }).slice(0, 5); // Limit to 5 events per category to avoid rate limits

        console.log(`Found ${eventLinks.length} event links to process`);

        // For each event link, get more details
        for (const eventLink of eventLinks) {
          try {
            // Check if event already exists
            const { data: existingEvent } = await supabase
              .from('events')
              .select('id')
              .eq('external_link', eventLink)
              .single();

            if (existingEvent) {
              console.log(`Event already exists: ${eventLink}`);
              continue;
            }

            // Scrape individual event page
            const eventResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: eventLink,
                formats: ['markdown'],
                onlyMainContent: true,
              }),
            });

            if (!eventResponse.ok) {
              console.error(`Failed to scrape event: ${eventLink}`);
              continue;
            }

            const eventData = await eventResponse.json();
            const eventMarkdown = eventData.data?.markdown || eventData.markdown || '';

            // Parse event details from markdown
            const event = parseEventFromMarkdown(eventMarkdown, eventLink);
            if (event) {
              allEvents.push(event);
            }

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (err) {
            console.error(`Error processing event ${eventLink}:`, err);
          }
        }

      } catch (err) {
        console.error(`Error scraping ${url}:`, err);
        errors.push(`Error scraping ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`Total events found: ${allEvents.length}`);

    // Insert new events into database
    let insertedCount = 0;
    for (const event of allEvents) {
      try {
        const { error } = await supabase
          .from('events')
          .insert({
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            category: event.category,
            external_link: event.external_link,
            is_online: event.is_online,
            is_free: event.is_free,
            status: 'live',
            submitted_by_user: false,
          });

        if (error) {
          console.error(`Failed to insert event: ${event.title}`, error);
        } else {
          insertedCount++;
          console.log(`Inserted event: ${event.title}`);
        }
      } catch (err) {
        console.error(`Error inserting event:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped ${allEvents.length} events, inserted ${insertedCount} new events`,
        events_found: allEvents.length,
        events_inserted: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-events function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function cleanTitle(raw: string): string {
  // Remove anything after " | " (site name suffixes like "| Unstop")
  let title = raw.split(' | ')[0].split(' - Unstop')[0].trim();
  // Remove trailing numeric IDs like " - 12345" or " (12345)"
  title = title.replace(/\s*[-–]\s*\d{4,}\s*$/, '').trim();
  title = title.replace(/\s*\(\d{4,}\)\s*$/, '').trim();
  // Decode HTML entities
  title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return title.slice(0, 200);
}

function parseEventFromMarkdown(markdown: string, link: string): ScrapedEvent | null {
  try {
    // Extract title — prefer first H1, then H2
    const titleMatch = markdown.match(/^#\s+(.+)$/m) || markdown.match(/^##\s+(.+)$/m);
    const rawTitle = titleMatch ? titleMatch[1].trim() : '';
    const title = cleanTitle(rawTitle);

    if (!title || title.length < 5) {
      return null;
    }

    // Extract description (first substantial paragraph after title)
    const lines = markdown.split('\n').filter(l => l.trim());
    let description = '';
    for (const line of lines) {
      if (!line.startsWith('#') && line.length > 50 && !line.startsWith('!')) {
        description = line.trim().slice(0, 500);
        break;
      }
    }

    if (!description) {
      description = `Participate in ${title} on Unstop. Register now to compete and win exciting prizes!`;
    }

    // Determine category based on URL and content
    let category = 'Competition';
    if (link.includes('/hackathons/') || link.includes('hackathon')) {
      category = 'Hackathon';
    } else if (link.includes('/internships/') || link.includes('internship')) {
      category = 'Internship';
    } else if (link.includes('/workshop')) {
      category = 'Workshop';
    }

    // Check if online
    const isOnline = markdown.toLowerCase().includes('online') || 
                     markdown.toLowerCase().includes('virtual') ||
                     markdown.toLowerCase().includes('remote');

    // Check if free
    const isFree = markdown.toLowerCase().includes('free') || 
                   markdown.toLowerCase().includes('no fee') ||
                   !markdown.toLowerCase().includes('registration fee');

    // Try to extract date
    let date = new Date();
    date.setMonth(date.getMonth() + 1); // Default to 1 month from now
    
    const datePatterns = [
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
      /deadline[:\s]+(\d{1,2})\s+(\w+)\s+(\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = markdown.match(pattern);
      if (match) {
        const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
        if (!isNaN(parsed.getTime())) {
          date = parsed;
          break;
        }
      }
    }

    // Extract location
    let location = isOnline ? 'Online' : 'India';
    const locationMatch = markdown.match(/location[:\s]+([^\n]+)/i) ||
                          markdown.match(/venue[:\s]+([^\n]+)/i);
    if (locationMatch) {
      location = locationMatch[1].trim().slice(0, 100);
    }

    return {
      title,
      description,
      date: date.toISOString().split('T')[0],
      location,
      category,
      external_link: link,
      is_online: isOnline,
      is_free: isFree,
    };

  } catch (err) {
    console.error('Error parsing event:', err);
    return null;
  }
}
