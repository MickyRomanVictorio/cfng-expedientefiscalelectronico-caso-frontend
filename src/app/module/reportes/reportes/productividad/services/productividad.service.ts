import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FiscalDespachoRequest,
  FiscalDespachoResponse,
  ProductividadRequest,
  ProductividadResponse,
} from '@modules/reportes/reportes/productividad/models/productividad.model';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { OrientacionType } from '@core/types/exportar.type';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductividadService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = `${BACKEND.CFE_REPORTES}/cfe/generales/reportes/v1/e/productividad`;

  listarProductividad(
    request: ProductividadRequest
  ): Observable<ProductividadResponse[]> {
    return this.http.post<ProductividadResponse[]>(
      `${this.BASE_URL}/listar`,
      request
    );
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  public getBase64Image(imageUrl: string): Promise<string> {
    return this.http
      .get(imageUrl, { responseType: 'blob' })
      .toPromise()
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            if (!blob) {
              return reject('Error: No se pudo obtener la imagen.');
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          })
      );
  }

  private formatDisplayDate(dateStr: string): string {
    if (dateStr && dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }

  exportarAPdf(
    datos: any[],
    cabeceras: string[],
    nombreArchivo: string,
    orientacion: OrientacionType = 'landscape',
    logoImage: string,
    headerText2: string,
    headerDateRange: string,
    total: number,
    usuario: string,
    fecha: string,
    hora: string
  ): void {
    const pdf = new jsPDF.default(orientacion, 'px', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    //Logo
    const imageWidth = 110;
    const imageHeight = 50;
    const headerY = margin;
    pdf.addImage(logoImage, 'JPEG', margin, headerY, imageWidth, imageHeight);

    pdf.setFontSize(10);
    pdf.text(
      'Año de la unidad, la paz y el desarollo',
      pageWidth - margin,
      headerY + 15,
      { align: 'right' }
    );
    pdf.text(headerText2, pageWidth - margin, headerY + 25, { align: 'right' });

    // Línea separadora debajo del encabezado.
    const lineY = headerY + imageHeight + 5;
    pdf.setLineWidth(1);
    pdf.line(margin, lineY, pageWidth - margin, lineY);

    //Titulo
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const titulo = 'Reporte Masivo de Productividad';
    pdf.text(titulo, pageWidth / 2, lineY + 30, { align: 'center' });

    // Datos de rango y total
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // const formattedDesde = this.formatDisplayDate(rangoFechas.desde);
    // const formattedHasta = this.formatDisplayDate(rangoFechas.hasta);
    // pdf.text(
    //   `Rango desde: ${formattedDesde} Hasta: ${formattedHasta}`,
    //   pageWidth / 2,
    //   lineY + 45,
    //   { align: 'center' }
    // );

    // if (rangoFechas.hasta) {
    //   const formattedDesde = this.formatDisplayDate(rangoFechas.desde);
    //   const formattedHasta = this.formatDisplayDate(rangoFechas.hasta);
    //   pdf.text(
    //     `Rango desde: ${formattedDesde} Hasta: ${formattedHasta}`,
    //     pageWidth / 2,
    //     lineY + 45,
    //     { align: 'center' }
    //   );
    // } else {
    //   // Caso anual o mensual: se imprime directamente el valor de "desde"
    //   pdf.text(rangoFechas.desde, pageWidth / 2, lineY + 45, {
    //     align: 'center',
    //   });
    // }
    pdf.text(headerDateRange, pageWidth / 2, lineY + 45, { align: 'center' });

    pdf.text(`Total: ${total}`, pageWidth - margin, lineY + 45, {
      align: 'right',
    });

    const tableStartY = lineY + 60;
    const tableBody = datos.map((item) =>
      cabeceras.map((cabecera) => item[cabecera])
    );

    const leftMargin = 20;

    (pdf as any).autoTable({
      head: [cabeceras],
      body: tableBody,
      startY: tableStartY,
      margin: { left: leftMargin, right: margin, bottom: 50 },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: 255,
        fontStyle: 'bold',
        fontSiza: 8,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        3: { cellWidth: 60 },
        4: { cellWidth: 100 },
      },
      theme: 'grid',
      showHead: 'everyPage',
      tableWidth: 'wrap',
      pageBreak: 'auto',
      //Pie
      // didDrawPage: (data: any) => {
      //   // Obtener número de página CORRECTAMENTE
      //   // const currentPage = pdf.getNumberOfPages();
      //   // const footerY = pdf.internal.pageSize.getHeight() + 20;
      //   const footerY = data.cursor.y + 20;

      //   pdf.setFontSize(8);
      //   pdf.text(`Usuario: ${usuario}`, margin, footerY);
      //   pdf.text(`Fecha: ${fecha} ${hora}`, pageWidth / 2, footerY, {
      //     align: 'center',
      //   });

      //   // const totalPages = pdf.getNumberOfPages();
      //   // Texto temporal (se actualizará al final)
      //   pdf.text(
      //     `Página ${data.pageNumber} de ${totalPagesExp}`,
      //     pageWidth - margin,
      //     footerY,
      //     {
      //       align: 'right',
      //     }
      //   );
      // },
    });

    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 30;
      pdf.setFontSize(8);
      // A la izquierda: Usuario
      pdf.text(`Usuario: ${usuario}`, margin, footerY, { align: 'left' });
      // En el centro: Fecha y Hora
      pdf.text(`Fecha: ${fecha}   Hora: ${hora}`, pageWidth / 2, footerY, {
        align: 'center',
      });
      // A la derecha: Numeración de página
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, footerY, {
        align: 'right',
      });
    }

    pdf.save(`${nombreArchivo}.pdf`);
  }
}
