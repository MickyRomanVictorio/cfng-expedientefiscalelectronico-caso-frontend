import {SYSTEM} from 'ngx-cfng-core-lib';

export const CFE_NAVEGACION = [
    {
        sistema: 'Expediente Fiscal Electrónico',
        url: '/app/inicio',
        notificarCambio: true,
        codigo: SYSTEM.EFE,
    },
    {
        sistema: 'Generador de notificaciones',
        url: '/app/notificaciones',
        notificarCambio: true,
        codigo: SYSTEM.GEN
    },
    {
        sistema: 'Mesa de turno',
        url: '/app/mesa-turno',
        codigo: SYSTEM.MTU
    },
    {
        sistema: 'Central de notificaciones',
        url: '',
        codigo: SYSTEM.CEN
    },
    {
        sistema: 'Mesa de despacho',
        url: '/app/mesa-despacho',
        codigo: SYSTEM.MDE
    },
    {
        sistema: 'Sistema Casilla Fiscal Electrónica',
        url: '',
        codigo: SYSTEM.CAS
    },
    {
        sistema: 'Mesa única de partes',
        url: '/app/mesa-unica',
        codigo: SYSTEM.MUP
    },
    {
        sistema: 'Interoperabilidad',
        url: '',
        codigo: SYSTEM.IOP
    }
]
