import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId, starRating, reviewText } = await req.json();
    
    console.log(`Processing review ${reviewId}: ${starRating} stars - "${reviewText}"`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Generate AI response for user
    const userResponsePrompt = `You are a friendly customer service representative. A customer just left a ${starRating}-star review saying: "${reviewText}"

Generate a warm, professional response thanking them for their feedback. If the rating is low (1-2 stars), acknowledge their concerns and express commitment to improvement. If high (4-5 stars), express genuine appreciation. Keep it concise (2-3 sentences).`;

    const userResponseResult = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: userResponsePrompt }],
        max_tokens: 200,
      }),
    });

    const userResponseData = await userResponseResult.json();
    const aiResponse = userResponseData.choices?.[0]?.message?.content || 'Thank you for your feedback!';

    // Generate AI summary for admin
    const summaryPrompt = `Summarize this customer review in one concise sentence (max 20 words):
Rating: ${starRating}/5 stars
Review: "${reviewText}"`;

    const summaryResult = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 100,
      }),
    });

    const summaryData = await summaryResult.json();
    const aiSummary = summaryData.choices?.[0]?.message?.content || 'Customer feedback received.';

    // Generate recommended actions for admin
    const actionsPrompt = `Based on this customer feedback, suggest 1-3 specific actionable recommendations for the business team. Be concise and practical.
Rating: ${starRating}/5 stars
Review: "${reviewText}"

Format as a brief bulleted list.`;

    const actionsResult = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: actionsPrompt }],
        max_tokens: 200,
      }),
    });

    const actionsData = await actionsResult.json();
    const aiRecommendedActions = actionsData.choices?.[0]?.message?.content || 'No specific actions recommended.';

    // Update the review in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        ai_response: aiResponse,
        ai_summary: aiSummary,
        ai_recommended_actions: aiRecommendedActions,
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review:', updateError);
      throw updateError;
    }

    console.log(`Review ${reviewId} processed successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      aiResponse,
      aiSummary,
      aiRecommendedActions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing review:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
