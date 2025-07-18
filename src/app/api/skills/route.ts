import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

// Validation schema for skills
const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiencyLevel: z.number().min(1).max(5),
  yearsExperience: z.number().optional(),
  certified: z.boolean().default(false),
  portfolioId: z.string().optional(),
  order: z.number().default(0)
});

const updateSkillSchema = skillSchema.partial().extend({
  id: z.string().min(1, 'Skill ID is required')
});

// GET - Fetch user's skills
export async function GET(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const skillId = url.searchParams.get('id');
    const portfolioId = url.searchParams.get('portfolioId');
    const category = url.searchParams.get('category');

    if (skillId) {
      // Fetch specific skill
      const skill = await prisma.skill.findUnique({
        where: { 
          id: skillId,
          userId: session.user.id 
        }
      });

      if (!skill) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
      }

      return NextResponse.json(skill);
    } else {
      // Fetch all skills for the user with optional filters
      const whereClause: any = { userId: session.user.id };
      if (portfolioId) {
        whereClause.portfolioId = portfolioId;
      }
      if (category) {
        whereClause.category = category;
      }

      const skills = await prisma.skill.findMany({
        where: whereClause,
        orderBy: [
          { category: 'asc' },
          { proficiencyLevel: 'desc' },
          { order: 'asc' }
        ]
      });

      // Group skills by category
      const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      }, {} as Record<string, typeof skills>);

      return NextResponse.json({
        skills,
        groupedSkills,
        categories: Object.keys(groupedSkills)
      });
    }
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new skill
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = skillSchema.parse(body);

    // If portfolioId is provided, verify ownership
    if (validatedData.portfolioId) {
      const portfolio = await prisma.portfolio.findUnique({
        where: { 
          id: validatedData.portfolioId,
          userId: session.user.id 
        }
      });

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }
    }

    const skill = await prisma.skill.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Skill creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update skill
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateSkillSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify ownership
    const existingSkill = await prisma.skill.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(skill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Skill update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete skill
export async function DELETE(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const skillId = url.searchParams.get('id');

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingSkill = await prisma.skill.findUnique({
      where: { id: skillId, userId: session.user.id }
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    await prisma.skill.delete({
      where: { id: skillId }
    });

    return NextResponse.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Skill deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}