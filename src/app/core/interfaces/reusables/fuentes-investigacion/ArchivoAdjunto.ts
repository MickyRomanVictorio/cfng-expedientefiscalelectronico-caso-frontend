export interface ArchivoAdjunto {
  isSelect: boolean;

  file: File | null;
  duration?: string | null;
  size?: string | null;
  imgDoc?: string | null;
  descripcion?: string | null;
  nombre?: string | null;
}