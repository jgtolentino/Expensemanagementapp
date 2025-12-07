/**
 * Scout Dashboard - RAG Search
 * 
 * POST /scout-rag-search
 * 
 * Body:
 * {
 *   query: string,
 *   limit?: number,
 *   category?: string
 * }
 * 
 * Returns:
 * - Semantically similar knowledge chunks
 * - Uses OpenAI ada-002 embeddings + pgvector
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RAGSearchRequest {
  query: string;
  limit?: number;
  category?: string;
}

interface RAGSearchResponse {
  query: string;
  results_count: number;
  results: Array<{
    chunk_id: string;
    document_id: string;
    document_title: string;
    chunk_text: string;
    similarity: number;
    metadata?: any;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    const tenantId = userData?.tenant_id;
    if (!tenantId) {
      throw new Error('Tenant not found');
    }

    const body: RAGSearchRequest = await req.json();
    const { query, limit = 5, category } = body;

    // 1. Generate embedding for query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // 2. Call scout.search_knowledge function
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'search_knowledge',
      {
        p_tenant_id: tenantId,
        p_query_embedding: queryEmbedding,
        p_limit: limit,
        p_role: null, // TODO: Get from user metadata
        p_category: category || null,
      }
    );

    if (searchError) {
      throw searchError;
    }

    const response: RAGSearchResponse = {
      query,
      results_count: searchResults?.length || 0,
      results: searchResults?.map((result: any) => ({
        chunk_id: result.chunk_id,
        document_id: result.document_id,
        document_title: result.document_title,
        chunk_text: result.chunk_text,
        similarity: parseFloat(result.similarity),
        metadata: result.metadata,
      })) || [],
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-rag-search:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
