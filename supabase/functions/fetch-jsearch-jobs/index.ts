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
    
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');

    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured');
    }

    console.log('Fetching jobs from JSearch:', { keywords, location, page });

    // JSearch API endpoint
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.set('query', `${keywords} in ${location}`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('num_pages', '1');
    url.searchParams.set('date_posted', 'all');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('JSearch API error:', response.status, errorText);
      throw new Error(`JSearch API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Retrieved ${data.data?.length || 0} jobs from JSearch`);

    // Transform JSearch response to match our format
    const transformedJobs = (data.data || []).map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name || 'Company not specified',
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : location,
      description: job.job_description,
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      contract_type: job.job_employment_type,
      created: job.job_posted_at_datetime_utc,
      redirect_url: job.job_apply_link,
      category: job.job_category,
      source: 'jsearch',
      employer_logo: job.employer_logo,
      job_highlights: job.job_highlights
    }));

    return new Response(
      JSON.stringify({
        success: true,
        jobs: transformedJobs,
        count: transformedJobs.length,
        page: page
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching JSearch jobs:', error);
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
