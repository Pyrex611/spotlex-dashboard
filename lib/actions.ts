"use server"

import prisma from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(data: { name: string; employees: string[]; equipmentIds: string[] }) {
  await prisma.project.create({
    data: {
      name: data.name,
      employees: { create: data.employees.map(name => ({ name })) },
      equipment: { create: data.equipmentIds.map(id => ({ equipmentId: id })) }
    }
  });
  revalidatePath('/');
  redirect('/');
}

export async function endProject(projectId: string, endedBy: string, returnedEquipmentIds: string[]) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'ENDED', endDate: new Date(), endedBy: endedBy }
  });

  const assignedItems = await prisma.assignedEquipment.findMany({
    where: { projectId, status: 'ASSIGNED' }
  });

  for (const item of assignedItems) {
    const status = returnedEquipmentIds.includes(item.equipmentId) ? 'RETURNED' : 'MISSING';
    await prisma.assignedEquipment.update({
      where: { id: item.id },
      data: { status }
    });
  }

  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/history');
  redirect('/history');
}

export async function addStaffToProject(projectId: string, name: string) {
  await prisma.employee.create({ data: { name, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function addEquipmentToProject(projectId: string, equipmentId: string) {
  await prisma.assignedEquipment.create({ data: { projectId, equipmentId, status: 'ASSIGNED' } });
  revalidatePath(`/projects/${projectId}`);
}

export async function recallStaff(employeeId: string, projectId: string) {
  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: 'RECALLED', recallDate: new Date() }
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function recallEquipment(assignmentId: string, recalledBy: string, projectId: string) {
  await prisma.assignedEquipment.update({
    where: { id: assignmentId },
    data: { status: 'RECALLED', recalledBy, recallDate: new Date() }
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function createEquipment(data: { type: string; name?: string; code?: string; componentCode?: string; equipmentCode?: string; picture?: string }) {
  if (data.type === 'MAIN' && data.code) {
    await prisma.equipment.create({ data: { name: data.name, code: data.code, picture: data.picture } });
  } else if (data.type === 'COMPONENT' && data.componentCode && data.equipmentCode) {
    await prisma.equipmentComponent.create({ data: { componentCode: data.componentCode, equipmentCode: data.equipmentCode, picture: data.picture } });
  }
  revalidatePath('/equipments');
  redirect('/equipments');
}

export async function updateEquipment(id: string, data: { type?: string; name?: string; code?: string; componentCode?: string; equipmentCode?: string; picture?: string }) {
  if (data.type === 'MAIN' || data.code) {
    await prisma.equipment.update({ where: { id }, data: { name: data.name, code: data.code, picture: data.picture } });
  } else if (data.componentCode) {
    await prisma.equipmentComponent.update({ where: { id }, data: { componentCode: data.componentCode, equipmentCode: data.equipmentCode, picture: data.picture } });
  }
  revalidatePath('/equipments');
}

export async function searchEquipment(query: string) {
  if (!query) return [];
  return await prisma.equipment.findMany({ where: { OR:[ { name: { contains: query } }, { code: { contains: query } } ] }, take: 6 });
}

export async function bulkUploadCSV(records: any[]): Promise<{ success: boolean; message: string; }> {
  if (!records || records.length === 0) return { success: false, message: "File is empty." };
  try {
    for (const record of records) {
      if (record.code && record.name) {
        await prisma.equipment.upsert({
          where: { code: String(record.code) },
          update: { name: String(record.name) },
          create: { code: String(record.code), name: String(record.name) }
        });
      } else if (record.componentCode && record.equipmentCode) {
        await prisma.equipmentComponent.upsert({
          where: { componentCode: String(record.componentCode) },
          update: { equipmentCode: String(record.equipmentCode) },
          create: { componentCode: String(record.componentCode), equipmentCode: String(record.equipmentCode) }
        });
      }
    }
    revalidatePath('/equipments');
    return { success: true, message: "Import complete." };
  } catch (e) {
    return { success: false, message: "Import failed." };
  }
}