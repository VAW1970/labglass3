import { GlasswareType } from './types';

export const CLASSES: string[] = [
  "background",
  "beaker",
  "compass",
  "digital_balance",
  "erlenmeyer_flask",
  "funnel",
  "graduated_cylinder",
  "horseshoe_magnet",
  "objects",
  "stirring_rod",
  "test_tube",
  "test_tube_rack",
  "thermometer",
];

// Tradução para exibição na UI
export const LABELS_PT: Record<string, string> = {
  "background": "Fundo",
  "beaker": "Béquer",
  "compass": "Bússola",
  "digital_balance": "Balança Digital",
  "erlenmeyer_flask": "Erlenmeyer",
  "funnel": "Funil",
  "graduated_cylinder": "Proveta",
  "horseshoe_magnet": "Ímã Ferradura",
  "objects": "Objetos Diversos",
  "stirring_rod": "Bastão de Vidro",
  "test_tube": "Tubo de Ensaio",
  "test_tube_rack": "Estante para Tubos",
  "thermometer": "Termômetro",
};

export const CLASS_COLORS: Record<string, string> = {
  [GlasswareType.BEAKER]: "border-blue-500 bg-blue-500/20 text-blue-700",
  [GlasswareType.ERLENMEYER_FLASK]: "border-purple-500 bg-purple-500/20 text-purple-700",
  [GlasswareType.GRADUATED_CYLINDER]: "border-green-500 bg-green-500/20 text-green-700",
  [GlasswareType.TEST_TUBE]: "border-red-500 bg-red-500/20 text-red-700",
  [GlasswareType.THERMOMETER]: "border-orange-500 bg-orange-500/20 text-orange-700",
  // Default fallback
  "default": "border-cyan-500 bg-cyan-500/20 text-cyan-700"
};

export const API_ENDPOINT = "http://localhost:5000/predict"; // Onde seu app Flask reside