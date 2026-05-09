import { createServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  
  try {
    const supabase = await createServer();
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        employees(*),
        assigned_equipment(*, equipment:equipments(*))
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}