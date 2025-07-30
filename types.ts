export enum Tool {
  SELECT = 'SELECT',
  PEN = 'PEN',
  POLYGON = 'POLYGON',
  RECTANGLE = 'RECTANGLE',
  SQUARE = 'SQUARE',
  DASHES = 'DASHES',
  ERASER = 'ERASER',
}

export interface Layout {
  id: string;
  name: string;
  owner: string;
  dataUrl: string;
}

export interface PlacedLayout {
  id: string; // Unique ID for this instance on the map
  layoutId: string; // ID of the original layout
  dataUrl: string;
  position: { lat: number; lng: number };
  size: { width: number; height: number }; // in pixels
  rotation: number; // in degrees
  isFixed: boolean;
  initialZoom?: number;
  initialSize?: { width: number; height: number };
}