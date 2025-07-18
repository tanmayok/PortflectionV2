import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';
import { Portfolio, PortfolioSection } from '@/types/component-system';

// Validation schemas
const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  sections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    componentVariantId: z.string(),
    order: z.number(),
    isVisible: z.boolean(),
    content: z.record(z.any()),
    customStyling: z.record(z.any()).optional(),
    responsiveOverrides: z.record(z.any()).optional()
  })).optional(),
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
        include: {
          viewsLog: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      });

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }

      // Parse JSON fields
      const parsedPortfolio = {
        ...portfolio,
        sections: portfolio.extraData?.sections || [],
        globalSettings: portfolio.extraData?.globalSettings || {
          theme: { colorScheme: 'default', fontPairing: 'inter-system', spacing: 'comfortable' },
          seo: { title: portfolio.name, description: '', keywords: [] },
          domain: { subdomain: portfolio.name.toLowerCase().replace(/\s+/g, '-') },
          analytics: { trackingEnabled: false }
        },
        metadata: {
          views: portfolio.views,
          version: 1,
          backups: []
        }
      };

      return NextResponse.json(parsedPortfolio);
    } else {
      // Fetch all portfolios for the user
      const whereClause: any = { userId: session.user.id };
      if (status) {
        whereClause.extraData = {
          path: ['status'],
          equals: status
        };
      }

      const portfolios = await prisma.portfolio.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              viewsLog: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit ? parseInt(limit) : undefined
      });

      const parsedPortfolios = portfolios.map(portfolio => ({
        id: portfolio.id,
        name: portfolio.name,
        slug: portfolio.name.toLowerCase().replace(/\s+/g, '-'),
        status: portfolio.extraData?.status || 'draft',
        sections: portfolio.extraData?.sections || [],
        globalSettings: portfolio.extraData?.globalSettings || {},
        metadata: {
          views: portfolio.views,
          version: 1,
          backups: []
        },
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
        publishedAt: portfolio.extraData?.publishedAt ? new Date(portfolio.extraData.publishedAt) : null,
        lastSavedAt: portfolio.updatedAt,
        autoSaveEnabled: true
      }));

      return NextResponse.json(parsedPortfolios);
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

    // Check user tier and portfolio limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { portfolio: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Enforce portfolio limits for free users
    if (user.subscriptionTier === 'free' && user._count.portfolio >= 3) {
      return NextResponse.json({ 
        error: 'Portfolio limit reached', 
        details: 'Free users can only create 3 portfolios. Upgrade to Premium for unlimited portfolios.' 
      }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createPortfolioSchema.parse(body);

    // Check if slug is unique for this user
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id,
        extraData: {
          path: ['slug'],
          equals: validatedData.slug
        }
      }
    });

    if (existingPortfolio) {
      return NextResponse.json({ 
        error: 'Slug already exists', 
        details: 'Please choose a different slug' 
      }, { status: 400 });
    }

    // Generate unique portfolio ID and published URL if publishing
    const portfolioId = `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const publishedUrl = validatedData.isPublished 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/${validatedData.slug || portfolioId}`
      : null;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user.id,
        portfolioId,
        name: validatedData.name,
        title: validatedData.globalSettings.seo.title,
        email: session.user.email || '',
        portfolioType: 'developer', // Default type
        isPublished: validatedData.isPublished,
        extraData: {
          slug: validatedData.slug,
          publishedUrl,
          status: validatedData.status,
          version: validatedData.version,
          sections: validatedData.sections || [],
          globalSettings: validatedData.globalSettings,
          metadata: {
            views: 0,
            version: 1,
            backups: []
          },
          autoSaveEnabled: true
        }
      }
    });

    const responsePortfolio: Portfolio = {
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      slug: validatedData.slug,
      status: validatedData.status,
      sections: validatedData.sections || [],
      globalSettings: validatedData.globalSettings,
      metadata: {
        views: 0,
        version: 1,
        backups: []
      },
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
      lastSavedAt: portfolio.updatedAt,
      autoSaveEnabled: true
    };

    return NextResponse.json(responsePortfolio, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

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
    const validatedData = updatePortfolioSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Merge existing extraData with updates
    const currentExtraData = existingPortfolio.extraData as any || {};
    const updatedExtraData = {
      ...currentExtraData,
      ...updateData,
      lastSavedAt: new Date().toISOString()
    };

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        name: updateData.name || existingPortfolio.name,
        title: updateData.globalSettings?.seo?.title || existingPortfolio.title,
        extraData: updatedExtraData,
        updatedAt: new Date()
      }
    });

    const responsePortfolio: Portfolio = {
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      slug: updatedExtraData.slug || portfolio.name.toLowerCase().replace(/\s+/g, '-'),
      status: updatedExtraData.status || 'draft',
      sections: updatedExtraData.sections || [],
      globalSettings: updatedExtraData.globalSettings || {},
      metadata: updatedExtraData.metadata || { views: portfolio.views, version: 1, backups: [] },
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
      publishedAt: updatedExtraData.publishedAt ? new Date(updatedExtraData.publishedAt) : undefined,
      lastSavedAt: new Date(updatedExtraData.lastSavedAt),
      autoSaveEnabled: updatedExtraData.autoSaveEnabled ?? true
    };

    return NextResponse.json(responsePortfolio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

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