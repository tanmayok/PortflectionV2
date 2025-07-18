import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

const updateTierSchema = z.object({
  subscriptionTier: z.enum(['free', 'premium'])
});

// GET - Get user tier and portfolio count
export async function GET(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: { portfolio: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      subscriptionTier: user.subscriptionTier,
      portfolioCount: user._count.portfolio,
      canCreateMore: user.subscriptionTier === 'premium' || user._count.portfolio < 3
    });
  } catch (error) {
    console.error('User tier fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user tier
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionTier } = updateTierSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionTier }
    });

    return NextResponse.json({
      message: 'Subscription tier updated successfully',
      subscriptionTier: user.subscriptionTier
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('User tier update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}