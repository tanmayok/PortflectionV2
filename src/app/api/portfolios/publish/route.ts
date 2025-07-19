import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';


// POST - Publish portfolio
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId } = body;
    
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

    // Generate published URL
    const slug = existingPortfolio.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const publishedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portfolio/${portfolioId}`;

    const portfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isPublished: true,
        status: 'published',
        publishedUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Portfolio published successfully',
      portfolioUrl: publishedUrl,
      publishedAt: new Date().toISOString()
    });
  } catch (error) {

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

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isPublished: false,
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