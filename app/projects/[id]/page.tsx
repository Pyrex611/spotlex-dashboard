import { supabase } from '@/lib/supabase';
import ProjectClient from './ProjectClient';
import { Info } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      employees(*),
      assigned_equipment(*, equipment:equipments(*))
    `)
    .eq('id', id)
    .single();

  if (!project) {
    return (
      <div className="p-12 text-center text-red-600 bg-white rounded-2xl border border-slate-200 mt-10 max-w-lg mx-auto">
        <Info size={32} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Project Missing</h2>
        <p className="text-slate-500 text-sm mt-1">This project could not be found.</p>
      </div>
    );
  }

  // Map snake_case to frontend camelCase
  const formattedProject = {
    ...project,
    startDate: project.start_date,
    endDate: project.end_date,
    endedBy: project.ended_by,
    employees: project.employees,
    equipment: project.assigned_equipment.map((ae: any) => ({
      ...ae,
      equipment: ae.equipment,
      assignDate: ae.assign_date,
      recalledBy: ae.recalled_by,
      recallDate: ae.recall_date
    }))
  };

  return <ProjectClient project={formattedProject} />;
}