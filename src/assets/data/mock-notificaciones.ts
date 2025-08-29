import {Orden} from "@core/interfaces/notificaciones/crear-orden/crear-orden.interface"
import {ESTADO_CEDULA} from 'ngx-cfng-core-lib'

export const TIPO_FINALIDAD_NOTIFICACION = {
    code: 200,
    message: "OK",
    data: [
        {
            codigo: 1,
            nombre: 'Apertura de investigación preliminar',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 2,
            nombre: 'Apertura de proceso disciplinario',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 3,
            nombre: 'Archivo',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',

        },
        {
            codigo: 4,
            nombre: 'Cámara gesell',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] + [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 5,
            nombre: 'Disposición de investigación',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 6,
            nombre: 'Formalización',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 7,
            nombre: 'Para conocimiento',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 8,
            nombre: 'Principio de oportunidad',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        },
        {
            codigo: 9,
            nombre: 'Rechazo de plano',
            detalle: 'Por la presente, queda Usted debidamente NOTIFICADO con el contenido del documento [TIPO DE DOCUMENTO] [NRO. DE DOCUMENTO] de fecha [FECHA EMISIÓN DOCUMENTO], emitido por [NOMBRES Y APELLIDOS DEL EMISOR] del [DESPACHO FISCAL + FISCALÍA], el mismo que se adjunta para comunicar la finalidad de [FINALIDAD].',
        }
    ]
}

export const TIPO_FINALIDAD_CITACION = {
    code: 200,
    message: "OK",
    data: [
        {
            codigo: 10,
            nombre: 'Apertura de investigación preliminar',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 11,
            nombre: 'Audiencia',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 12,
            nombre: 'Audiencia de conciliación',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN] en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA] con motivo de [FINALIDAD] con motivo de [MOTIVO DE CONCILIACIÓN]. Deberá llegar minutos antes, portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD] con motivo de [MOTIVO DE CONCILIACIÓN]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 13,
            nombre: 'Cámara gesell',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 14,
            nombre: 'Cámara gesell - abogado defensor de imputado',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 15,
            nombre: 'Cámara gesell - abogado del detenido',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN] para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en el [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 16,
            nombre: 'Cámara gesell - agraviado mayor de edad',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN] para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en el [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 17,
            nombre: 'Cámara gesell - agraviado menor de edad',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN] para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en el [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 18,
            nombre: 'Cámara gesell - apoderado',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN] para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en el [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 19,
            nombre: 'Cámara gesell - imputado',
            detalle: 'Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], para la realización de las diligencias de [FINALIDAD] a favor del agraviado [INICIALES DEL AGRAVIADO] las cuales se llevarán a cabo en la Cámara Gesell [CÁMARA GESELL] ubicada en [DIRECCIÓN DE LA CÁMARA GESELL]. Deberá llegar minutos antes, portando su DNI. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 20,
            nombre: 'Citación / Declaración',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 21,
            nombre: 'Citación preexistencia',
            detalle: 'Se CITA a usted para que presente el documento [DOCUMENTO A RECIBIR] ante el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DEL DESPACHO FISCAL], en un plazo no mayor a [DÍAS HÁBILES] días hábiles contados a partir del día siguiente de recibida la presente cédula, con motivo de la realización de las diligencias de [FINALIDAD]. Deberá presentarse portando su DNI. Para mayor información, llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL] en caso tenga alguna pregunta al respecto.',
        },
        {
            codigo: 22,
            nombre: 'Constataciones inspección',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 23,
            nombre: 'Disposición de investigación',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 24,
            nombre: 'Para conocimiento',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        },
        {
            codigo: 25,
            nombre: 'Principio de oportunidad',
            detalle: '{P}Se CITA a usted para que se presente personalmente el día [FECHA DE CITACIÓN], a las [HORA DE CITACIÓN], en el [NOMBRE DEL DESPACHO FISCAL + NOMBRE DE LA FISCALÍA], ubicado en [DIRECCIÓN DE LA CITACIÓN + REFERENCIA], con motivo de [FINALIDAD]. Deberá llegar minutos antes portando su DNI{P}{V}Se CITA a usted a través de la plataforma Google Meet mediante el enlace [DIRECCIÓN URL] el día [FECHA DE CITACIÓN], A LAS [HORA DE CITACIÓN], con motivo de [FINALIDAD]. Deberá portar a la vista su DNI{V}. Para mayor información puede llamar al teléfono [TELÉFONO DEL DESPACHO FISCAL] anexo [ANEXO DEL DESPACHO FISCAL].',
        }
    ]
}

