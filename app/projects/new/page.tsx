"use client"

import { useState } from 'react';
import { createProject, searchEquipment } from '@/lib/actions';
import { Plus, X, Search, Users, Wrench } from 'lucide-react';

export default function NewProject() {
  const [name, setName] = useState('');
  const[empName, setEmpName] = useState('');
  const [employees, setEmployees] = useState<string[]>([]);
  const[equipments, setEquipments] = useState<{ id: string, name: string, code: string }[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const[search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEmployee = () => {
    if (empName.trim() && !employees.includes(empName.trim())) {
      setEmployees([...employees, empName.trim()]);
      setEmpName('');
    }
  };

  const handleEmployeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmployee();
    }
  };

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length > 1) {
      const res = await searchEquipment(val);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  };

  const addEquipment = (eq: any) => {
    if (!equipments.find(e => e.id === eq.id)) {
      setEquipments([...equipments, eq]);
    }
    setModalOpen(false);
    setSearch('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createProject({ name, employees, equipmentIds: equipments.map(e => e.id) });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-green-100 animate-in">
      <h1 className="text-2xl md:text-3xl font-black text-green-950 mb-6 md:mb-8 border-b-2 border-green-50 pb-4 md:pb-6">Initialize New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div>
          <label className="block text-sm font-bold text-green-900 mb-3">Project Name</label>
          <input required value={name} onChange={e => setName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 outline-none transition-colors text-lg font-bold text-green-950" placeholder="e.g. Lagos Lagoon Cleanup Phase 1" />
        </div>

        <div className="bg-green-50/30 p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-green-100">
          <label className="flex items-center gap-2 text-sm font-bold text-green-900 mb-4">
            <Users size={18} className="text-green-600" /> Assigned Employees
          </label>
          <div className="flex flex-row gap-2 md:gap-3 mb-4">
            <input value={empName} onChange={e => setEmpName(e.target.value)} onKeyDown={handleEmployeeKeyDown} className="flex-1 w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl p-4 bg-white outline-none transition-colors font-semibold" placeholder="Employee name..." />
            
            {/* Swapped to pure onClick, replaced active:scale with safe active:opacity */}
            <button 
              type="button" 
              onClick={addEmployee}
              className="bg-green-700 text-white px-5 md:px-6 rounded-xl font-bold hover:bg-green-800 transition-colors shadow-md flex flex-shrink-0 items-center justify-center gap-1.5 active:opacity-80"
            >
              <Plus size={20}/> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp, i) => (
              <span key={i} className="bg-green-100 text-green-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm border border-green-200">
                {emp} 
                <button type="button" onClick={() => setEmployees(employees.filter((_, idx) => idx !== i))} className="hover:bg-green-200 p-0.5 rounded-full transition-colors"><X size={16} className="text-green-700" /></button>
              </span>
            ))}
            {employees.length === 0 && <p className="text-sm text-gray-500 font-medium italic pl-1">No employees added yet.</p>}
          </div>
        </div>

        <div className="bg-green-50/30 p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-green-100">
          <label className="flex items-center gap-2 text-sm font-bold text-green-900 mb-4">
            <Wrench size={18} className="text-green-600" /> Assigned Equipment
          </label>
          <button type="button" onClick={() => setModalOpen(true)} className="w-full py-5 border-2 border-dashed border-green-400 rounded-xl text-green-700 font-bold hover:bg-green-100 hover:border-green-500 transition-all flex justify-center items-center gap-2 bg-white shadow-sm active:opacity-80">
            <Plus size={22}/> Pick Equipment
          </button>
          <div className="mt-4 space-y-3">
            {equipments.map((eq, i) => (
              <div key={i} className="flex justify-between items-center bg-white border-2 border-green-100 p-4 rounded-xl shadow-sm">
                <div className="flex flex-col">
                  <span className="font-bold text-green-950 text-sm md:text-base">{eq.name || 'Unnamed Component'}</span>
                  <span className="text-xs font-mono text-green-600 mt-1">{eq.code}</span>
                </div>
                <button type="button" onClick={() => setEquipments(equipments.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-50 rounded-lg transition-colors group active:opacity-50">
                  <X size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || !name} className="w-full bg-green-800 text-white py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-green-900 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:opacity-80">
          {isSubmitting ? 'Creating Project...' : 'Launch Project'}
        </button>
      </form>

      {/* Equipment Search Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-green-950/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] w-full max-w-lg shadow-2xl animate-in">
            <div className="flex justify-between items-center mb-6 border-b-2 border-green-50 pb-4">
              <h3 className="text-xl md:text-2xl font-black text-green-950">Search Equipment</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:opacity-50"><X size={24} className="text-gray-500" /></button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-4 text-green-500" size={20} />
              <input value={search} onChange={e => handleSearch(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} autoFocus className="w-full pl-12 pr-4 py-4 border-2 border-green-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-green-500 outline-none transition-colors font-medium text-sm md:text-base" placeholder="Type name or code..." />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {searchResults.map(res => (
                <div key={res.id} 
                     onClick={() => addEquipment(res)} 
                     className="p-4 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group active:opacity-80">
                  <span className="font-bold text-gray-800 group-hover:text-green-900 text-sm md:text-base">{res.name}</span>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg group-hover:bg-green-200 group-hover:text-green-800 transition-colors font-bold w-full sm:w-auto text-center">{res.code}</span>
                </div>
              ))}
              {search.length > 1 && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <Wrench size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No equipment found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}