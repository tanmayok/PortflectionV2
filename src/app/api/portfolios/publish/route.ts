import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

const publishSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  customSlug: z.string().optional(),
  customDomain: z.string().optional()
});

// POST - Publish portfolio
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId, customSlug, customDomain } = publishSchema.parse(body);

    // Verify ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId: session.user.id }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Generate published URL
    const slug = customSlug || existingPortfolio.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const publishedUrl = customDomain 
      ? `https://${customDomain}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/portfolio/${slug}`;

    // Update portfolio status to published
    const currentExtraData = existingPortfolio.extraData as any || {};
    const updatedExtraData = {
      ...currentExtraData,
      status: 'published',
      publishedUrl,
      publishedAt: new Date().toISOString(),
      globalSettings: {
        ...currentExtraData.globalSettings,
        domain: {
          ...currentExtraData.globalSettings?.domain,
          slug,
          customDomain: customDomain || currentExtraData.globalSettings?.domain?.customDomain
        }
      }
    };

    const portfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isPublished: true,
        publishedUrl,
        extraData: updatedExtraData,
        updatedAt: new Date()
      }
    });


    return NextResponse.json({
      message: 'Portfolio published successfully',
      portfolioUrl: publishedUrl,
      publishedAt: updatedExtraData.publishedAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Portfolio publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Unpublish portfolio
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId } = z.object({
      portfolioId: z.string().min(1, 'Portfolio ID is required')
    }).parse(body);

    // Verify ownership
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId, userId: session.user.id }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Update portfolio status to draft
    const currentExtraData = existingPortfolio.extraData as any || {};
    const updatedExtraData = {
      ...currentExtraData,
      status: 'draft',
      publishedAt: null
    };

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isPublished: false,
        extraData: updatedExtraData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Portfolio unpublished successfully'
    });
  } catch (error) {
    console.error('Portfolio unpublish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}