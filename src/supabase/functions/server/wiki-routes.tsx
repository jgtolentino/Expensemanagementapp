import { Hono } from "npm:hono";

// Note: In a real implementation, you would import from your database
// For now, we'll use the data layer directly
// In production, this data would be stored in Supabase KV or Postgres

const app = new Hono();

// Mock data structure (in production, this would be in your database)
const mockSpaces = [
  {
    id: 'SPC-001',
    key: 'product-docs',
    name: 'Product Documentation',
    description: 'Complete product documentation and user guides',
    iconEmoji: '📚',
    color: '#0891B2',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2025-01-08T14:30:00Z',
    createdBy: 'CKVC',
    pageCount: 24,
    memberCount: 15,
  },
  {
    id: 'SPC-002',
    key: 'engineering',
    name: 'Engineering Wiki',
    description: 'Technical documentation, API references, and architecture guides',
    iconEmoji: '⚙️',
    color: '#059669',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2025-01-09T11:20:00Z',
    createdBy: 'JAP',
    pageCount: 42,
    memberCount: 12,
  },
];

// GET /spaces - List all spaces
app.get("/spaces", (c) => {
  try {
    return c.json({
      success: true,
      data: mockSpaces,
      meta: {
        total: mockSpaces.length,
      },
    });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch spaces",
        message: String(error),
      },
      500
    );
  }
});

// GET /spaces/:key - Get space by key
app.get("/spaces/:key", (c) => {
  try {
    const key = c.req.param("key");
    const space = mockSpaces.find((s) => s.key === key);

    if (!space) {
      return c.json(
        {
          success: false,
          error: "Space not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: space,
    });
  } catch (error) {
    console.error("Error fetching space:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch space",
        message: String(error),
      },
      500
    );
  }
});

// GET /tree?spaceKey=... - Get page tree for a space
app.get("/tree", (c) => {
  try {
    const spaceKey = c.req.query("spaceKey");

    if (!spaceKey) {
      return c.json(
        {
          success: false,
          error: "spaceKey query parameter required",
        },
        400
      );
    }

    const space = mockSpaces.find((s) => s.key === spaceKey);
    if (!space) {
      return c.json(
        {
          success: false,
          error: "Space not found",
        },
        404
      );
    }

    // In production, this would build a tree from the database
    // For now, return a simple mock tree
    const mockTree = [
      {
        id: 'PAGE-001',
        title: 'Getting Started',
        slug: 'getting-started',
        children: [
          {
            id: 'PAGE-002',
            title: 'User Guide',
            slug: 'user-guide',
            children: [],
          },
        ],
      },
      {
        id: 'PAGE-003',
        title: 'FAQ',
        slug: 'faq',
        children: [],
      },
    ];

    return c.json({
      success: true,
      data: mockTree,
      meta: {
        spaceKey,
        total: 3,
      },
    });
  } catch (error) {
    console.error("Error fetching page tree:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch page tree",
        message: String(error),
      },
      500
    );
  }
});

// GET /page?spaceKey=...&slug=... - Get page content
app.get("/page", (c) => {
  try {
    const spaceKey = c.req.query("spaceKey");
    const slug = c.req.query("slug");

    if (!spaceKey || !slug) {
      return c.json(
        {
          success: false,
          error: "spaceKey and slug query parameters required",
        },
        400
      );
    }

    // Mock page data
    const mockPage = {
      id: 'PAGE-001',
      spaceId: 'SPC-001',
      slug,
      title: 'Getting Started',
      contentMarkdown: `# Getting Started\n\nWelcome to the TBWA Agency Databank!`,
      excerpt: 'Welcome guide for new users',
      status: 'published',
      tags: ['TAG-001'],
      createdBy: 'CKVC',
      updatedBy: 'CKVC',
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2025-01-09T10:00:00Z',
      viewCount: 245,
      starred: true,
    };

    return c.json({
      success: true,
      data: mockPage,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch page",
        message: String(error),
      },
      500
    );
  }
});

// GET /search?q=... - Search pages
app.get("/search", (c) => {
  try {
    const query = c.req.query("q");

    if (!query || query.trim() === "") {
      return c.json({
        success: true,
        data: [],
        meta: {
          query: "",
          total: 0,
        },
      });
    }

    // Mock search results
    const mockResults = [
      {
        id: 'PAGE-001',
        spaceId: 'SPC-001',
        spaceKey: 'product-docs',
        spaceName: 'Product Documentation',
        slug: 'getting-started',
        title: 'Getting Started',
        excerpt: 'Welcome guide for new users of the TBWA Agency Databank platform',
        status: 'published',
        updatedAt: '2025-01-09T10:00:00Z',
        relevance: 0.95,
      },
    ];

    return c.json({
      success: true,
      data: mockResults,
      meta: {
        query,
        total: mockResults.length,
      },
    });
  } catch (error) {
    console.error("Error searching pages:", error);
    return c.json(
      {
        success: false,
        error: "Failed to search pages",
        message: String(error),
      },
      500
    );
  }
});

// POST /page - Create or update page (optional for now)
app.post("/page", async (c) => {
  try {
    const body = await c.req.json();

    // Validate required fields
    if (!body.spaceId || !body.title || !body.slug) {
      return c.json(
        {
          success: false,
          error: "spaceId, title, and slug are required",
        },
        400
      );
    }

    // In production, save to database
    // For now, return success
    const newPage = {
      id: `PAGE-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      data: newPage,
    }, 201);
  } catch (error) {
    console.error("Error creating page:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create page",
        message: String(error),
      },
      500
    );
  }
});

// POST /ai-answer - Stub for AI assistant
app.post("/ai-answer", async (c) => {
  try {
    const body = await c.req.json();
    const { question, pageId } = body;

    if (!question) {
      return c.json(
        {
          success: false,
          error: "question is required",
        },
        400
      );
    }

    // Stub response - in production, this would call an LLM
    const stubAnswer = `This is a placeholder AI response. In production, this would analyze the page content and provide an intelligent answer to: "${question}"`;

    return c.json({
      success: true,
      data: {
        question,
        answer: stubAnswer,
        pageId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in AI answer:", error);
    return c.json(
      {
        success: false,
        error: "Failed to generate AI answer",
        message: String(error),
      },
      500
    );
  }
});

export default app;
