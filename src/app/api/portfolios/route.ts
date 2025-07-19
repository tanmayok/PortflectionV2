import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

// Validation schemas
const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  sections: z.array(z.any()).optional(),
  globalSettings: z.object({
    theme: z.object({
      colorScheme: z.string(),
      fontPairing: z.string(),
      spacing: z.string()
    }),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
      ogImage: z.string().optional()
    }),
    domain: z.object({
      subdomain: z.string(),
      customDomain: z.string().optional()
    }),
    analytics: z.object({
      googleAnalytics: z.string().optional(),
      trackingEnabled: z.boolean()
    })
  }),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

const updatePortfolioSchema = createPortfolioSchema.partial().extend({
  id: z.string().min(1, 'Portfolio ID is required')
});

// GET - Fetch user's portfolios
export async function GET(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const portfolioId = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit');

    if (portfolioId) {
      // Fetch specific portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { 
          id: portfolioId,
          userId: session.user.id 
        },
      });

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }

      return NextResponse.json(portfolio);
    } else {
      // Fetch all portfolios for the user
      const whereClause: any = { userId: session.user.id };

      const portfolios = await prisma.portfolio.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        take: limit ? parseInt(limit) : undefined
      });

      return NextResponse.json(portfolios);
    }
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new portfolio
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Create portfolio with auto-generated ID
    const portfolioData = {
      name: body.name || 'Untitled Portfolio',
      title: body.title || 'Portfolio',
      email: body.email || session.user.email || '',
      userId: session.user.id,
      sections: body.sections || [],
      theme: body.theme || {},
      isPublished: false,
      status: 'draft' as const,
      version: 1
    };

    const portfolio = await prisma.portfolio.create({
      data: portfolioData
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {

    console.error('Portfolio creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update portfolio
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete portfolio
export async function DELETE(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const portfolioId = url.searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId: session.user.id }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId }
    });

    return NextResponse.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Portfolio deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}