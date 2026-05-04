"use client"

import { useState } from 'react';
import { updateEquipment } from '@/lib/actions';
import { ImageIcon, Save } from 'lucide-react';

export default function EquipmentClient({ eq: initialEq }: { eq: any }) {
  const [eq, setEq] = useState(initialEq);
  const[editMode, setEditMode] = useState(false);
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
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-lg border border-green-100 animate-in">
      <div className="flex flex-col items-center mb-8 md:mb-10">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[1.5rem] md:rounded-3xl bg-green-50 border-4 border-green-100 overflow-hidden mb-6 flex justify-center items-center shadow-inner relative group">
          {eq.picture ? <img src={eq.picture} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-green-200" />}
          {editMode && (
             <label className="absolute inset-0 bg-green-900/60 flex items-center justify-center cursor-pointer opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
               <span className="text-white font-bold text-xs md:text-sm bg-green-800 px-3 md:px-4 py-2 rounded-full border border-green-500 shadow-lg text-center leading-tight">Change<br className="md:hidden"/> Photo</span>
               <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
             </label>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-green-950 text-center px-2">{eq.name || 'Equipment Component'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mt-4">
          <span className="font-mono text-green-900 bg-green-100 px-3 md:px-4 py-1.5 rounded-lg border border-green-200 font-bold shadow-sm text-sm md:text-lg">{eq.code || eq.componentCode}</span>
          <span className={`text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white px-3 py-1.5 md:py-2 rounded-lg shadow-sm ${isMain ? 'bg-green-700' : 'bg-gray-600'}`}>
            {isMain ? 'MAIN' : 'COMPONENT'}
          </span>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleSave} className="space-y-6 border-t-2 border-green-50 pt-6 md:pt-8">
          {isMain ? (
            <>
              <div>
                <label className="block text-sm font-bold text-green-900 mb-2">Equipment Name</label>
                <input required value={eq.name || ''} onChange={e => setEq({...eq, name: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 transition-colors outline-none font-bold text-green-950 text-base md:text-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-900 mb-2">Equipment Code</label>
                <input required value={eq.code || ''} onChange={e => setEq({...eq, code: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 transition-colors outline-none font-mono font-bold text-green-900 text-base md:text-lg" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-green-900 mb-2">Component Code</label>
                <input required value={eq.componentCode || ''} onChange={e => setEq({...eq, componentCode: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 transition-colors outline-none font-mono font-bold text-green-900 text-base md:text-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-900 mb-2">Linked Equipment Code</label>
                <input required value={eq.equipmentCode || ''} onChange={e => setEq({...eq, equipmentCode: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault() }} className="w-full border-2 border-green-100 focus:border-green-600 focus:ring-0 rounded-xl md:rounded-2xl p-4 bg-green-50/50 transition-colors outline-none font-mono font-bold text-green-900 text-base md:text-lg" />
              </div>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
            <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl md:rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white py-4 rounded-xl md:rounded-2xl font-bold hover:bg-green-800 transition-colors shadow-lg flex justify-center items-center gap-2 active:scale-95">
              <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t-2 border-green-50 pt-6 md:pt-8 mt-6 md:mt-6 flex justify-center">
          <button type="button" onClick={() => setEditMode(true)} className="w-full md:w-auto px-10 bg-green-100 text-green-900 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-green-200 hover:shadow-md transition-all active:scale-95">
            Edit Equipment Info
          </button>
        </div>
      )}
    </div>
  );
}