import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

// Validation schema for projects
const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  images: z.array(z.string().url()).optional(),
  liveUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  category: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'planned']).default('completed'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  portfolioId: z.string().optional(),
  order: z.number().default(0)
});

const updateProjectSchema = projectSchema.partial().extend({
  id: z.string().min(1, 'Project ID is required')
});

// GET - Fetch user's projects
export async function GET(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get('id');
    const portfolioId = url.searchParams.get('portfolioId');

    if (projectId) {
      // Fetch specific project
      const project = await prisma.project.findUnique({
        where: { 
          id: projectId,
          userId: session.user.id 
        }
      });

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      return NextResponse.json(project);
    } else {
      // Fetch all projects for the user or specific portfolio
      const whereClause: any = { userId: session.user.id };
      if (portfolioId) {
        whereClause.portfolioId = portfolioId;
      }

      const projects = await prisma.project.findMany({
        where: whereClause,
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    // Convert date strings to Date objects if provided
    const projectData: any = {
      ...validatedData,
      userId: session.user.id,
      images: validatedData.images || []
    };

    if (validatedData.startDate) {
      projectData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      projectData.endDate = new Date(validatedData.endDate);
    }

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

    const project = await prisma.project.create({
      data: projectData
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProjectSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Convert date strings to Date objects if provided
    const projectUpdateData: any = { ...updateData };
    if (updateData.startDate) {
      projectUpdateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      projectUpdateData.endDate = new Date(updateData.endDate);
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...projectUpdateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}