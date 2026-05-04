"use server"

import prisma from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(data: { name: string; employees: string[]; equipmentIds: string[] }) {
  await prisma.project.create({
    data: {
      name: data.name,
      employees: {
        create: data.employees.map(name => ({ name }))
      },
      equipment: {
        create: data.equipmentIds.map(id => ({ equipmentId: id }))
      }
    }
  });
  revalidatePath('/');
  redirect('/');
}

export async function endProject(projectId: string, endedBy: string, returnedEquipmentIds: string[]) {
  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'ENDED',
      endDate: new Date(),
      endedBy: endedBy,
    }
  });

  const assignments = await prisma.assignedEquipment.findMany({ where: { projectId } });
  
  for (const assignment of assignments) {
    if (returnedEquipmentIds.includes(assignment.equipmentId)) {
      await prisma.assignedEquipment.update({
        where: { id: assignment.id },
        data: { returned: true }
      });
    }
  }
  revalidatePath('/');
  revalidatePath('/history');
  redirect('/history');
}

export async function createEquipment(data: { type: string; name?: string; code?: string; componentCode?: string; equipmentCode?: string; picture?: string }) {
  if (data.type === 'MAIN' && data.code) {
    await prisma.equipment.create({
      data: {
        name: data.name,
        code: data.code,
        picture: data.picture
      }
    });
  } else if (data.type === 'COMPONENT' && data.componentCode && data.equipmentCode) {
    await prisma.equipmentComponent.create({
      data: {
        componentCode: data.componentCode,
        equipmentCode: data.equipmentCode,
        picture: data.picture
      }
    });
  }
  revalidatePath('/equipments');
  redirect('/equipments');
}

export async function updateEquipment(id: string, data: { type?: string; name?: string; code?: string; componentCode?: string; equipmentCode?: string; picture?: string }) {
  if (data.type === 'MAIN' || data.code) {
    await prisma.equipment.update({
      where: { id },
      data: { name: data.name, code: data.code, picture: data.picture }
    });
  } else if (data.componentCode) {
    await prisma.equipmentComponent.update({
      where: { id },
      data: { componentCode: data.componentCode, equipmentCode: data.equipmentCode, picture: data.picture }
    });
  }
  revalidatePath('/equipments');
}

export async function bulkUploadCSV(records: any[]) {
  for (const record of records) {
    if (record.code && (!record.type || String(record.type).toUpperCase() === 'MAIN')) {
      await prisma.equipment.upsert({
        where: { code: String(record.code) },
        update: { name: String(record.name || '') },
        create: { code: String(record.code), name: String(record.name || '') }
      });
    } else if (record.componentCode && String(record.type).toUpperCase() === 'COMPONENT') {
      await prisma.equipmentComponent.upsert({
        where: { componentCode: String(record.componentCode) },
        update: { equipmentCode: String(record.equipmentCode) },
        create: { componentCode: String(record.componentCode), equipmentCode: String(record.equipmentCode) }
      });
    }
  }
  revalidatePath('/equipments');
}

export async function searchEquipment(query: string) {
  if (!query) return[];
  return await prisma.equipment.findMany({
    where: {
      OR:[
        { name: { contains: query } },
        { code: { contains: query } }
      ]
    },
    take: 6
  });
}