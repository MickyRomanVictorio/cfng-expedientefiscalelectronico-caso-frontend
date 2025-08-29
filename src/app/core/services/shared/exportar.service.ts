import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as jsPDF from 'jspdf';
import { OrientacionType } from '@core/types/exportar.type';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class ExportarService {
  exportarAPdf(
    datos: any[],
    cabeceras: string[],
    nombreArchivo: string,
    orientacion: OrientacionType = 'portrait',
    titulo?: string
  ): void {
    const pdf = new jsPDF.default(orientacion, 'px', 'a4');

    if (titulo) {
      pdf.text(titulo, 14, 12);
    }

    const columns = cabeceras.map((header) => ({
      header,
      dataKey: header,
      width: 'auto',
    }));
    const rows = datos.map((item) => cabeceras.map((header) => item[header]));

    (pdf as any).autoTable({
      head: [columns.map((column) => column.header)],
      body: rows,
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
      margin: 15,
      didDrawPage: () => {
        (pdf as any).setFontSize(12);
        (pdf as any).setTextColor(40);
      },
    });

    pdf.save(`${nombreArchivo}.pdf`);
  }

  exportarAExcel(
    datos: any[],
    cabeceras: string[],
    nombreArchivo: string,
    titulo?: string
  ): void {
    // Create an empty worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.book_new();

    const dataStartRow = titulo ? 3 : 2; // Data starts from row 3 if title exists, otherwise row 2

    // Create an empty array to hold the Excel content
    const excelData: any[][] = [];

    // If title exists, add it to the first row
    if (titulo) {
      excelData.push([titulo]); // Row 1
      // excelData.push([]); // Empty row to separate title and headers
    }

    // Add headers
    excelData.push(cabeceras);

    // Add data rows
    datos.forEach((item) => {
      excelData.push(cabeceras.map((header) => item[header])); // Ensure column order matches headers
    });

    // Convert data to worksheet
    const sheet = XLSX.utils.aoa_to_sheet(excelData);

    // Create a workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { data: sheet },
      SheetNames: ['data'],
    };

    // Convert workbook to Excel buffer
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create a Blob and trigger download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(blob, `${nombreArchivo}.xlsx`);
  }
}
