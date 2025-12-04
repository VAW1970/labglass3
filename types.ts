export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  id: string;
  class_id: number;
  label: string;
  score: number;
  box: DetectionBox; // Coordinates in pixels or relative depending on implementation
}

export interface AnalysisResult {
  imageWidth: number;
  imageHeight: number;
  detections: Detection[];
}

export enum GlasswareType {
  BACKGROUND = "background",
  BEAKER = "beaker",
  COMPASS = "compass",
  DIGITAL_BALANCE = "digital_balance",
  ERLENMEYER_FLASK = "erlenmeyer_flask",
  FUNNEL = "funnel",
  GRADUATED_CYLINDER = "graduated_cylinder",
  HORSESHOE_MAGNET = "horseshoe_magnet",
  OBJECTS = "objects",
  STIRRING_ROD = "stirring_rod",
  TEST_TUBE = "test_tube",
  TEST_TUBE_RACK = "test_tube_rack",
  THERMOMETER = "thermometer",
}