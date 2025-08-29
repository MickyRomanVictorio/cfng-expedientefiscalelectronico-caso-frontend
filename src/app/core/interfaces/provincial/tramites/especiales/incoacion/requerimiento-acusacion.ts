export interface InputadosAcusacion {
    nombre: string;
    delitos: string[];
}

export interface PlazoAcusacion {
    plazo: Date;
    vencido: boolean;
    cantidad: number;
}
