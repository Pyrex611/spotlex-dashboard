import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServer();
    
    const { data: main, error: mError } = await supabase.from('equipments').select('*');
    const { data: comps, error: cError } = await supabase.from('equipment_components').select('*');
    
    if (mError || cError) {
      console.error("Supabase Error:", mError || cError);
      return NextResponse.json({ error: "Database fetch error" }, { status: 500 });
    }

    const combined = [
      ...(main || []).map((m: any) => ({ ...m, type: 'MAIN' })),
      ...(comps || []).map((c: any) => ({ 
        ...c, 
        type: 'COMPONENT',
        code: c.component_code,
        equipmentCode: c.equipment_code 
      }))
    ];
    
    return NextResponse.json(combined);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}