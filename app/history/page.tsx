import prisma from '@/lib/db';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, User, Wrench, Calendar, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const pastProjects = await prisma.project.findMany({
    where: { status: 'ENDED' },
    include: { employees: true, equipment: { include: { equipment: true } } },
    orderBy: { endDate: 'desc' }
  });

  return (
    <div className="animate-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Archive</h1>
        <p className="text-slate-500 mt-1 text-sm">Records of all completed deployments.</p>
      </div>

      <div className="space-y-6">
        {pastProjects.map(proj => (
          <div key={proj.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5 mb-6 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{proj.name}</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar size={14}/> {format(proj.startDate, 'MMM dd, yyyy')}
                  <span className="text-slate-300">→</span>
                  <Calendar size={14}/> {proj.endDate ? format(proj.endDate, 'MMM dd, yyyy') : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-left md:text-right min-w-[160px]">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Closed By</p>
                <p className="text-slate-700 font-semibold text-sm flex items-center md:justify-end gap-1.5"><User size={14} className="text-slate-400"/> {proj.endedBy || 'Unknown'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} className="text-emerald-600" />
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Deployed Staff</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {proj.employees.map(emp => (
                    <span key={emp.id} className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200">{emp.name}</span>
                  ))}
                  {proj.employees.length === 0 && <span className="text-xs text-slate-400 italic">No staff recorded</span>}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={14} className="text-emerald-600" />
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Equipment Manifest</h3>
                </div>
                <ul className="space-y-2">
                  {proj.equipment.map(eq => (
                    <li key={eq.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-xs">{eq.equipment.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline-block">{eq.equipment.code}</span>
                      </div>
                      <div className="shrink-0">
                        {eq.returned ? (
                          <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded text-[10px] text-emerald-700 font-bold border border-emerald-100">
                            <CheckCircle2 size={12} /> RETURNED
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded text-[10px] text-red-600 font-bold border border-red-100">
                            <XCircle size={12} /> MISSING
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                  {proj.equipment.length === 0 && <span className="text-xs text-slate-400 italic">No equipment recorded</span>}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {pastProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Info size={32} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Archives Found</h3>
            <p className="text-slate-500 text-sm">Ended projects will be documented here.</p>
          </div>
        )}
      </div>
    </div>
  );
}