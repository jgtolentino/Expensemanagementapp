/**
 * Finance PPM - AI Assistant Query Edge Function
 * 
 * Purpose: AI assistant with RAG and tool calling for Finance PPM
 * Method: POST
 * Auth: Required (JWT)
 * 
 * Body:
 * - session_id: uuid (optional - creates new session if not provided)
 * - message: string (required - user's message)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

/**
 * Generate embedding using OpenAI
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

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Call OpenAI GPT-4 with RAG context
 */
async function callGPT4(messages: any[], tools?: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages,
      tools: tools || undefined,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Available tools for AI assistant
 */
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_project_profitability',
      description: 'Get profitability metrics for a specific project',
      parameters: {
        type: 'object',
        properties: {
          project_code: {
            type: 'string',
            description: 'The project code (e.g., ENG-TBWA-SMP-0001-P1)',
          },
        },
        required: ['project_code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_wip_summary',
      description: 'Get work-in-progress summary for all projects or a specific client',
      parameters: {
        type: 'object',
        properties: {
          client_name: {
            type: 'string',
            description: 'Filter by client name (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ar_aging',
      description: 'Get accounts receivable aging report',
      parameters: {
        type: 'object',
        properties: {
          age_bucket: {
            type: 'string',
            enum: ['current', '1-30', '31-60', '61-90', '90+'],
            description: 'Filter by age bucket (optional)',
          },
        },
      },
    },
  },
];

/**
 * Execute tool calls
 */
async function executeTool(supabase: any, toolName: string, params: any, tenantId: string) {
  switch (toolName) {
    case 'get_project_profitability': {
      const { data, error } = await supabase
        .from('analytics.v_project_profitability')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('project_code', params.project_code)
        .single();
      
      if (error) return { error: 'Project not found' };
      return data;
    }

    case 'get_wip_summary': {
      let query = supabase
        .from('analytics.v_wip_summary')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (params.client_name) {
        query = query.eq('client_name', params.client_name);
      }

      const { data, error } = await query;
      if (error) return { error: error.message };
      return data;
    }

    case 'get_ar_aging': {
      let query = supabase
        .from('analytics.v_ar_aging')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (params.age_bucket) {
        query = query.eq('age_bucket', params.age_bucket);
      }

      const { data, error } = await query;
      if (error) return { error: error.message };
      return data;
    }

    default:
      return { error: 'Unknown tool' };
  }
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
    let { session_id, message } = body;

    if (!message) {
      throw new Error('message is required');
    }

    // Create or get session
    if (!session_id) {
      const { data: newSession, error: sessionError } = await supabase
        .from('finance_ppm.ai_sessions')
        .insert({
          tenant_id: userData.tenant_id,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      session_id = newSession.id;
    }

    // Save user message
    await supabase.from('finance_ppm.ai_messages').insert({
      session_id,
      role: 'user',
      content: message,
    });

    // Get conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('finance_ppm.ai_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Generate embedding and search knowledge base
    const embedding = await generateEmbedding(message);
    const { data: knowledgeResults } = await supabase
      .rpc('finance_ppm.search_knowledge', {
        p_tenant_id: userData.tenant_id,
        p_query_embedding: `[${embedding.join(',')}]`,
        p_limit: 3,
        p_role: userData.role,
        p_category: null,
      });

    // Build context from knowledge base
    const context = (knowledgeResults || [])
      .map((r: any) => `[${r.document_title}]\n${r.chunk_text}`)
      .join('\n\n---\n\n');

    // Build GPT-4 messages
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI assistant for a Finance PPM (Project & Portfolio Management) system used by accounting firms. You have access to:
1. Knowledge base documents (SOPs, procedures, policies)
2. Real-time project data (profitability, WIP, AR aging)

The user is a ${userData.role} at their firm. Provide accurate, helpful responses based on the knowledge base and available tools.

Current knowledge context:
${context || 'No relevant documents found.'}`,
    };

    const messages = [
      systemMessage,
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
    ];

    // Call GPT-4 with tools
    let gptResponse = await callGPT4(messages, TOOLS);
    let assistantMessage = gptResponse.choices[0].message;
    let toolCalls: any[] = [];

    // Handle tool calls
    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolParams = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${toolName}`, toolParams);
        const toolResult = await executeTool(supabase, toolName, toolParams, userData.tenant_id);
        
        toolCalls.push({
          tool: toolName,
          params: toolParams,
          result: toolResult,
        });

        // Add tool result to conversation
        messages.push(assistantMessage);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Get final response with tool results
      gptResponse = await callGPT4(messages);
      assistantMessage = gptResponse.choices[0].message;
    }

    // Extract sources from knowledge search
    const sources = (knowledgeResults || []).map((r: any) => ({
      type: 'document',
      id: r.document_id,
      title: r.document_title,
      excerpt: r.chunk_text.substring(0, 200) + '...',
    }));

    // Save assistant message
    await supabase.from('finance_ppm.ai_messages').insert({
      session_id,
      role: 'assistant',
      content: assistantMessage.content,
      sources: sources.length > 0 ? sources : null,
      tool_calls: toolCalls.length > 0 ? toolCalls : null,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          session_id,
          message: assistantMessage.content,
          sources,
          tool_calls: toolCalls,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('AI query error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
