/// <reference path="tramites-constant.ngtypecheck.d.ts" />
export declare enum TRAMITE {
    FIRMADO = 1,
    NO_FIRMADO = 0
}
export declare enum VALIDACION {
    PERMITIDO = 0,
    TRAMITE_ENVIADO_AL_GN = 1,
    TRAMITE_ENVIADO_A_CN = 2,
    TRAMITE_ENVIADO_A_CN2 = 3,
    TRAMITE_SUPERIOR_ACEPTADO = 4,
    TRAMITE_SUPERIOR_NO_ACEPTADO = 5,
    TRAMITE_DISP_DESAGREGAR = 6
}
export declare enum ESTADO_TRAMITE {
    VISADO = 663,
    BORRADOR = 433,
    PENDIENTE_PARA_REVISION = 434,
    PENDIENTE_PARA_VISAR = 435,
    FIRMADO = 422,
    MODIFICADO = 545
}
export declare enum ESTADO_REGISTRO {
    BORRADOR = 943,
    FIRMADO = 946,
    RECIBIDO = 963,
    PENDIENTE_COMPLETAR = 964
}
export declare enum TIPO_RESULTADO {
    FUNDADO = 763,
    FUNDADO_EN_PARTE = 764,
    INFUNDADO = 765
}
