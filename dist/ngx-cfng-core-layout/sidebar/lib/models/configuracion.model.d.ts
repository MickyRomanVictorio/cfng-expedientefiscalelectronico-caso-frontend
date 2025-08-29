export interface MenuNavegacion {
    idOrder?: number;
    code?: string;
    name: string;
    url: string;
    count?: number;
    extended?: boolean;
    icon?: string;
    options?: MenuNavegacion[];
    idAplicacion?: number;
}
