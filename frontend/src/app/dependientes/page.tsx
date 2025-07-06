"use client";
import { useState } from "react";
import { EntryMenuChecker } from "@/components/dependientes/EntryMenuChecker";
import { ServiceSpotSelector } from "@/components/dependientes/ServiceSpotSelector";

export default function DependientesPage() {
  const [step, setStep] = useState<'menu' | 'spots'>('menu');
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  // Paso 1: Validar menús publicados
  if (step === 'menu') {
    return (
      <EntryMenuChecker
        onSuccess={(menu) => {
          setSelectedMenu(menu);
          setStep('spots');
        }}
      />
    );
  }

  // Paso 2: Selección de puestos
  if (step === 'spots') {
    return <ServiceSpotSelector onSelect={(spot) => {/* siguiente paso */}} />;
  }

  return null;
}
