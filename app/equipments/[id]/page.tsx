import prisma from '@/lib/db';
import EquipmentClient from './EquipmentClient';
import { Info } from 'lucide-react';

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const main = await prisma.equipment.findUnique({ where: { id } });
  let eq = null;

  if (main) {
    eq = { ...main, type: 'MAIN' };
  } else {
    const comp = await prisma.equipmentComponent.findUnique({ where: { id } });
    if (comp) eq = { ...comp, type: 'COMPONENT' };
  }

  if (!eq) {
    return (
      <div className="p-12 text-center text-red-600 bg-red-50 rounded-3xl border border-red-200 mt-10 max-w-2xl mx-auto">
        <Info size={40} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Equipment Not Found</h2>
        <p>This equipment configuration doesn't exist in the database.</p>
      </div>
    );
  }

  return <EquipmentClient eq={eq} />;
}