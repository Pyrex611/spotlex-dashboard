"use client"

import { useState } from 'react';
import { endProject, addStaffToProject, addEquipmentToProject, searchEquipment, recallStaff, recallEquipment } from '@/lib/actions';
import { CheckSquare, Square, AlertTriangle, User, Wrench, Calendar, Plus, X, Search, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectClient({ project }: { project: any }) {
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [recallModalOpen, setRecallModalOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addEqOpen, setAddEqOpen] = useState(false);
  
  const [endedBy, setEndedBy] = useState('');
  const [checkedEndEq, setCheckedEndEq] = useState<Record<string, boolean>>({});
  const [newStaffName, setNewStaffName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recallTarget, setRecallTarget] = useState<any>(null);
  const [recalledBy, setRecalledBy] = useState('');

  const handleEndInitiate = () => {
    const initialChecks: Record<string, boolean> = {};
    project.equipment?.filter((e: any) => e.status === 'ASSIGNED').forEach((e: any) => {
      initialChecks[e.equipment.id] = false;
    });
    setCheckedEndEq(initialChecks);
    setEndModalOpen(true);
  };
  
  const handleEndSubmit = async () => {
    const assignedEquipment = project.equipment?.filter((e: any) => e.status === 'ASSIGNED') || [];
    if (Object.values(checkedEndEq).filter(Boolean).length < assignedEquipment.length && !warningOpen) {
      setWarningOpen(true);
      return;
    }
    setIsProcessing(true);
    await endProject(project.id, endedBy, Object.keys(checkedEndEq).filter(k => checkedEndEq[k]));
  };

  const handleAddStaff = async (e?: any) => {
    if (e) e.preventDefault();
    if (!newStaffName.trim()) return;
    setIsProcessing(true);
    await addStaffToProject(project.id, newStaffName.trim());
    setNewStaffName('');
    setIsProcessing(false);
    setAddStaffOpen(false);
  };

  const handleAddEquipment = async (eqId: string) => {
    setIsProcessing(true);
    await addEquipmentToProject(project.id, eqId);
    setIsProcessing(false);
    setAddEqOpen(false);
  };

  const activeStaff = project.employees?.filter((s: any) => s.status === 'ASSIGNED');
  const activeEq = project.equipment?.filter((e: any) => e.status === 'ASSIGNED');

  return (
    <div className="max-w-4xl mx-auto animate-in space-y-6 relative">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Calendar size={14} /> Started {format(new Date(project.startDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase tracking-wider">
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><User size={16} className="text-emerald-600"/> Assigned Staff</h3>
              <button type="button" onClick={() => setAddStaffOpen(true)} className="p-1.5 bg-slate-50 rounded-lg hover:bg-emerald-50"><Plus size={16} /></button>
            </div>
            <ul className="space-y-2">
              {activeStaff?.map((emp: any) => (
                <li key={emp.id} className="group bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex justify-between items-center">
                  <span>{emp.name}</span>
                  <button type="button" onClick={async () => { if(confirm("Recall staff?")) await recallStaff(emp.id, project.id); }} className="text-yellow-600 p-1 hover:bg-white rounded transition-colors"><UserMinus size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Wrench size={16} className="text-emerald-600"/> Assigned Equipment</h3>
              <button type="button" onClick={() => setAddEqOpen(true)} className="p-1.5 bg-slate-50 rounded-lg hover:bg-emerald-50"><Plus size={16} /></button>
            </div>
            <ul className="space-y-2">
              {activeEq?.map((eq: any) => (
                <li key={eq.id} className="group bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500">{eq.equipment.code}</span>
                    <span className="truncate">{eq.equipment.name}</span>
                  </div>
                  <button type="button" onClick={() => { setRecallTarget(eq); setRecallModalOpen(true); }} className="text-yellow-600 p-1 hover:bg-white rounded transition-colors"><UserMinus size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button type="button" onClick={handleEndInitiate} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 active:opacity-80">End Project</button>
        </div>
      </div>

      {/* Modals */}
      {addStaffOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Add Staff Member</h3>
            <input autoFocus className="w-full border rounded-xl p-3 mb-6" placeholder="Name..." value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
            <div className="flex gap-3">
              <button type="button" className="flex-1 bg-slate-100 py-3 rounded-xl" onClick={() => setAddStaffOpen(false)}>Cancel</button>
              <button type="button" className="flex-1 bg-slate-800 text-white py-3 rounded-xl" onClick={handleAddStaff} disabled={isProcessing}>Add Member</button>
            </div>
          </div>
        </div>
      )}

      {addEqOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Deploy Equipment</h3><button type="button" onClick={() => setAddEqOpen(false)}><X size={18}/></button></div>
            <input autoFocus className="w-full border rounded-xl p-3 mb-4" placeholder="Search..." onChange={e => searchEquipment(e.target.value).then(setSearchResults)} />
            <div className="max-h-60 overflow-auto space-y-2">
              {searchResults.map(res => (
                <button type="button" key={res.id} className="w-full text-left p-3 border rounded-xl flex justify-between items-center hover:bg-emerald-50" onClick={() => handleAddEquipment(res.id)}>
                  <span className="text-sm font-medium">{res.name}</span><span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{res.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {recallModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h3 className="font-bold mb-2">Recall Equipment</h3>
            <p className="text-sm text-slate-500 mb-4 truncate">Device: {recallTarget?.equipment?.name}</p>
            <input autoFocus className="w-full border rounded-xl p-3 mb-6" placeholder="Your name (Recalled by)..." value={recalledBy} onChange={e => setRecalledBy(e.target.value)} />
            <div className="flex gap-3">
              <button type="button" className="flex-1 bg-slate-100 py-3 rounded-xl" onClick={() => setRecallModalOpen(false)}>Cancel</button>
              <button type="button" className="flex-1 bg-yellow-500 text-white py-3 rounded-xl" onClick={async () => {
                await recallEquipment(recallTarget.id, recalledBy, project.id);
                setRecallModalOpen(false);
              }}>Confirm Recall</button>
            </div>
          </div>
        </div>
      )}

      {endModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl">
             <h3 className="text-xl font-bold mb-4">Final Checklist</h3>
             <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
                {activeEq?.map((eq: any) => (
                  <button key={eq.equipment.id} onClick={() => setCheckedEndEq({...checkedEndEq, [eq.equipment.id]: !checkedEndEq[eq.equipment.id]})} className={`w-full text-left p-3 border rounded-xl flex justify-between items-center ${checkedEndEq[eq.equipment.id] ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                    <div><p className="text-sm font-bold">{eq.equipment.name}</p></div>
                    {checkedEndEq[eq.equipment.id] ? <CheckSquare className="text-emerald-600" /> : <Square className="text-slate-300" />}
                  </button>
                ))}
             </div>
             <input className="w-full border rounded-xl p-3 mb-6" placeholder="Ended by..." value={endedBy} onChange={e => setEndedBy(e.target.value)} />
             <div className="flex gap-3">
                <button type="button" className="flex-1 bg-slate-100 py-3 rounded-xl" onClick={() => setEndModalOpen(false)}>Cancel</button>
                <button type="button" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl" onClick={handleEndSubmit}>Complete Project</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}