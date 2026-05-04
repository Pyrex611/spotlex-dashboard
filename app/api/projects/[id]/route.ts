import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  // Await the params promise strictly for Next.js 15
  const resolvedParams = await context.params;
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: { employees: true, equipment: { include: { equipment: true } } }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}