export const TIPO_URGENCIAS = {
    code: 200,
    message: 'OK',
    data: [
        {
            codigo: 1,
            nombre: 'Normal',
        },
        {
            codigo: 2,
            nombre: 'Urgente',
        },
        {
            codigo: 3,
            nombre: 'Muy urgente',
        }
    ]
}

export const OBTENER_DIRECCION_NOTIFICACION = {
    code: 200,
    message: 'OK',
    data: [
        {
            codigo: 1,
            nombre: 'Av. Pedro Miotta 685 - San Juan de Miraflores - Lima - Lima (validado)'
        }
    ]
}

export const OBTENER_DELITOS = {
    code: 200,
    message: 'OK',
    data: [
        {
            codigo: 1,
            nombre: "Contra la familia, omisión de asistencia familiar, omite cumplir su obligación de prestar alimentos"
        },
        {
            codigo: 2,
            nombre: "Contra el patrimonio, robo agravado (concurso de dos o más personas)"
        }
    ]
}

export const ESTRUCTURA_CREACION_ORDEN: Orden = {
    idCaso: "8273287372173821",
    idOrdenBD: '',
    idMovimientoCaso: "12321321321",
    codigoCaso: "506014703-2022-28-0",
    codigoFiscalia: "506014703",
    anhoRegistro: "2022",
    numeroCaso: "28",
    numeroCuaderno: "0",
    nombreFiscalOrden: "Sebastian Ramirez Meza",
    despachoFiscalOrden: '01° DESPACHO',
    fiscaliaOrden: '02° FISCALÍA PROVINCIAL DE TRANS. CORP. ESP. EN VIOLENCIA CONTRA LA MUJER Y LOS INTEGRANTES DEL GRUPO FAMILIAR',
    direccionDespachoOrden: 'Jr. Lampa 584 Piso 5, Lima, Lima, Lima',
    telefonoDespachoOrden: '01 625-5555',
    anexoDespachoOrden: '7566',
    idFinalidadOrden: 10,
    finalidadOrden: 'Finalidad',
    idTipoDocumentoOrden: 1,
    descripcionTipoDocumentoOrden: "Disposición de Archivo",
    numeroDocumentoOrden: "001-1°CLD-2023",
    fechaEmisionDocumentoOrden: "02/08/2023",
    numeroFojasOrden: "12",
    descripcionOrden: "Por la presente, queda Usted debidamente NOTIFICADO con el contenido de la Disposición de archivo: N° 00001-2022 con fecha del 27 de febrero del 2023 a folios 12,  emitida por el Sr(a). FISCAL SEBASTIAN RAMIREZ MEZA - cuya impresión adjunta, para su conicimiento y fines pertinentes.",
    archivosAdjuntosEfe: [],
    archivosAdjuntosGenerador: [],
    personasANotificar: [
      {
        idSujeto: 'F8B9A2E3C1D4F0576A25D6E81B94C72910A0A5C28',
        idSujetoBD: '',
        nombreSujeto: "Nathaly Fernández Gamarra",
        tipoSujeto: "Imputado",
        idPersona: "123456",
        cedula: {
          editado: false,
          idUrgenciaCedula: 1,
          urgenciaCedula: "Muy Urgente",
          idFinalidadCedula: 10,
          finalidadCedula: 'Finalidad',
          descripcionCedula: "Por la presente, queda Usted debidamente NOTIFICADO con el contenido de la Disposición de archivo: N° 00001-2022 con fecha del 27 de febrero del 2023 a folios 12,  emitida por el Sr(a). FISCAL SEBASTIAN RAMIREZ MEZA - cuya impresión adjunta, para su conicimiento y fines pertinentes.",
          delitosCedula: [
            {
              idDelitoSujeto: 1,
              idDelitoGenerico: 1,
              idDelitoSubgenerico: 10,
              idDelitoEspecifico: 20,
              nombreDelito: "Delito contra la seguridad pública / Robo / Conducción en estado de ebriedad o drogadicción",
              seleccionado: true
            },
            {
              idDelitoSujeto: 2,
              idDelitoGenerico: 2,
              idDelitoSubgenerico: 11,
              idDelitoEspecifico: 21,
              nombreDelito: "Contra la vida, el cuerpo y la salud / robo / homicidio simple",
              seleccionado: false
            }
          ]
        },
        direccionesSeleccionadas: [
          {
            idNotificaCedula: '0776AD552453005EE063E13910AC27CD',
            numeroCedula: 'N-5061501012023100-2023-00005',
            idDireccion: '0776AD552455005EE063E13910AC27CD',
            tipoDireccion: "RENIEC",
            nombreDireccion: "Av.tupac Amaru 210 Urb.valdiviezo - San Martin De Porres - Lima - Lima",
            referenciaDireccion: "Al frente del parque Julio C. Tello",
            enviarA: "central",
            estado: {
              actual: ESTADO_CEDULA.POR_GENERAR,
              firmado: false,
              enviado: false,
              anulado: false,
            }
          }
        ]
      }
    ]
}


