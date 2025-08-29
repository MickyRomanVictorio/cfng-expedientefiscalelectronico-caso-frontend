export interface DireccionSalida {

    block: string,
    cpoblado: string,
    codCentroPoblado?: string,
    descripcionPrefijoBlock: string,
    descripcionPrefijoInterior: string,
    direccionDomicilio: string,

    distrito: string,
    distritoNombre: string,
    dpto: string,
    dptoNombre: string,
    etapa: string,

    interior: string,
    item: string,
    lat: string,
    lon: string,
    lote: string,

    mz: string,
    nombre: string,
    nombreUrb: string,
    nroDireccion: string,
    origen: string,

    prefijoUrb: string,
    provincia: string,
    provinciaNombre: string,
    referencia: string,
    sujeto: string,

    pais: number,
    tipoDireccion: string,
    tipoDireccionNombre: string,
    tipoVia: string,
    idDireccion: string,

    registradoPor: string,
    fechaRegistro: string,
    actualizadoPor: string,
    fechaActualizacion: string,
    insertarEditar:boolean,

    paisNombre: string


}
