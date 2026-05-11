import { createServer } from '@/lib/supabase/server';
import ProjectClient from './ProjectClient';
import { Info } from 'lucide-react';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // NEXT.JS 15 FIX: params is a Promise
  const resolvedParams = await params;
  const supabase = await createServer();
  
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      employees(*),
      assigned_equipment(*, equipment:equipments(*))
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !project) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 mt-10 max-w-lg mx-auto animate-in">
        <Info size={32} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">Deployment Missing</h2>
        <p className="text-slate-500 text-sm mt-1">This project could not be found in the cloud database.</p>
      </div>
    );
  }

  // Map database snake_case to frontend camelCase for the interactive Client Component
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