export const CAMARAS_GESELL = {
    code: 200,
    message: 'OK',
    data: [
        {
            id: 1,
            nombre: "Chorrillos",
            direccion: "Jirón Genaro Numa Llona Nº 135",
        },
        {
            id: 2,
            nombre: "El Agustino",
            direccion: "Jr. San José N° 210",
        },
        {
            id: 3,
            nombre: "Huaycan",
            direccion: "Av. 15 de Julio Lote 12 Zona E",
        },
        {
            id: 4,
            nombre: "Jesus Maria",
            direccion: "Jr. Rio de Janeiro 501",
        },
        {
            id: 5,
            nombre: "La Molina",
            direccion: "Av. La Molina cuadra 36 S/N",
        },
        {
            id: 6,
            nombre: "Raimondy",
            direccion: "Jr. Antonio Raimondy cuadra 1",
        },
        {
            id: 7,
            nombre: "Santa Anita",
            direccion: "Av. Los Eucaliptos cuadra 12",
        },
        {
            id: 8,
            nombre: "Azángaro",
            direccion: "Jr. Azangaro 374",
        },
        {
            id: 9,
            nombre: "Villa El Salvador",
            direccion: "Av. Pastor Sevilla Mz. L Lote 3 (5to. Piso). Grupo Residencial 22A, Sector Primero, Pueblo Joven, VES",
        },
        {
            id: 10,
            nombre: "Villa María del Triunfo",
            direccion: "Av. Villa María N°284, Villa María del Triunfo",
        }
    ]
}

export const SUJETOS_PROCESALES_POR_TIPO = [
    {
        idSujetoCaso: "08E6F240C3AEDD60BF1E2D0A744832499F869D7F",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Juan Perez Garcia",
        edadSujeto: "12"
    },
    {
        idSujetoCaso: "2B9DC0E2D54670C8A5FA6D66A031246E02A6C3FD",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Lucas Torres Zapata",
        edadSujeto: "6"
    },
    {
        idSujetoCaso: "1F903C0B4F86CB03F4D7F9C7B140EC28BBE14F53",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Lilia Palomino Jimenez",
        edadSujeto: "7"
    },
    {
        idSujetoCaso: "2B1F4C7733F5F964FB8E20C00DB33B4F4B7D9C72",
        tipoSujeto: "Denunciado",
        nombreSujeto: "Javier González Fernández",
        edadSujeto: "34"
    },
    {
        idSujetoCaso: "36F41B7688C529D833D84A4E795F7FAA132C8C63",
        tipoSujeto: "Denunciado",
        nombreSujeto: "Carlos Martínez Sánchez",
        edadSujeto: "30"
    },
    {
        idSujetoCaso: "152AED87C8CC0BC15867BBAB3E6A5C65EFD3FCD9",
        tipoSujeto: "Denunciante",
        nombreSujeto: "Laura López García",
        edadSujeto: "25"
    },
    {
        idSujetoCaso: "1E7D45C1F6DFE406D58F529075AC981D65C87D19",
        tipoSujeto: "Denunciante",
        nombreSujeto: "María Rodríguez Pérez",
        edadSujeto: "24"
    }
]

export const SUJETOS_PROCESALES_AGRAVIADOS = [
    {
        idSujetoCaso: "08E6F240C3AEDD60BF1E2D0A744832499F869D7F",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Juan Perez Garcia",
        edadSujeto: "12"
    },
    {
        idSujetoCaso: "2B9DC0E2D54670C8A5FA6D66A031246E02A6C3FD",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Lucas Torres Zapata",
        edadSujeto: "6"
    },
    {
        idSujetoCaso: "1F903C0B4F86CB03F4D7F9C7B140EC28BBE14F53",
        tipoSujeto: "Agraviado",
        nombreSujeto: "Lilia Palomino Jimenez",
        edadSujeto: "7"
    },
]

export const SUJETOS_PROCESALES_DENUNCIADOS = [
    {
        idSujetoCaso: "2B1F4C7733F5F964FB8E20C00DB33B4F4B7D9C72",
        tipoSujeto: "Denunciado",
        nombreSujeto: "Javier González Fernández",
        edadSujeto: "34"
    },
    {
        idSujetoCaso: "36F41B7688C529D833D84A4E795F7FAA132C8C63",
        tipoSujeto: "Denunciado",
        nombreSujeto: "Carlos Martínez Sánchez",
        edadSujeto: "30"
    },
]
