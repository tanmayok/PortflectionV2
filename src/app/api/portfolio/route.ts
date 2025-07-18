import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

// Validation schemas
const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  title: z.string().min(1, 'Title is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  location: z.string().optional(),
  about: z.string().optional(),
  profileImage: z.string().url().optional(),
  portfolioType: z.string().default('developer'),
  layoutType: z.string().default('classic'),
  theme: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string()
  }).optional(),
  socials: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional()
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

    if (portfolioId) {
      // Fetch specific portfolio with related data
      const portfolio = await prisma.portfolio.findUnique({
        where: { 
          id: portfolioId,
          userId: session.user.id 
        },
        include: {
          projects: {
            orderBy: { order: 'asc' }
          },
          experiences: {
            orderBy: { order: 'asc' }
          },
          skills: {
            orderBy: { order: 'asc' }
          },
          educations: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }

      return NextResponse.json(portfolio);
    } else {
      // Fetch all portfolios for the user
      const portfolios = await prisma.portfolio.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: {
              projects: true,
              experiences: true,
              skills: true,
              educations: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
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
    const validatedData = createPortfolioSchema.parse(body);

    const portfolio = await prisma.portfolio.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        theme: validatedData.theme || {},
        socials: validatedData.socials || {}
      }
    });

    return NextResponse.json(portfolio, { status: 201 });
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

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(portfolio);
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