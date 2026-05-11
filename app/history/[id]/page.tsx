import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { format, isAfter } from 'date-fns';
import { User, Wrench, Calendar, Info, ArrowLeft, CheckCircle2, XCircle, UserMinus, Plus } from 'lucide-react';

export default async function HistoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServer();

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
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in">
        <Info size={32} className="text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">Project Not Found</h3>
        <p className="text-slate-500 text-sm">The requested project does not exist in the archive.</p>
        <Link href="/history" className="mt-6 inline-block bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">Back to Archive</Link>
      </div>
    );
  }

  return (
    <div className="animate-in max-w-4xl mx-auto">
      <Link href="/history" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Archive
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div><p className="text-slate-400 uppercase font-bold">Commenced</p><p className="font-semibold text-slate-700">{format(new Date(project.start_date), 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 uppercase font-bold">Closed</p><p className="font-semibold text-slate-700">{format(new Date(project.end_date), 'MMM dd, yyyy')}</p></div>
            <div><p className="text-slate-400 uppercase font-bold">Supervisor</p><p className="font-semibold text-slate-700">{project.ended_by}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-emerald-600"/> Deployed Personnel</h3>
            <ul className="space-y-3">
              {project.employees.map((emp: any) => {
                 const isLate = isAfter(new Date(emp.join_date), new Date(project.start_date));
                 return (
                   <li key={emp.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-1">
                     <div className="flex justify-between items-center">
                       <span className="font-bold text-slate-700 text-sm">{emp.name}</span>
                       {emp.status === 'RECALLED' ? 
                          <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded font-black border border-yellow-200 uppercase">RECALLED</span> 
                          : isLate ? 
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-black border border-emerald-200 uppercase">JOINED LATE</span> 
                          : <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ORIGINAL</span>}
                     </div>
                   </li>
                 );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Wrench size={16} className="text-emerald-600"/> Equipment Manifest</h3>
            <ul className="space-y-3">
              {project.assigned_equipment.map((ae: any) => (
                <li key={ae.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{ae.equipment?.name || 'Unknown'}</p>
                      <p className="text-[10px] font-mono text-slate-400">{ae.equipment?.code || 'N/A'}</p>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${
                        ae.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : ae.status === 'RECALLED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                      : 'bg-red-100 text-red-700 border-red-200'}`}>{ae.status}</span>
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