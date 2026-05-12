"use server"

import { createServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uploadImage(file: File, folder: string) {
  const supabase = await createServer();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('equipments')
    .upload(filePath, file);

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data } = supabase.storage
    .from('equipments')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ... Project & Staff actions remain exactly the same ...
export async function createProject(data: { name: string; employees: string[]; equipmentIds: string[] }) {
  const supabase = await createServer();
  const { data: project, error: pError } = await supabase.from('projects').insert([{ name: data.name, status: 'ONGOING' }]).select().single();
  if (pError) throw new Error(`Project creation failed: ${pError.message}`);
  if (data.employees.length > 0) { await supabase.from('employees').insert(data.employees.map(name => ({ name, project_id: project.id, status: 'ASSIGNED' }))); }
  if (data.equipmentIds.length > 0) { await supabase.from('assigned_equipment').insert(data.equipmentIds.map(id => ({ equipment_id: id, project_id: project.id, status: 'ASSIGNED' }))); }
  revalidatePath('/');
  redirect('/');
}

export async function endProject(projectId: string, endedBy: string, returnedEquipmentIds: string[]) {
  const supabase = await createServer();
  const { error: pError } = await supabase.from('projects').update({ status: 'ENDED', end_date: new Date().toISOString(), ended_by: endedBy }).eq('id', projectId);
  if (pError) throw pError;
  const { data: assignedItems } = await supabase.from('assigned_equipment').select('id, equipment_id').eq('project_id', projectId).eq('status', 'ASSIGNED');
  if (assignedItems) {
    for (const item of assignedItems) {
      const status = returnedEquipmentIds.includes(item.equipment_id) ? 'RETURNED' : 'MISSING';
      await supabase.from('assigned_equipment').update({ status }).eq('id', item.id);
    }
  }
  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/history');
  redirect('/history');
}

export async function addStaffToProject(projectId: string, name: string) {
  const supabase = await createServer();
  await supabase.from('employees').insert([{ name, project_id: projectId, status: 'ASSIGNED', join_date: new Date().toISOString() }]);
  revalidatePath(`/projects/${projectId}`);
}

export async function recallStaff(employeeId: string, projectId: string) {
  const supabase = await createServer();
  await supabase.from('employees').update({ status: 'RECALLED', recall_date: new Date().toISOString() }).eq('id', employeeId);
  revalidatePath(`/projects/${projectId}`);
}

export async function addEquipmentToProject(projectId: string, equipmentId: string) {
  const supabase = await createServer();
  await supabase.from('assigned_equipment').insert([{ project_id: projectId, equipment_id: equipmentId, status: 'ASSIGNED', assign_date: new Date().toISOString() }]);
  revalidatePath(`/projects/${projectId}`);
}

export async function recallEquipment(assignmentId: string, recalledBy: string, projectId: string) {
  const supabase = await createServer();
  await supabase.from('assigned_equipment').update({ status: 'RECALLED', recalled_by: recalledBy, recall_date: new Date().toISOString() }).eq('id', assignmentId);
  revalidatePath(`/projects/${projectId}`);
}

/**
 * REGISTRY MANAGEMENT
 */

// THE FIX: Return an object instead of throwing a Next.js redirect
export async function createEquipment(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServer();
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const componentCode = formData.get('componentCode') as string;
    const equipmentCode = formData.get('equipmentCode') as string;
    const imageFile = formData.get('picture') as File;

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, type === 'MAIN' ? 'main' : 'components');
    }

    if (type === 'MAIN' && code) {
      const { error } = await supabase.from('equipments').insert([{ name, code, picture: imageUrl }]);
      if (error) throw error;
    } else if (type === 'COMPONENT' && componentCode && equipmentCode) {
      const { error } = await supabase.from('equipment_components').insert([{
        component_code: componentCode,
        equipment_code: equipmentCode,
        picture: imageUrl
      }]);
      if (error) throw error;
    }

    revalidatePath('/equipments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEquipment(id: string, formData: FormData) {
  const supabase = await createServer();
  const type = formData.get('type') as string;
  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const componentCode = formData.get('componentCode') as string;
  const equipmentCode = formData.get('equipmentCode') as string;
  const imageFile = formData.get('picture') as File;

  let updateData: any = {};
  if (imageFile && imageFile.size > 0) {
    updateData.picture = await uploadImage(imageFile, type === 'MAIN' ? 'main' : 'components');
  }

  if (type === 'MAIN') {
    updateData = { ...updateData, name, code };
    await supabase.from('equipments').update(updateData).eq('id', id);
  } else {
    updateData = { ...updateData, component_code: componentCode, equipment_code: equipmentCode };
    await supabase.from('equipment_components').update(updateData).eq('id', id);
  }

  revalidatePath('/equipments');
  revalidatePath(`/equipments/${id}`);
}

export async function searchEquipment(query: string) {
  const supabase = await createServer();
  if (!query) return[];
  const { data } = await supabase
    .from('equipments')
    .select('*')
    .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    .limit(6);
  return data ||[];
}

export async function bulkUploadCSV(records: any[]): Promise<{ success: boolean; message: string; }> {
  const supabase = await createServer();
  if (!records || records.length === 0) return { success: false, message: "The file is empty." };

  try {
    for (const record of records) {
      const type = String(record.type || '').toUpperCase();
      
      if (type === 'MAIN' || (record.code && record.name)) {
        await supabase.from('equipments').upsert({ code: String(record.code), name: String(record.name || '') }, { onConflict: 'code' });
      } 
      else if (type === 'COMPONENT' || (record.componentCode && record.equipmentCode)) {
        await supabase.from('equipment_components').upsert({ component_code: String(record.componentCode), equipment_code: String(record.equipmentCode) }, { onConflict: 'component_code' });
      }
    }
    revalidatePath('/equipments');
    return { success: true, message: "Import successful." };
  } catch (error: any) {
    return { success: false, message: `Import failed: ${error.message}` };
  }
}