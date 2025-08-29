export const base64ToFile = (base64String: string): File | null => {
  const binaryData = atob(base64String);
  const array = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    array[i] = binaryData.charCodeAt(i);
  }
  const blob = new Blob([array], { type: 'application/octet-stream' });
  try {
    return new File([blob], `${new Date().getTime()}.pdf`, {
      type: 'application/octet-stream',
    });
  } catch (e) {
    console.error('Error creating File:', e);
    return null;
  }
};

export const base64ToFilePdf = (base64String: string, filename = `${new Date().getTime()}.pdf`): File | null => {
  try {
    const binaryData = atob(base64String);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }
    return new File([array], filename, {
      type: 'application/pdf',
    });
  } catch (e) {
    console.error('Error creating File:', e);
    return null;
  }
};

export const descargarArchivoB64 = (
  archivoB64: string,
  nombreArchivo: string
): void => {
  const caracteresBase64 = atob(archivoB64);
  const numerosBytes = new Array(caracteresBase64.length);
  for (let i = 0; i < caracteresBase64.length; i++) {
    numerosBytes[i] = caracteresBase64.charCodeAt(i);
  }
  const arregloBytes = new Uint8Array(numerosBytes);
  const archivo = new Blob([arregloBytes], { type: 'application/pdf' });
  const enlaceDescarga = document.createElement('a');
  enlaceDescarga.href = URL.createObjectURL(archivo);
  enlaceDescarga.download = `${nombreArchivo}.pdf`;
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();
  document.body.removeChild(enlaceDescarga);
};

export const archivoFileToB64 = async (archivo: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = () => {
      const archivoB64 = reader.result as string;
      resolve(archivoB64.replace('data:application/pdf;base64,', ''));
    };
    reader.onerror = () => {
      reject('');
    };
  });
};

export const trustUrlB64 = (archivoB64: string): string => {
  return `data:application/pdf;base64,${archivoB64}`;
};

export const onlyB64File = (trustArchivoB64: string): string => {
  return trustArchivoB64.replace('data:application/pdf;base64,', '');
};

export const formatoPesoArchivo = (bytes: number, decimalPoint: number = 2) => {
  if (bytes == 0) return '0 Bytes';
  let k = 1024;
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i]
  );
};
