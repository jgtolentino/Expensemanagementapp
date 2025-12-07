/**
 * Scout Dashboard - AI Query (Ask Suqi)
 * 
 * POST /scout-ai-query
 * 
 * Body:
 * {
 *   session_id?: string,
 *   message: string
 * }
 * 
 * Returns:
 * - AI assistant response with tool calling
 * - 7 tools available:
 *   1. get_transaction_trends
 *   2. get_product_performance
 *   3. get_consumer_segments
 *   4. get_regional_performance
 *   5. get_basket_analysis
 *   6. get_store_locations
 *   7. search_scout_knowledge
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface AIQueryRequest {
  session_id?: string;
  message: string;
}

interface AIQueryResponse {
  session_id: string;
  message: string;
  sources?: Array<{
    type: string;
    title: string;
    excerpt: string;
  }>;
  tool_calls?: Array<{
    tool: string;
    input: any;
    output: any;
  }>;
  chart?: {
    type: string;
    data: any;
  };
}

// Tool definitions for GPT-4
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_transaction_trends',
      description: 'Get transaction volume, revenue, basket size, or duration trends over time',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            enum: ['volume', 'revenue', 'basket_size', 'duration'],
            description: 'Which metric to analyze',
          },
          date_range: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' },
            },
            required: ['start', 'end'],
          },
          filters: {
            type: 'object',
            properties: {
              categories: { type: 'array', items: { type: 'string' } },
              regions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        required: ['metric', 'date_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_performance',
      description: 'Get product category mix, top SKUs, substitution patterns, or basket composition',
      parameters: {
        type: 'object',
        properties: {
          analysis_type: {
            type: 'string',
            enum: ['category_mix', 'top_skus', 'substitutions', 'basket'],
            description: 'Type of product analysis',
          },
          date_range: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' },
            },
            required: ['start', 'end'],
          },
          limit: { type: 'number', description: 'Number of results to return' },
        },
        required: ['analysis_type', 'date_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_consumer_segments',
      description: 'Get consumer behavior patterns, demographics, and segment analysis',
      parameters: {
        type: 'object',
        properties: {
          analysis_type: {
            type: 'string',
            enum: ['behavior', 'demographics', 'segments'],
          },
          date_range: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' },
            },
            required: ['start', 'end'],
          },
        },
        required: ['analysis_type', 'date_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_regional_performance',
      description: 'Get regional revenue, store distribution, and market penetration',
      parameters: {
        type: 'object',
        properties: {
          date_range: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' },
            },
            required: ['start', 'end'],
          },
          regions: { type: 'array', items: { type: 'string' } },
        },
        required: ['date_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_scout_knowledge',
      description: 'Search the Scout knowledge base for insights, best practices, and case studies',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Natural language search query' },
          limit: { type: 'number', default: 5 },
        },
        required: ['query'],
      },
    },
  },
];

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

    const body: AIQueryRequest = await req.json();
    const { session_id, message } = body;

    // 1. Get or create conversation
    let conversationId = session_id;

    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          tenant_id: tenantId,
          user_id: user.id,
          title: message.substring(0, 100),
        })
        .select()
        .single();

      if (convError) throw convError;
      conversationId = newConversation.id;
    }

    // 2. Save user message
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });

    // 3. Get conversation history
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const messages = [
      {
        role: 'system',
        content: `You are Suqi, an AI assistant for the Scout Dashboard retail analytics platform.

You help users analyze Philippine sari-sari store data across:
- Transaction trends (volume, revenue, basket size, duration)
- Product performance (categories, brands, substitutions)
- Consumer behavior (request types, suggestions, demographics)
- Geographic intelligence (regional performance, store distribution)

You have access to 7 tools to query the Scout database. Use them to answer questions with data-backed insights.

Guidelines:
- Be conversational and helpful
- Use data to support your answers
- Suggest visualizations when appropriate
- Focus on actionable insights for store owners
- Use Philippine context (regions, brands, categories)`,
      },
      ...(history || []).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    // 4. Call GPT-4 with tools
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`OpenAI API error: ${gptResponse.statusText}`);
    }

    const gptData = await gptResponse.json();
    const assistantMessage = gptData.choices[0].message;

    // 5. Handle tool calls
    const toolCalls: Array<any> = [];

    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let toolResult: any = null;

        // Execute tool based on name
        switch (functionName) {
          case 'get_transaction_trends':
            // Call scout-transaction-trends function
            toolResult = await executeScoutFunction(supabase, 'scout-transaction-trends', {
              tab: functionArgs.metric,
              filters: {
                dateRange: functionArgs.date_range,
                ...functionArgs.filters,
              },
            });
            break;

          case 'get_product_performance':
            // Call scout-product-analytics function
            toolResult = await executeScoutFunction(supabase, 'scout-product-analytics', {
              tab: functionArgs.analysis_type,
              filters: {
                dateRange: functionArgs.date_range,
              },
            });
            break;

          case 'get_consumer_segments':
            // Call scout-consumer-analytics function
            toolResult = await executeScoutFunction(supabase, 'scout-consumer-analytics', {
              tab: functionArgs.analysis_type === 'demographics' || functionArgs.analysis_type === 'segments' ? 'profiling' : 'behavior',
              filters: {
                dateRange: functionArgs.date_range,
              },
            });
            break;

          case 'get_regional_performance':
            // Call scout-geo-intelligence function
            toolResult = await executeScoutFunction(supabase, 'scout-geo-intelligence', {
              tab: 'regional',
              filters: {
                dateRange: functionArgs.date_range,
                regions: functionArgs.regions,
              },
            });
            break;

          case 'search_scout_knowledge':
            // Call scout-rag-search function
            toolResult = await executeScoutFunction(supabase, 'scout-rag-search', functionArgs);
            break;
        }

        toolCalls.push({
          tool: functionName,
          input: functionArgs,
          output: toolResult,
        });
      }

      // 6. Call GPT-4 again with tool results
      messages.push(assistantMessage);
      for (const toolCall of toolCalls) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.tool,
          content: JSON.stringify(toolCall.output),
        });
      }

      const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
        }),
      });

      const finalData = await finalResponse.json();
      assistantMessage.content = finalData.choices[0].message.content;
    }

    // 7. Save assistant message
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage.content,
      tool_calls: toolCalls.length > 0 ? toolCalls : null,
    });

    const response: AIQueryResponse = {
      session_id: conversationId!,
      message: assistantMessage.content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in scout-ai-query:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Execute a Scout Edge Function via Supabase Functions API
 */
async function executeScoutFunction(supabase: any, functionName: string, payload: any): Promise<any> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    console.error(`Error calling ${functionName}:`, error);
    return { error: error.message };
  }

  return data;
}
