import { createServer } from '@/lib/supabase/server';
import EquipmentClient from './EquipmentClient';
import { Info } from 'lucide-react';

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServer();
  
  // 1. Check Main Equipment
  const { data: main } = await supabase.from('equipments').select('*').eq('id', id).single();
  
  let eq = null;

  if (main) {
    eq = { ...main, type: 'MAIN' };
  } else {
    // 2. Check Components if not found in Main
    const { data: comp } = await supabase.from('equipment_components').select('*').eq('id', id).single();
    if (comp) {
      eq = { 
        ...comp, 
        type: 'COMPONENT',
        code: comp.component_code, // Map internal naming to client expected key
        equipmentCode: comp.equipment_code
      };
    }
  }

  if (!eq) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 mt-10 max-w-lg mx-auto">
        <Info size={32} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">Item Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">This equipment or component doesn&apos;t exist in the registry.</p>
      </div>
    );
  }

  return <EquipmentClient eq={eq} />;
}