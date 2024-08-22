export enum FileType {
  SOURCE,
  TEXT,
  HEADER,
}

export interface CodeFile {
  fileType: FileType;
  fileName: string;
}
