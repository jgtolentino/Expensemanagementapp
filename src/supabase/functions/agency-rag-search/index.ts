/**
 * Agency Creative Workroom - RAG Vector Search Edge Function
 * 
 * Purpose: Search knowledge base using vector similarity (pgvector)
 * Method: POST
 * Auth: Required (JWT)
 * 
 * Reused from: finance-ppm-rag-search (identical pattern, different schema)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

/**
 * Generate embedding using OpenAI ada-002
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user metadata
    const { data: userData, error: userError } = await supabase
      .from('core.users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Parse request body
    const body = await req.json();
    const { query, limit = 5, category } = body;

    if (!query) {
      throw new Error('query is required');
    }

    // Generate embedding for query
    console.log('Generating embedding for query:', query);
    const queryEmbedding = await generateEmbedding(query);

    // Vector similarity search using pgvector
    // Use the search_knowledge function from agency schema
    const { data: results, error: searchError } = await supabase
      .rpc('agency.search_knowledge', {
        p_tenant_id: userData.tenant_id,
        p_query_embedding: `[${queryEmbedding.join(',')}]`,
        p_limit: limit,
        p_role: userData.role,
        p_category: category || null,
      });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    // Format results
    const formattedResults = (results || []).map((r: any) => ({
      chunk_id: r.chunk_id,
      document_id: r.document_id,
      document_title: r.document_title,
      chunk_text: r.chunk_text,
      similarity: parseFloat(r.similarity),
      metadata: r.metadata,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          query,
          results_count: formattedResults.length,
          results: formattedResults,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('RAG search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
