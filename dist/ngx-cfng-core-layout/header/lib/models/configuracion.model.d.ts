import { TemplateRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
export interface UsuarioOpciones extends MenuItem {
}
export interface Usuario {
    nombres: string;
    perfil: string;
    opciones: UsuarioOpciones[];
}
export interface Aplicaciones {
    sistema: string;
    url: string;
    notificarCambio?: boolean;
    codigo?: string;
    acronimo?: string;
    idAplicacion?: number;
    ruta?: string;
    titulo?: string;
}
export interface Titulos {
    principal: string;
    superior?: string;
    fiscalia?: string;
}
export declare enum TipoMenuNavegacion {
    Sidebar = 1,
    Dropdown = 2
}
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
export interface Alertas {
    codigo: string;
    icono: string;
    cantidad?: number;
    template?: TemplateRef<any>;
    click?: (e: Event) => void;
    mostrar?: boolean;
}
export interface BandejaAlertaResponse {
    limiteListadoPorAtender: number;
    limiteListadoAtendido: number;
    listaAlertaPorAtender: any[];
    listaAlertaAtendido: any[];
    totalPorAtender: number;
    totalAtendido: number;
    idDespacho: string;
}
export interface ListadoAlertasUrgentesResponse {
    listaAlertaPorAtender: Alerta[];
    totalPorAtender: number;
    idDespacho: string;
}
export interface Alerta {
    id: string;
    forma: string;
    codigoDespacho: string;
    idAsignado: string;
    idOrigen: string;
    tipo: string;
    bandeja: string;
    titulo: string;
    texto: string;
    codigoCaso: string;
    estado: string;
    fechaCreacion: string;
}
export interface SumarioAlertaResponseDTO {
    bandejaPlazoAlertas: BandejaAlertaResponse;
    bandejaGenericaAlertas: BandejaAlertaResponse;
    listadoAlertasUrgentes: ListadoAlertasUrgentesResponse;
}
export interface MenuNavegacionBotones {
    name: string;
    extended?: boolean;
    icon?: string;
    disabled?: boolean;
    click?: (e: Event) => void;
    styleClass?: string;
    options?: MenuNavegacion[];
}
