import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { OrientacionType } from '@core/types/exportar.type';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ArchivoExportService {
  constructor() {}

  generatePDF(
    data: any[],
    headers: string[],
    fileName: string,
    orientation: OrientacionType = 'portrait'
  ) {
    const doc = new jsPDF.default(orientation, 'px', 'a4');
    const startY = 20;

    const columnStyles = {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 'auto' },
      8: { cellWidth: 'auto' },
      9: { cellWidth: 'auto' },
    };

    (doc as any).autoTable({
      head: [headers],
      body: data.map((row) => [
        row.nroCaso,
        row.origen,
        this.convertirTexto(row.nombreRemitente),
        row.telefono,
        row.correo,
        row.fechaIngreso,
        row.horaIngreso,
        row.fechaAnulacion,
        row.horaAnulacion,
      ]),
      startY,
      styles: {
        theme: 'grid',
        cellWidth: 'auto',
        valign: 'middle',
        halign: 'center',
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [14, 46, 74],
        textColor: 255,
      },
      margin: 10,
      didDrawPage: () => {
        (doc as any).setFontSize(12);
        (doc as any).setTextColor(40);
        //(doc as any).setFontStyle('bold');
        //(doc as any).text('Casos Anulados', dataArg.settings.margin.left, 20);
      },
    });

    doc.save(`${fileName}.pdf`);
  }

  generateExcel(data: any[], columns: string[], fileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        'N° de caso': row.nuCaso,
        Origen: row.origen,
        Remitente: `${row.tipoRemitente} ${row.nombreRemitente} ${row.apPaternoRemitente} ${row.apMaternoRemitente}`,
        'Contacto de remitente': `${
          row.contactos.vtelefono ? 'Teléfono: ' + row.contactos.vtelefono : ''
        } ${
          row.contactos.ncelular ? 'Celular: ' + row.contactos.ncelular : ''
        } ${row.contactos.vcorreo ? 'Correo: ' + row.contactos.vcorreo : ''}`,
        'Fecha ingreso': format(new Date(row.feIngreso), 'dd/MM/yyyy'),
        'Fecha anulacion': format(new Date(row.feAnulacion), 'dd/MM/yyyy'),
      }))
    );

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}.xlsx`);
  }

  convertirTexto(texto: string): string {
    const palabras = texto.split(' ');
    const textoConvertido = palabras.map((palabra) => {
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    });

    return textoConvertido.join(' ');
  }
}
