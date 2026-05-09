import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { format, isAfter } from 'date-fns';
import { User, Wrench, ArrowLeft } from 'lucide-react';

export default async function HistoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!project) return null;

  return (
    <div className="animate-in max-w-4xl mx-auto">
      <Link href="/history" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-6"><ArrowLeft size={16} /> Back to Archive</Link>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div><p className="text-slate-400 font-bold uppercase">Commenced</p><p className="font-semibold">{format(new Date(project.start_date), 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 font-bold uppercase">Closed</p><p className="font-semibold">{format(new Date(project.end_date), 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 font-bold uppercase">Supervisor</p><p className="font-semibold">{project.ended_by}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-emerald-600"/> Personnel Timeline</h3>
            <ul className="space-y-3">
              {project.employees.map((emp: any) => {
                 const isLate = isAfter(new Date(emp.join_date), new Date(project.start_date));
                 return (
                   <li key={emp.id} className="p-3 border rounded-xl bg-slate-50 flex flex-col gap-1">
                     <div className="flex justify-between items-center">
                       <span className="font-bold text-slate-700 text-sm">{emp.name}</span>
                       {emp.status === 'RECALLED' ? <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded font-black">RECALLED</span> : isLate ? <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-black">JOINED LATE</span> : <span className="text-[9px] text-slate-400 font-bold">ORIGINAL</span>}
                     </div>
                     <p className="text-[10px] text-slate-400 italic">Joined: {format(new Date(emp.join_date), 'MMM dd, HH:mm')}{emp.recall_date && ` | Recalled: ${format(new Date(emp.recall_date), 'MMM dd')}`}</p>
                   </li>
                 );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={16} className="text-emerald-600"/> Equipment Manifest</h3>
            <ul className="space-y-3">
              {project.assigned_equipment.map((ae: any) => (
                <li key={ae.id} className="p-3 border rounded-xl bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="font-bold text-slate-700 text-sm">{ae.equipment.name}</p><p className="text-[10px] font-mono text-slate-400">{ae.equipment.code}</p></div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${ae.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' : ae.status === 'RECALLED' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{ae.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t pt-2 mt-1">
                    {ae.status === 'RECALLED' ? `Recalled by ${ae.recalled_by} on ${format(new Date(ae.recall_date), 'MMM dd')}` : `Assigned: ${format(new Date(ae.assign_date), 'MMM dd')}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}