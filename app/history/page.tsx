import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { format, isAfter } from 'date-fns';
import { User, Wrench, Calendar, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = await createServer();

  const { data: pastProjects } = await supabase
    .from('projects')
    .select(`
      *,
      employees(*),
      assigned_equipment(*)
    `)
    .eq('status', 'ENDED')
    .order('end_date', { ascending: false });

  return (
    <div className="animate-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Project Archive</h1>
        <p className="text-slate-500 mt-1 text-sm">Review documentation of all completed deployments.</p>
      </div>

      <div className="space-y-6">
        {pastProjects?.map((proj: any) => (
          <Link href={`/history/${proj.id}`} key={proj.id} className="block group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group-hover:border-slate-300 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">{proj.name} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" /></h2>
                  <p className="text-xs text-slate-500 mt-1">{format(new Date(proj.start_date), 'MMM dd, yyyy')} — {format(new Date(proj.end_date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right"><p className="text-[10px] text-slate-400 font-bold uppercase">Closed By</p><p className="text-sm font-semibold">{proj.ended_by}</p></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t pt-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 flex items-center gap-1.5"><User size={12}/> Staff Summary</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.employees.slice(0, 3).map((emp: any) => {
                      let color = "bg-slate-100 text-slate-600";
                      if (emp.status === 'RECALLED') color = "bg-yellow-100 text-yellow-700";
                      else if (isAfter(new Date(emp.join_date), new Date(proj.start_date))) color = "bg-emerald-100 text-emerald-700";
                      return <span key={emp.id} className={`${color} px-2 py-1 rounded text-[10px] font-bold`}>{emp.name}</span>;
                    })}
                    {proj.employees.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{proj.employees.length - 3} more</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 flex items-center gap-1.5"><Wrench size={12}/> Equipment Summary</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.assigned_equipment.slice(0, 3).map((eq: any) => (
                      <span key={eq.id} className={`px-2 py-1 rounded text-[10px] font-bold ${eq.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{eq.status}</span>
                    ))}
                    {proj.assigned_equipment.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{proj.assigned_equipment.length - 3} more</span>}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}