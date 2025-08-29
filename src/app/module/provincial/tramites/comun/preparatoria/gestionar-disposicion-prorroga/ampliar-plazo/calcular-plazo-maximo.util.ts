enum complejidad {
  SIMPLE = 1,
  COMPLEJO = 2,
  CRIMER_ORGANIZADO = 3,
}

enum uniMedida {
  DIAS = 2,
  MESES = 3,
  ANIOS = 4,
}

class CalcularPlazoMaximoUtil {
  constructor(
    private complejidad: number,
    private cantidadMaxima: number,
    private unidadMedida: number,
    private plazo: number
  ) {}

  build(): { isPasoElmaximo: boolean; mensaje: string | null } {
    let isMax = false;
    let mensaje: string | null = null;

    if (this.complejidad === complejidad.SIMPLE) {
      if (this.unidadMedida === uniMedida.DIAS) {
        isMax = this.plazo > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope</b> de 120 dias. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.MESES) {
        isMax = this.plazo * 30 > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope</b> de 4 meses. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.ANIOS) {
        isMax = this.plazo * 12 * 30 > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado <b>debe ser menor</b> a 1 año. Verifique los datos ingresados.`
          : null;
      }
    }

    if (this.complejidad === complejidad.COMPLEJO) {
      if (this.unidadMedida === uniMedida.DIAS) {
        isMax = this.plazo > this.cantidadMaxima * 30;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope</b> de 240 dias. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.MESES) {
        isMax = this.plazo > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope</b> de 8 meses. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.ANIOS) {
        isMax = this.plazo * 12 > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado <b>debe ser menor</b> a 1 año. Verifique los datos ingresados.`
          : null;
      }
    }

    if (this.complejidad === complejidad.CRIMER_ORGANIZADO) {
      if (this.unidadMedida === uniMedida.DIAS) {
        isMax = this.plazo > this.cantidadMaxima * 30;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope </b> de 1080 dias. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.MESES) {
        isMax = this.plazo > this.cantidadMaxima;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope </b> de 36 meses. Verifique los datos ingresados.`
          : null;
      }
      if (this.unidadMedida === uniMedida.ANIOS) {
        isMax = this.plazo > this.cantidadMaxima / 12;
        mensaje = isMax
          ? `El plazo registrado está <b>superando el tope </b> de 3 año. Verifique los datos ingresados.`
          : null;
      }
    }
    return { isPasoElmaximo: isMax, mensaje };
  }
}

export function calcularPlazoMaximoUtil(
  complejidad: number,
  cantidadMaxima: number,
  unidadMedida: number,
  plazo: number
) {
  return new CalcularPlazoMaximoUtil(
    complejidad,
    cantidadMaxima,
    unidadMedida,
    plazo
  );
}
