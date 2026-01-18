import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CertificateEmailPayload {
  action: 'send_single' | 'send_leaderboard_certificates';
  certificateId?: string;
  month?: number;
  year?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: CertificateEmailPayload = await req.json();
    const { action, certificateId, month, year } = payload;

    console.log('Processing certificate email request:', { action, certificateId, month, year });

    if (action === 'send_single' && certificateId) {
      // Send a single certificate email
      const { data: cert, error: certError } = await supabase
        .from('issued_certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (certError || !cert) {
        throw new Error('Certificate not found');
      }

      if (!resendApiKey) {
        // If no Resend API key, just mark as sent
        await supabase
          .from('issued_certificates')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', certificateId);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Certificate marked as sent (email service not configured)' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send email using Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AITD Events <certificates@aitdevents.com>',
          to: [cert.recipient_email],
          subject: `🎉 Congratulations! Your AITD Events Certificate is Ready`,
          html: generateCertificateEmailHtml(cert)
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', errorText);
        throw new Error('Failed to send email');
      }

      // Update certificate with sent timestamp
      await supabase
        .from('issued_certificates')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', certificateId);

      return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'send_leaderboard_certificates' && month && year) {
      // Get all winners for the specified month/year
      const { data: winners, error: winnersError } = await supabase
        .from('monthly_leaderboard_winners')
        .select('*, issued_certificates(*)')
        .eq('month', month)
        .eq('year', year)
        .order('rank', { ascending: true });

      if (winnersError) {
        throw new Error('Failed to fetch winners');
      }

      const results = [];
      for (const winner of winners || []) {
        if (winner.certificate_id) {
          const { data: cert } = await supabase
            .from('issued_certificates')
            .select('*')
            .eq('id', winner.certificate_id)
            .single();

          if (cert && !cert.email_sent_at) {
            if (resendApiKey) {
              try {
                await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'AITD Events <certificates@aitdevents.com>',
                    to: [cert.recipient_email],
                    subject: `🏆 Congratulations! You're a Top ${winner.rank} Performer - ${MONTHS[month - 1]} ${year}`,
                    html: generateLeaderboardEmailHtml(cert, winner.rank, MONTHS[month - 1], year, winner.points_earned)
                  })
                });
                
                await supabase
                  .from('issued_certificates')
                  .update({ email_sent_at: new Date().toISOString() })
                  .eq('id', cert.id);

                results.push({ userId: winner.user_id, rank: winner.rank, status: 'sent' });
              } catch (err) {
                console.error(`Failed to send email for rank ${winner.rank}:`, err);
                results.push({ userId: winner.user_id, rank: winner.rank, status: 'failed' });
              }
            } else {
              // Mark as sent without actually sending
              await supabase
                .from('issued_certificates')
                .update({ email_sent_at: new Date().toISOString() })
                .eq('id', cert.id);
              results.push({ userId: winner.user_id, rank: winner.rank, status: 'marked_sent' });
            }
          } else {
            results.push({ userId: winner.user_id, rank: winner.rank, status: 'already_sent' });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-certificate function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateCertificateEmailHtml(cert: any): string {
  const verifyUrl = cert.verification_url || `https://aitdevents.lovable.app/certificates?verify=true&code=${cert.certificate_number}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Your certificate is ready</p>
        </div>
        
        <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear <strong>${cert.recipient_name}</strong>,</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            We are pleased to inform you that your AITD Events certificate has been issued!
          </p>
          
          <div style="background: #fff7ed; border: 2px solid #f97316; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Certificate ID</p>
            <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold; font-family: monospace;">${cert.certificate_number}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">View & Download Certificate</a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              📱 <strong>Add to LinkedIn:</strong> Click the button in the certificate page to add this credential to your LinkedIn profile!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #999; text-align: center;">
            AITD Events - Empowering Students, Building Futures
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateLeaderboardEmailHtml(cert: any, rank: number, month: string, year: number, points: number): string {
  const verifyUrl = cert.verification_url || `https://aitdevents.lovable.app/certificates?verify=true&code=${cert.certificate_number}`;
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  const rankTitle = rank === 1 ? 'Champion' : rank === 2 ? 'Runner Up' : 'Achiever';
  const gradientColors = rank === 1 
    ? '#fbbf24, #f59e0b' 
    : rank === 2 
    ? '#9ca3af, #6b7280' 
    : '#f97316, #ea580c';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${gradientColors}); border-radius: 16px 16px 0 0; padding: 40px 20px; text-align: center;">
          <div style="font-size: 60px; margin-bottom: 10px;">${rankEmoji}</div>
          <h1 style="color: white; margin: 0; font-size: 28px;">${rankTitle}!</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">${month} ${year} Leaderboard</p>
        </div>
        
        <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear <strong>${cert.recipient_name}</strong>,</p>
          
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Congratulations on being ranked <strong>#${rank}</strong> on the AITD Events Monthly Leaderboard for <strong>${month} ${year}</strong>!
          </p>
          
          <div style="background: linear-gradient(135deg, ${gradientColors}); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Achievement</p>
            <p style="margin: 10px 0; font-size: 36px; font-weight: bold;">🏆 ${points.toLocaleString()} Points</p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Rank #${rank} • ${month} ${year}</p>
          </div>
          
          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Certificate ID</p>
            <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; font-weight: bold; font-family: monospace;">${cert.certificate_number}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, ${gradientColors}); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">View & Download Certificate</a>
          </div>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              💼 <strong>Share Your Achievement:</strong> Don't forget to share this on LinkedIn and Twitter to show off your accomplishment!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #999; text-align: center;">
            Keep up the great work! 🚀<br>
            AITD Events Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
