export interface Modulo{
    modulo: string,
    url: string,
    icono: string,
    boton?: boolean,
    extendido?: boolean,
    opciones?: Opcion[]
}

export interface Opcion{
    nombre: string,
    url: string,
}