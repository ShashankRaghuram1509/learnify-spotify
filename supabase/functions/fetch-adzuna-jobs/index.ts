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
    const { keywords, location = "India", results_per_page = 10, page = 1 } = await req.json();
    
    const appId = Deno.env.get('ADZUNA_APP_ID');
    const apiKey = Deno.env.get('ADZUNA_API_KEY');

    if (!appId || !apiKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    console.log('Fetching jobs from Adzuna:', { keywords, location, page });

    // Adzuna API endpoint for India
    const country = 'in';
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', apiKey);
    url.searchParams.set('results_per_page', results_per_page.toString());
    url.searchParams.set('content-type', 'application/json');
    
    if (keywords) {
      url.searchParams.set('what', keywords);
    }
    if (location) {
      url.searchParams.set('where', location);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Adzuna API error:', response.status, errorText);
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Retrieved ${data.results?.length || 0} jobs from Adzuna`);

    // Transform Adzuna response to match our format
    const transformedJobs = (data.results || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Company not specified',
      location: job.location?.display_name || location,
      description: job.description,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contract_type: job.contract_type,
      created: job.created,
      redirect_url: job.redirect_url,
      category: job.category?.label,
      source: 'adzuna'
    }));

    return new Response(
      JSON.stringify({
        success: true,
        jobs: transformedJobs,
        count: data.count || 0,
        page: page
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching Adzuna jobs:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        jobs: [],
        count: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});