import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const main = await prisma.equipment.findMany();
  const comps = await prisma.equipmentComponent.findMany();
  // Sort or mix them for the unified list view
  const combined =[...main.map(m => ({...m, type: 'MAIN'})), ...comps.map(c => ({...c, type: 'COMPONENT'}))];
  return NextResponse.json(combined);
}