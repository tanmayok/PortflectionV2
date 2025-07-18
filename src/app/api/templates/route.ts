import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/authenticateUser';
import { z } from 'zod';

// Validation schema for templates
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  preview: z.string().url().optional(),
  config: z.object({
    theme: z.object({
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        background: z.string(),
        surface: z.string(),
        text: z.string()
      }),
      typography: z.object({
        fontFamily: z.string(),
        headingFont: z.string()
      }),
      spacing: z.object({
        scale: z.number()
      })
    }),
    sections: z.array(z.object({
      type: z.string(),
      title: z.string(),
      content: z.record(z.any()),
      isVisible: z.boolean(),
      order: z.number()
    }))
  }),
  isPublic: z.boolean().default(true),
  isPremium: z.boolean().default(false)
});

// GET - Fetch templates
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const isPublic = url.searchParams.get('public') !== 'false';
    const templateId = url.searchParams.get('id');

    if (templateId) {
      // Fetch specific template
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      // Increment downloads count
      await prisma.template.update({
        where: { id: templateId },
        data: { downloads: { increment: 1 } }
      });

      return NextResponse.json(template);
    } else {
      // Fetch all templates with optional filters
      const whereClause: any = {};
      
      if (isPublic) {
        whereClause.isPublic = true;
      }
      
      if (category) {
        whereClause.category = category;
      }

      const templates = await prisma.template.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: [
          { isPremium: 'desc' },
          { downloads: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      // Group templates by category
      const groupedTemplates = templates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      }, {} as Record<string, typeof templates>);

      return NextResponse.json({
        templates,
        groupedTemplates,
        categories: Object.keys(groupedTemplates),
        total: templates.length
      });
    }
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new template (admin/creator only)
export async function POST(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'creator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = templateSchema.parse(body);

    const template = await prisma.template.create({
      data: {
        ...validatedData,
        createdBy: session.user.id
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Template creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update template
export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateUser(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Verify ownership or admin permissions
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (existingTemplate.createdBy !== session.user.id && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const validatedData = templateSchema.partial().parse(updateData);

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}