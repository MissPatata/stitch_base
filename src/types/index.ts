export type GarmentType =
  | "t-shirt"
  | "dress"
  | "skirt"
  | "pants"
  | "coat"
  | "other";
export type LengthType = "short" | "mid" | "long" | "other";
export type SleeveLengthType = "short" | "mid" | "long" | "other";
export type ProcessStatus = "idea" | "planning" | "inProcess" | "completed";
export type ImageType =
  | "preview"
  | "drawing"
  | "process"
  | "result"
  | "design"
  | "others";

export type DesignImageType = ImageType;
export type PatternImageType = ImageType;

export interface Image {
  id: string;
  type: ImageType;
  filePath: string;
}

export interface DesignImage extends Image {
  designId: string;
}

export interface PatternImage extends Image {
  patternId: string;
}

export interface PatternFile {
  id: string;
  patternId: string;
  filePath: string;
}

export interface Pattern {
  id: string;
  garmentType: GarmentType;
  length: LengthType | null;
  sleeveLength: SleeveLengthType | null;
  name: string;
  description: string;
  attachedFile?: PatternFile;
  images: PatternImage[];
  tags: string[];
  collection?: string;
  createdAt: string;
}

export interface Design {
  id: string;
  garmentType: GarmentType;
  length: LengthType | null;
  sleeveLength: SleeveLengthType | null;
  name: string;
  description: string;
  tags: string[];
  collection?: string;
  processStatus: ProcessStatus;
  createdAt: string;
  images: DesignImage[];
  linkedPatternIds: string[];
}
