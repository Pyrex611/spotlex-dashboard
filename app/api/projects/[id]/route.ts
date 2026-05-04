import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise (Next.js 15 requirement)
  const resolvedParams = await params;
  
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
    include: { employees: true, equipment: { include: { equipment: true } } }
  });
  
  return NextResponse.json(project);
}