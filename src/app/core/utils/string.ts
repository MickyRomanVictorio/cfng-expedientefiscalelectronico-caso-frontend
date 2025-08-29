export const capitalized = (text: any = '') => {
  if (typeof text !== 'string') {
    return '';
  }
  const word = text.toLowerCase().split(' ');
  for (var i = 0; i < word.length; i++) {
    word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
  }
  return word.join(' ');
};

export const valid = (value: any): boolean => {
  return (
    value !== undefined && value !== null && value !== '' && value.trim() !== ''
  );
};

export const validString = (valor: any): string | null => {
  return valid(valor) ? String(valor).trim().toUpperCase() : null;
};

export function capitalizedFirstWord(texto: any = '') {
  if (typeof texto !== 'string' || texto.length === 0) {
    return texto;
  }
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export const padTo3 = (number: number) => {
  return String(number).padStart(3, '0');
};

export const soloLetras = (palabra: string) => {
  return palabra?.replace(/[^a-zA-Z\s]/g, '');
};

export const soloNumeros = (palabra: string) => {
  return palabra?.replace(/\D/g, '');
};

export function quitarTildes(texto: string): string {
  if (!texto) return '';
  const mapaTildes: any = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    ü: 'u',
    // 'ñ': 'n',
    Á: 'A',
    É: 'E',
    Í: 'I',
    Ó: 'O',
    Ú: 'U',
    Ü: 'U',
    // 'Ñ': 'N'
  };

  return texto.replace(
    /[áéíóúüñÁÉÍÓÚÜÑ]/g,
    (letra) => mapaTildes[letra] || letra
  );
}

export function ordenar(campo: string, orden: string) {
  return (a: any, b: any) => {
    const comparacion = a[campo].localeCompare(b[campo]);
    return orden === 'asc' ? comparacion : -comparacion;
  };
}

export function convertirMinusculayGuiones(input: any): string {
  if (typeof input !== 'string' || input.length === 0) {
    return input;
  }
  return input.toLowerCase().replace(/\s+/g, '-');
}

export const textoDecimales = (
  texto: string,
  decimales: number,
  concat: string
) => {
  let numero: number = parseFloat(texto);
  return numero ? numero.toFixed(decimales).concat(concat) : '-';
};