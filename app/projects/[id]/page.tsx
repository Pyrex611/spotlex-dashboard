"use client"

import { useEffect, useState, use } from 'react';
import { endProject } from '@/lib/actions';
import { CheckSquare, Square, AlertTriangle, User, Wrench, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const[project, setProject] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const[warningOpen, setWarningOpen] = useState(false);
  const[endedBy, setEndedBy] = useState('');
  const [checkedEq, setCheckedEq] = useState<Record<string, boolean>>({});
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(setProject);
  },[id]);

  if (!project) return <div className="p-12 text-center text-green-700 font-bold text-xl animate-pulse">Loading Project Dashboard...</div>;

  const handleEndInitiate = () => {
    const initialChecks: any = {};
    project.equipment.forEach((e: any) => initialChecks[e.equipment.id] = false);
    setCheckedEq(initialChecks);
    setModalOpen(true);
  };

  const handleEndSubmit = async () => {
    const total = project.equipment.length;
    const checkedCount = Object.values(checkedEq).filter(Boolean).length;

    if (checkedCount < total && !warningOpen) {
      setWarningOpen(true);
      return;
    }
    
    setIsEnding(true);
    const returnedIds = Object.keys(checkedEq).filter(k => checkedEq[k]);
    await endProject(project.id, endedBy, returnedIds);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in">
      <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-green-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-green-950 mb-3">{project.name}</h1>
            <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 border border-green-100 px-3 md:px-4 py-2 md:py-2.5 rounded-xl inline-flex shadow-sm text-sm md:text-base">
              <Calendar size={18} />
              Started {format(new Date(project.startDate), 'MMM dd, yyyy')}
            </div>
          </div>
          <span className={`w-full md:w-auto text-center px-6 py-3 md:py-2.5 rounded-xl md:rounded-2xl text-sm font-black tracking-widest uppercase shadow-sm ${project.status === 'ONGOING' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-10">
          <div className="bg-green-50/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-200 p-2.5 rounded-xl"><User size={24} className="text-green-800" /></div>
              <h3 className="text-lg md:text-xl font-extrabold text-green-900">Assigned Employees</h3>
            </div>
            <ul className="space-y-3">
              {project.employees.map((emp: any) => (
                <li key={emp.id} className="bg-white p-4 rounded-2xl text-green-900 font-bold border border-green-100 shadow-sm flex items-center gap-3 text-sm md:text-base">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                  {emp.name}
                </li>
              ))}
              {project.employees.length === 0 && <p className="text-green-600/70 italic font-medium">No employees assigned.</p>}
            </ul>
          </div>
          <div className="bg-green-50/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-200 p-2.5 rounded-xl"><Wrench size={24} className="text-green-800" /></div>
              <h3 className="text-lg md:text-xl font-extrabold text-green-900">Assigned Equipment</h3>
            </div>
            <ul className="space-y-3">
              {project.equipment.map((eq: any) => (
                <li key={eq.id} className="bg-white p-4 rounded-2xl text-green-900 font-bold flex justify-between items-center border border-green-100 shadow-sm text-sm md:text-base">
                  <span className="truncate pr-3">{eq.equipment.name}</span>
                  <span className="font-mono text-xs md:text-sm text-green-700 bg-green-50 px-2.5 py-1 md:py-1.5 rounded-lg border border-green-200">{eq.equipment.code}</span>
                </li>
              ))}
              {project.equipment.length === 0 && <p className="text-green-600/70 italic font-medium">No equipment assigned.</p>}
            </ul>
          </div>
        </div>

        {project.status === 'ONGOING' && (
          <div className="mt-8 md:mt-12 border-t-2 border-green-50 pt-8 md:pt-10 flex flex-col md:flex-row justify-end">
            <button type="button" onClick={handleEndInitiate} className="w-full md:w-auto bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-2 border-red-200 hover:border-red-600 px-10 py-4 md:py-4 rounded-xl md:rounded-2xl font-black text-lg transition-all shadow-sm active:scale-95">
              End Project
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-green-950/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-xl shadow-2xl relative animate-in">
            {!warningOpen ? (
              <>
                <h2 className="text-2xl md:text-3xl font-black text-green-950 mb-4 md:mb-6 border-b-2 border-green-50 pb-4 md:pb-6">End Checklist</h2>
                <p className="text-green-700 font-bold mb-4 text-sm md:text-base">Confirm the return of equipment:</p>
                <div className="space-y-3 max-h-[45vh] md:max-h-[40vh] overflow-y-auto mb-6 md:mb-8 pr-2 custom-scrollbar">
                  {project.equipment.map((eq: any) => (
                    <div key={eq.equipment.id} className={`flex items-center justify-between p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2 ${checkedEq[eq.equipment.id] ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`} onClick={() => setCheckedEq({ ...checkedEq, [eq.equipment.id]: !checkedEq[eq.equipment.id] })}>
                      <div>
                        <p className={`font-bold text-base md:text-lg ${checkedEq[eq.equipment.id] ? 'text-green-900' : 'text-gray-800'}`}>{eq.equipment.name}</p>
                        <p className={`text-xs md:text-sm font-mono mt-1 ${checkedEq[eq.equipment.id] ? 'text-green-700' : 'text-gray-500'}`}>{eq.equipment.code}</p>
                      </div>
                      {checkedEq[eq.equipment.id] ? <CheckSquare className="text-green-600 flex-shrink-0" size={28} /> : <Square className="text-gray-300 flex-shrink-0" size={28} />}
                    </div>
                  ))}
                  {project.equipment.length === 0 && <p className="text-center text-gray-500 py-4 font-medium">No equipment to return.</p>}
                </div>
                <div className="mb-6 md:mb-8">
                  <label className="block text-sm font-bold text-green-900 mb-2 md:mb-3">Ended by</label>
                  <input required value={endedBy} onChange={e => setEndedBy(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 outline-none transition-colors text-base md:text-lg font-bold text-green-950" placeholder="Full name..." />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="button" onClick={handleEndSubmit} disabled={!endedBy || isEnding} className="flex-1 bg-green-700 text-white py-4 rounded-xl md:rounded-2xl font-bold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                    {isEnding ? 'Processing...' : 'End Project'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <AlertTriangle size={40} className="text-orange-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-green-950 mb-3 md:mb-4">Incomplete Return</h3>
                <p className="text-gray-600 mb-8 md:mb-10 text-sm md:text-lg font-medium">Some equipment was not ticked as returned. Are you sure you want to end the project?</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button type="button" onClick={() => setWarningOpen(false)} className="flex-1 bg-gray-100 text-gray-800 py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-200 transition-colors">No, go back</button>
                  <button type="button" onClick={handleEndSubmit} disabled={isEnding} className="flex-1 bg-red-600 text-white py-4 rounded-xl md:rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg">
                    {isEnding ? 'Processing...' : 'Yes, end it'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}