"use client"

import { useState } from 'react';
import { updateEquipment } from '@/lib/actions';
import { ImageIcon, Save } from 'lucide-react';

export default function EquipmentClient({ eq: initialEq }: { eq: any }) {
  const [eq, setEq] = useState(initialEq);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const isMain = eq.type === 'MAIN' || eq.code;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEq({ ...eq, picture: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateEquipment(eq.id, { 
      name: eq.name, 
      code: eq.code, 
      componentCode: eq.componentCode,
      equipmentCode: eq.equipmentCode,
      picture: eq.picture,
      type: eq.type
    });
    setSaving(false);
    setEditMode(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in space-y-6">
      
      {/* Header Profile */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden mb-5 flex justify-center items-center relative group">
          {eq.picture ? <img src={eq.picture} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-slate-300" />}
          {editMode && (
             <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center cursor-pointer opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
               <span className="text-white text-[10px] font-semibold bg-slate-800 px-3 py-1.5 rounded-md shadow-sm text-center">Change</span>
               <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
             </label>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-900 text-center">{eq.name || 'Component'}</h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded text-xs border border-slate-200">{eq.code || eq.componentCode}</span>
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded ${isMain ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {isMain ? 'MAIN' : 'COMPONENT'}
          </span>
        </div>
      </div>

      {/* Form / Actions */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        {editMode ? (
          <form onSubmit={handleSave} className="space-y-5">
            {isMain ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Name</label>
                  <input required value={eq.name || ''} onChange={e => setEq({...eq, name: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 bg-slate-50/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Equipment Code</label>
                  <input required value={eq.code || ''} onChange={e => setEq({...eq, code: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Component Code</label>
                  <input required value={eq.componentCode || ''} onChange={e => setEq({...eq, componentCode: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Linked Equipment Code</label>
                  <input required value={eq.equipmentCode || ''} onChange={e => setEq({...eq, equipmentCode: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800 bg-slate-50/50 text-sm" />
                </div>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm flex justify-center items-center gap-2 text-sm">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center">
            <button type="button" onClick={() => setEditMode(true)} className="w-full md:w-auto px-8 bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all">
              Edit Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}