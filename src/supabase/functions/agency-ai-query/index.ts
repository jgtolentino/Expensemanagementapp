/**
 * Agency Creative Workroom - AI Assistant Query Edge Function
 * 
 * Purpose: AI assistant with RAG and tool calling for Agency Workroom
 * Method: POST
 * Auth: Required (JWT)
 * 
 * Reused from: finance-ppm-ai-query (same orchestration, different tools/domain)
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
 * Available tools for AI assistant (Agency-specific)
 */
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_campaign_status',
      description: 'Get status and metrics for a specific campaign',
      parameters: {
        type: 'object',
        properties: {
          campaign_code: {
            type: 'string',
            description: 'The campaign code (e.g., SMI-001)',
          },
        },
        required: ['campaign_code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_team_utilization',
      description: 'Get team utilization and capacity data',
      parameters: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            description: 'Filter by specific role (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_artifacts',
      description: 'Search for creative artifacts by keyword or type',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'Search keyword',
          },
          artifact_type: {
            type: 'string',
            description: 'Filter by artifact type (creative_brief, script, storyboard, etc.)',
          },
        },
        required: ['keyword'],
      },
    },
  },
];

/**
 * Execute tool calls (Agency-specific)
 */
async function executeTool(supabase: any, toolName: string, params: any, tenantId: string) {
  switch (toolName) {
    case 'get_campaign_status': {
      const { data, error } = await supabase
        .from('agency.v_campaign_overview')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('campaign_code', params.campaign_code)
        .single();
      
      if (error) return { error: 'Campaign not found' };
      return data;
    }

    case 'get_team_utilization': {
      let query = supabase
        .from('agency.v_employee_utilization')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('week_start_date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
      
      if (params.role) {
        query = query.eq('role', params.role);
      }

      const { data, error } = await query.limit(50);
      if (error) return { error: error.message };
      
      // Aggregate by employee
      const byEmployee: any = {};
      data?.forEach((row: any) => {
        if (!byEmployee[row.employee_name]) {
          byEmployee[row.employee_name] = {
            name: row.employee_name,
            role: row.role,
            total_hours: 0,
            billable_hours: 0,
          };
        }
        byEmployee[row.employee_name].total_hours += row.total_hours || 0;
        byEmployee[row.employee_name].billable_hours += row.billable_hours || 0;
      });

      return Object.values(byEmployee).map((emp: any) => ({
        ...emp,
        utilization_pct: emp.total_hours > 0 ? (emp.billable_hours / emp.total_hours) * 100 : 0,
      }));
    }

    case 'search_artifacts': {
      let query = supabase
        .from('agency.artifacts')
        .select(`
          id,
          title,
          artifact_type,
          status,
          created_at,
          campaign:agency.campaigns(campaign_name, client_name)
        `)
        .eq('tenant_id', tenantId)
        .ilike('title', `%${params.keyword}%`);
      
      if (params.artifact_type) {
        query = query.eq('artifact_type', params.artifact_type);
      }

      const { data, error } = await query.limit(20);
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
        .from('agency.ai_conversations')
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
    await supabase.from('agency.ai_messages').insert({
      conversation_id: session_id,
      role: 'user',
      content: message,
    });

    // Get conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('agency.ai_messages')
      .select('role, content')
      .eq('conversation_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Generate embedding and search knowledge base
    const embedding = await generateEmbedding(message);
    const { data: knowledgeResults } = await supabase
      .rpc('agency.search_knowledge', {
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

    // Build GPT-4 messages with creative persona
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI assistant for an Agency Creative Workroom used by marketing agencies. You have access to:
1. Knowledge base documents (creative guides, templates, case studies, best practices)
2. Real-time campaign data (status, budgets, timelines, team utilization)

The user is a ${userData.role} at their agency. Provide accurate, helpful responses with a creative and strategic mindset.

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
    await supabase.from('agency.ai_messages').insert({
      conversation_id: session_id,
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
