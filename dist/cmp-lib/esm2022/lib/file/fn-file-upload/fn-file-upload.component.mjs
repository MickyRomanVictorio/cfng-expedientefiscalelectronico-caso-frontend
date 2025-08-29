import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
//mpfn
import { iFileUpload, iTrash, iFileImage, iFileVideo, iFileAudio, iFile, iEdit, iCheck } from "ngx-mpfn-dev-icojs-regular";
import { v4 as uuidv4 } from 'uuid';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
import * as i4 from "primeng/inputtext";
import * as i5 from "primeng/button";
import * as i6 from "primeng/progressbar";
import * as i7 from "primeng/messages";
import * as i8 from "primeng/radiobutton";
import * as i9 from "primeng/dropdown";
import * as i10 from "../../icon/icon.component";
const FILE_TYPE = Object.freeze({
    image: '.jpg, .jpeg, .png',
    video: '.h264, .3gp, .webm, .mkv, .mp4, .mov, .avi',
    audio: '.mp3, .aac, .wav',
    document: '.pdf, .doc, .docx, .ppt',
    pdf: '.pdf',
    excel: '.xls,.xlsx',
    get all() {
        return [this.image, this.video, this.audio, this.document].join();
    }
});
//descripción de extensión
const EXT_DESC = (type) => {
    return FILE_TYPE[type].replace(/,([^,]*)$/, ' O$1').replaceAll('.', '').toUpperCase();
};
const FILE_DESCRIPTION = {
    all: `Puede subir imágenes (${EXT_DESC('image')}), videos (${EXT_DESC('video')}), audios (${EXT_DESC('audio')}) y documentos (${EXT_DESC('document')}).`,
    image: `Puede subir imágenes (${EXT_DESC('image')}).`,
    video: `Puede subir videos (${EXT_DESC('video')}).`,
    audio: `Puede subir audios (${EXT_DESC('audio')}).`,
    document: `Puede subir documentos (${EXT_DESC('document')}).`,
    pdf: `Solo puede subir un documento en formato PDF.`,
    excel: `Solo puede subir un archivo en formato Excel.`,
};
const FORMAT_FILE_SIZE = (bytes, decimalPoint = 2) => {
    if (bytes == 0)
        return '0 Bytes';
    let k = 1024;
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPoint)) + ' ' + sizes[i];
};
export class FnFileUploadComponent {
    constructor(http, zone, renderer) {
        this.http = http;
        this.zone = zone;
        this.renderer = renderer;
        this.url = 'http://172.16.111.128:8081/ms-mesa/repositorio/676'; //endpoint
        this.deleteURL = 'http://172.16.111.128:8081/ms-mesa/repositorio/eliminar?url=';
        this.maxFileSize = 1048576; //1mb
        this.label = 'Subir documentos';
        this.type = 'all';
        this.headers = new HttpHeaders;
        this.disabled = false;
        this.multiple = true;
        this.files = [];
        this.perFileLabel = 'por archivo';
        this.firstLabel = 'Arrastra y suelta los archivos a subir o';
        this.isAccumulated = false; //Es acumulado, por defecto false. Indica que todo el peso de los archivos de todos los componentes tendran una sumatoria total que no debe superar a maxFileSize
        this.isInMemory = false; //La lógica de subida de files se mantiene en memoria y no envia al servidor
        this.sumSize = 0;
        this.sumSizeChange = new EventEmitter();
        this.isSignDigital = false; //Muestra otra lista de documentos adjuntos
        this.isSignMassive = false; //Oculta lista documentos adjuntos el formulario se hace en cada componente por agilidad y limitantes en este componente
        this.dataDropDown = [];
        this.dataDropDownSelected = null;
        this.dataRadioButton = [];
        this.filesChange = new EventEmitter();
        this.processSignDocument = new EventEmitter();
        this.invalidFileLimitMessageSummary = "Se ha excedido el número máximo de archivos, ";
        this.invalidFileLimitMessageDetail = "el límite es {0} como máximo.";
        //error msg for maxFileSize
        this.invalidFileSizeMessageSummary = "{0}: Tamaño de archivo no válido, ";
        this.invalidFileSizeMessageDetail = "el tamaño máximo de subida es {0}.";
        //tipo de archivo no permitido
        this.invalidFileTypeMessageSummary = '{0}: Tipo de archivo inválido, ';
        this.invalidFileTypeMessageDetail = 'tipo de archivos permitidos: {0}';
        //error maximo total de tamaño cuando isInMemory: true
        this.invalidmaxSizeLimitMessageSummary = "Se ha excedido en el limite total de los archivos {0}, ";
        this.invalidmaxSizeLimitMessageDetail = "el límite restante es de {0}";
        this.iFileUpload = iFileUpload;
        this.iTrashCan = iTrash;
        this.iFile = iFile;
        this.iEdit = iEdit;
        this.iCheck = iCheck;
        // public uploadedFiles: any[] = [];
        this.msgs = [];
        this.uploadingFile = false;
        this.tmpFormData = new FormData();
    }
    get acceptedFiles() {
        return FILE_TYPE[this.type];
    }
    get filesDescription() {
        if (this.type === 'pdf') {
            return this.fileLimit === 1 ? FILE_DESCRIPTION[this.type] : 'Solo puede subir documentos en formato PDF';
        }
        else {
            return FILE_DESCRIPTION[this.type];
        }
    }
    get titleDocumentUpload() {
        if (this.files.length === 1) {
            return 'Documento subido';
        }
        else {
            return 'Documentos subidos';
        }
    }
    get maxFileSizeDescription() {
        return FORMAT_FILE_SIZE(this.maxFileSize);
    }
    getFileSize(size) {
        return FORMAT_FILE_SIZE(size);
    }
    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            if (this.content) {
                this.dragOverListener = this.renderer.listen(this.content.nativeElement, 'dragover', this.onDragOver.bind(this));
            }
        });
    }
    getFileCategoryIcon(fileName) {
        const extension = fileName.slice(fileName.lastIndexOf('.'));
        if (FILE_TYPE.image.includes(extension))
            return iFileImage;
        else if (FILE_TYPE.audio.includes(extension))
            return iFileAudio;
        else if (FILE_TYPE.video.includes(extension))
            return iFileVideo;
        else
            return iFile;
    }
    /* public onUpload(e:any) {
      console.log('El e: ', e);
      
      console.log(e.originalEvent.body);
      for(let file of e.files) {
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2)
        });
      }
  
    } */
    chooseFile() {
        this.fileInput.nativeElement.click();
    }
    onFileUpload(event) {
        console.log(event);
    }
    //TODO: new component
    validate(file) {
        this.msgs = [];
        if (this.fileLimit && (this.fileLimit <= this.files.length)) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileLimitMessageSummary.replace('{0}', this.fileLimit.toString()),
                detail: this.invalidFileLimitMessageDetail.replace('{0}', this.fileLimit.toString())
            });
            return false;
        }
        if (this.isFileExists(file)) {
            this.msgs.push({
                severity: 'error',
                summary: `Archivo duplicado, `,
                detail: `el archivo ${file.name} ya ha sido subido.`
            });
            return false;
        }
        if (this.acceptedFiles && !this.isFileTypeValid(file)) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileTypeMessageSummary.replace('{0}', file.name),
                detail: this.invalidFileTypeMessageDetail.replace('{0}', this.acceptedFiles)
            });
            return false;
        }
        if (this.maxFileSize && file.size > this.maxFileSize) {
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileSizeMessageSummary.replace('{0}', file.name),
                detail: this.invalidFileSizeMessageDetail.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize))
            });
            this.processSignDocument.emit({ process: 3 });
            return false;
        }
        if (this.isInMemory || this.isAccumulated) {
            let sumFile = file.size;
            if ((this.sumSize + sumFile) > this.maxFileSize) {
                this.msgs.push({
                    severity: 'error',
                    summary: this.invalidmaxSizeLimitMessageSummary.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize)),
                    detail: this.invalidmaxSizeLimitMessageDetail.replace('{0}', FORMAT_FILE_SIZE(this.maxFileSize - this.sumSize))
                });
                this.processSignDocument.emit({ process: 3 });
                return false;
            }
        }
        return true;
    }
    isFileTypeValid(file) {
        let acceptableTypes = this.acceptedFiles?.split(',').map((type) => type.trim());
        for (let type of acceptableTypes) {
            let acceptable = this.isWildcard(type) ? this.getTypeClass(file.type) === this.getTypeClass(type) : file.type == type || this.getFileExtension(file).toLowerCase() === type.toLowerCase();
            if (acceptable) {
                return true;
            }
        }
        return false;
    }
    getTypeClass(fileType) {
        return fileType.substring(0, fileType.indexOf('/'));
    }
    isWildcard(fileType) {
        return fileType.indexOf('*') !== -1;
    }
    getFileExtension(file) {
        return '.' + file.name.split('.').pop();
    }
    isFileExists(file) {
        const fileFound = this.files.find(i => i.nombreOrigen === file.name);
        return fileFound && (fileFound.tamanyo === file.size);
    }
    onFileSelect(event) {
        let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        if (this.fileLimit && files.length > this.fileLimit) {
            this.msgs = [];
            this.msgs.push({
                severity: 'error',
                summary: this.invalidFileLimitMessageSummary.replace('{0}', this.fileLimit.toString()),
                detail: this.invalidFileLimitMessageDetail.replace('{0}', this.fileLimit.toString())
            });
            return;
        }
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (this.validate(file)) {
                if (!this.isInMemory) {
                    this.uploadingFile = true;
                    this.tmpFormData = new FormData();
                    this.tmpFormData.append('file', file);
                    /* const headers = new HttpHeaders()
                      .set('Authorization', 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJST0JFUlQgWkFDSEFSWSBFU1BJTk9aQSBDRVNQRURFUyIsImlzcyI6Imh0dHA6Ly8xODEuMTc2LjE0NS4xNTU6NzA4My9jZmV0b2tlbi9yZXNvdXJjZXMvdjIvbG9naW5Ub2tlbiIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6eyJlc3RhZG8iOiIwMSIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6IjEwNzY0MjY0IiwiaW5mbyI6eyJhcGVsbGlkb1BhdGVybm8iOiJFU1BJTk9aQSIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJkbmkiOiIxMDc2NDI2NCIsIm5vbWJyZXMiOiJST0JFUlQgWkFDSEFSWSIsImFwZWxsaWRvTWF0ZXJubyI6IkNFU1BFREVTIn0sImNvZERlcGVuZGVuY2lhIjoiNDAwNjAxNDUwNCIsImRlcGVuZGVuY2lhIjoiNMKwIEZJU0NBTElBIFBST1ZJTkNJQUwgUEVOQUwgQ09SUE9SQVRJVkEgREUgVkVOVEFOSUxMQSIsImNvZERlc3BhY2hvIjoiNDAwNjAxNDUwNC0yIiwic2VkZSI6IkNPUlBPUkFUSVZBIiwiZGVzcGFjaG8iOiIywrAgREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjAwMTAwIiwiY2FyZ28iOiJGSVNDQUwgUFJPVklOQ0lBTCIsImNvZERpc3RyaXRvRmlzY2FsIjoiMDA0NyIsImRpc3RyaXRvRmlzY2FsIjoiRElTVFJJVE8gRklTQ0FMIERFIExJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiIxMDc2NDI2NCIsImRpcmVjY2lvbiI6IkFBLiBISC4gTE9TIExJQ0VOQ0lBRE9TIE1aLiBWLSAzIExPVEUgMzMgLSBWRU5UQU5JTExBIiwiZmlzY2FsIjoiUk9CRVJUIFpBQ0hBUlkgRVNQSU5PWkEgQ0VTUEVERVMiLCJjb3JyZW9GaXNjYWwiOiJjcmlzb3RnQGhvdG1haWwuY29tIiwiY29kSmVyYXJxdWlhIjoiMDEiLCJjb2RDYXRlZ29yaWEiOiIwMSIsImNvZEVzcGVjaWFsaWRhZCI6IjAxIiwidWJpZ2VvIjoiMDcwMTA2IiwiZGlzdHJpdG8iOiJWRU5UQU5JTExBIiwiY29ycmVvIjoiY3Jpc290Z0Bob3RtYWlsLmNvbSIsInRlbGVmb25vIjoiIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDMiLCIwNCIsIjA3IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMjgiLCIzMSIsIjQ2IiwiNTAiXSwicGVyZmlsZXMiOlsiMDMiXX0seyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6W10sInBlcmZpbGVzIjpbIjExIl19LHsiY29kaWdvIjoiMjAwIiwib3BjaW9uZXMiOlsiMjAwLTAxIiwiMjAwLTAzIiwiMjAwLTA0IiwiMjAwLTA2IiwiMjAwLTA5Il0sInBlcmZpbGVzIjpbIjI1IiwiMjkiLCIzMSJdfSx7ImNvZGlnbyI6IjE1NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDQiLCIwNSIsIjA2IiwiMDciLCIwOCIsIjA5Il0sInBlcmZpbGVzIjpbIjIxIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIl0sInBlcmZpbGVzIjpbIjY0Il19XX0sImlhdCI6MTYyNTc4NjY5NSwiZXhwIjoxNzgzNTUzMDk1fQ.MYVn7aUf-CWoZaNqRvoCSAUz1t1J3LOsVos2SAQj1orveXvYg1onhCRe9PbRkXBbMQvCZIAt0JgEkLKxzfjmMw') */
                    this.http.post(`${this.url}`, this.tmpFormData)
                        .subscribe({
                        next: (res) => {
                            this.uploadingFile = false;
                            this.setFilesSaved(file, res.data);
                            // this.files.push(res.data);
                        },
                        error: (error) => {
                            this.uploadingFile = false;
                            this.msgs = [];
                            this.msgs.push({
                                severity: 'error',
                                summary: 'Error: ',
                                detail: `el archivo ${file.name} no pudo ser cargado.`
                            });
                        }
                    });
                    // this.files.push(file.name)
                    /* this.files.push({
                      id: 40311 + i + 1,
                      carpeta: "mesa-partes/anexos",
                      extension: "pdf",
                      mimetype: "application/pdf",
                      path: "mesa-partes/anexos/anexo1.pdf",
                      tags: [],
                      detalle: {},
                      nombre: `${file.name}`,
                      tamanyo: file.size,
                      paginas: 1,
                      archivo: 623312,
                      fecCreacion: "2023-05-25 19:25:06",
                      fecModificacion: "2023-05-25 19:25:06",
                      nombreUsuarioCreacion: "",
                      nombreUsuarioModificacion: ''
                    }) */
                }
                else {
                    let data = { nombreArchivo: file.name, numeroFolios: 0 };
                    this.setFilesSaved(file, data);
                    /* let info={
                       id: uuidv4(),
                       file: file,
                       nombre: file.name,
                       nombreOrigen: file.name,
                       tamanyo: file.size
                     }
                     this.files.push(info);
                     this.getCurrentSumSize(); */
                }
            }
        }
    }
    setFilesSaved(file, data) {
        let isFocus = this.files.length === 0 ? true : false;
        let isFirst = this.files.length === 0 ? true : false;
        let info = {
            id: uuidv4(),
            file: file,
            nombre: data.nombreArchivo,
            numeroFolios: data.numeroFolios,
            nombreOrigen: file.name,
            tamanyo: file.size,
            dataSelected: this.dataDropDownSelected,
            descriptionDocument: null,
            observationDocument: null,
            nombreRadio: null,
            optionRadio: null,
            isSign: false,
            isFocus: isFocus,
            isFirst: isFirst,
            process: 0 //0 para visualizar, 1 para firmar, 2 eliminar, 3 se supero peso máximo permito
        };
        this.files.push(info);
        this.getCurrentSumSize();
        if (isFocus)
            this.processSignDocument.emit(info);
    }
    /*emitterFirstFile(): void {
      this.files[0].isFocus = true
      this.processSignDocument.emit(this.files[0])
    }*/
    getCurrentSumSize() {
        this.sumSize = this.files.map(file => file.tamanyo)
            .reduce((acc, value) => acc + value, 0);
        this.sumSizeChange.emit(this.sumSize);
    }
    showDocument(file) {
        if (!file.isFocus) {
            this.files.map(fileArray => {
                if (fileArray.id === file.id)
                    fileArray.isFocus = true;
                else
                    fileArray.isFocus = false;
            });
            file.process = 0;
            this.processSignDocument.emit(file);
        }
    }
    signDocument(file) {
        /*VALIDACION FILE*/
        this.msgs = [];
        if (file.dataSelected === null || file.dataSelected.code === 'TDD') {
            this.msgs.push({
                severity: 'error',
                summary: 'Tipo de documento',
                detail: 'Seleccione un tipo de documento'
            });
            return false;
        }
        if (file.descriptionDocument === null || file.descriptionDocument === '') {
            this.msgs.push({
                severity: 'error',
                summary: 'Número de documento',
                detail: 'Dígite descripción de número de documento'
            });
            return false;
        }
        if (file.descriptionDocument.trim().length > 60) {
            this.msgs.push({
                severity: 'error',
                summary: 'Número de documento',
                detail: 'La descripción de número de documento no debe superar los 60 caracteres'
            });
            return false;
        }
        if (file.optionRadio === null || file.optionRadio === '') {
            this.msgs.push({
                severity: 'error',
                summary: 'Tipo de copia',
                detail: 'Seleccione un tipo de copia válido'
            });
            return false;
        }
        if (!file.isFocus) {
            this.files.map(fileArray => {
                if (fileArray.id === file.id)
                    fileArray.isFocus = true;
                else
                    fileArray.isFocus = false;
            });
        }
        file.process = 1;
        this.processSignDocument.emit(file);
        return true;
    }
    onDragEnter(e) {
        if (!this.disabled) {
            e.stopPropagation();
            e.preventDefault();
        }
    }
    onDragOver(e) {
        if (!this.disabled) {
            /* DomHandler.addClass(this.content?.nativeElement, 'p-fileupload-highlight');
            this.dragHighlight = true; */
            e.stopPropagation();
            e.preventDefault();
        }
    }
    onDragLeave(event) {
        if (!this.disabled) {
            // DomHandler.removeClass(this.content?.nativeElement, 'p-fileupload-highlight');
        }
    }
    onDrop(event) {
        if (!this.disabled) {
            // DomHandler.removeClass(this.content?.nativeElement, 'p-fileupload-highlight');
            event.stopPropagation();
            event.preventDefault();
            let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
            let allowDrop = this.multiple || (files && files.length === 1);
            if (allowDrop) {
                this.onFileSelect(event);
            }
        }
    }
    /* public onDeleteFile(id: number) {
      const indexToDelete = this.files.findIndex(i => i.id === id);
      // Remove via api await
      this.files.splice(indexToDelete, 1);
    } */
    removeAttachment(file) {
        if (!this.isInMemory) {
            /* const headers = new HttpHeaders()
                  .set('Authorization', 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJST0JFUlQgWkFDSEFSWSBFU1BJTk9aQSBDRVNQRURFUyIsImlzcyI6Imh0dHA6Ly8xODEuMTc2LjE0NS4xNTU6NzA4My9jZmV0b2tlbi9yZXNvdXJjZXMvdjIvbG9naW5Ub2tlbiIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6eyJlc3RhZG8iOiIwMSIsImlwIjoiMTkyLjE2OC4xLjE0IiwidXN1YXJpbyI6IjEwNzY0MjY0IiwiaW5mbyI6eyJhcGVsbGlkb1BhdGVybm8iOiJFU1BJTk9aQSIsImVzUHJpbWVyTG9naW4iOmZhbHNlLCJkbmkiOiIxMDc2NDI2NCIsIm5vbWJyZXMiOiJST0JFUlQgWkFDSEFSWSIsImFwZWxsaWRvTWF0ZXJubyI6IkNFU1BFREVTIn0sImNvZERlcGVuZGVuY2lhIjoiNDAwNjAxNDUwNCIsImRlcGVuZGVuY2lhIjoiNMKwIEZJU0NBTElBIFBST1ZJTkNJQUwgUEVOQUwgQ09SUE9SQVRJVkEgREUgVkVOVEFOSUxMQSIsImNvZERlc3BhY2hvIjoiNDAwNjAxNDUwNC0yIiwic2VkZSI6IkNPUlBPUkFUSVZBIiwiZGVzcGFjaG8iOiIywrAgREVTUEFDSE8iLCJjb2RDYXJnbyI6IkZQIiwiY29kU2VkZSI6IjAwMTAwIiwiY2FyZ28iOiJGSVNDQUwgUFJPVklOQ0lBTCIsImNvZERpc3RyaXRvRmlzY2FsIjoiMDA0NyIsImRpc3RyaXRvRmlzY2FsIjoiRElTVFJJVE8gRklTQ0FMIERFIExJTUEgTk9ST0VTVEUiLCJkbmlGaXNjYWwiOiIxMDc2NDI2NCIsImRpcmVjY2lvbiI6IkFBLiBISC4gTE9TIExJQ0VOQ0lBRE9TIE1aLiBWLSAzIExPVEUgMzMgLSBWRU5UQU5JTExBIiwiZmlzY2FsIjoiUk9CRVJUIFpBQ0hBUlkgRVNQSU5PWkEgQ0VTUEVERVMiLCJjb3JyZW9GaXNjYWwiOiJjcmlzb3RnQGhvdG1haWwuY29tIiwiY29kSmVyYXJxdWlhIjoiMDEiLCJjb2RDYXRlZ29yaWEiOiIwMSIsImNvZEVzcGVjaWFsaWRhZCI6IjAxIiwidWJpZ2VvIjoiMDcwMTA2IiwiZGlzdHJpdG8iOiJWRU5UQU5JTExBIiwiY29ycmVvIjoiY3Jpc290Z0Bob3RtYWlsLmNvbSIsInRlbGVmb25vIjoiIiwic2lzdGVtYXMiOlt7ImNvZGlnbyI6IjE0NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDMiLCIwNCIsIjA3IiwiMjEiLCIyMiIsIjIzIiwiMjQiLCIyNSIsIjI2IiwiMjgiLCIzMSIsIjQ2IiwiNTAiXSwicGVyZmlsZXMiOlsiMDMiXX0seyJjb2RpZ28iOiIxNDciLCJvcGNpb25lcyI6W10sInBlcmZpbGVzIjpbIjExIl19LHsiY29kaWdvIjoiMjAwIiwib3BjaW9uZXMiOlsiMjAwLTAxIiwiMjAwLTAzIiwiMjAwLTA0IiwiMjAwLTA2IiwiMjAwLTA5Il0sInBlcmZpbGVzIjpbIjI1IiwiMjkiLCIzMSJdfSx7ImNvZGlnbyI6IjE1NSIsIm9wY2lvbmVzIjpbIjAyIiwiMDQiLCIwNSIsIjA2IiwiMDciLCIwOCIsIjA5Il0sInBlcmZpbGVzIjpbIjIxIl19LHsiY29kaWdvIjoiMjAzIiwib3BjaW9uZXMiOlsiMjAzLTAxIiwiMjAzLTAyIl0sInBlcmZpbGVzIjpbIjY0Il19XX0sImlhdCI6MTYyNTc4NjY5NSwiZXhwIjoxNzgzNTUzMDk1fQ.MYVn7aUf-CWoZaNqRvoCSAUz1t1J3LOsVos2SAQj1orveXvYg1onhCRe9PbRkXBbMQvCZIAt0JgEkLKxzfjmMw') */
            this.http.delete(`${this.deleteURL}${file.name}`).subscribe({
                next: (res) => {
                    const indexToDelete = this.files.findIndex(i => i.id === file.id);
                    this.files.splice(indexToDelete, 1);
                    this.msgs = [];
                    this.msgs.push({
                        severity: 'success',
                        summary: `${file.nombreOrigen}: `,
                        detail: `El anexo fue eliminado satisfactoriamente.`
                    });
                    file.process = 2; //eliminar
                    this.processSignDocument.emit(file);
                },
                error: (error) => {
                    this.msgs = [];
                    this.msgs.push({
                        severity: 'error',
                        summary: `${file.nombreOrigen}: `,
                        detail: `El archivo no pudo ser removido.`
                    });
                }
            });
        }
        else {
            const indexToDelete = this.files.findIndex(i => i.id === file.id);
            this.files.splice(indexToDelete, 1);
            this.getCurrentSumSize();
            this.msgs = [];
            this.msgs.push({
                severity: 'success',
                summary: `${file.nombreOrigen}: `,
                detail: `El anexo fue eliminado satisfactoriamente.`
            });
            file.process = 2; //eliminar
            this.processSignDocument.emit(file);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnFileUploadComponent, deps: [{ token: i1.HttpClient }, { token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.1.3", type: FnFileUploadComponent, selector: "fn-file-upload", inputs: { url: "url", deleteURL: "deleteURL", maxFileSize: "maxFileSize", label: "label", type: "type", fileLimit: "fileLimit", headers: "headers", disabled: "disabled", multiple: "multiple", files: "files", perFileLabel: "perFileLabel", firstLabel: "firstLabel", isAccumulated: "isAccumulated", isInMemory: "isInMemory", sumSize: "sumSize", isSignDigital: "isSignDigital", isSignMassive: "isSignMassive", dataDropDown: "dataDropDown", dataDropDownSelected: "dataDropDownSelected", dataRadioButton: "dataRadioButton" }, outputs: { sumSizeChange: "sumSizeChange", filesChange: "filesChange", processSignDocument: "processSignDocument" }, viewQueries: [{ propertyName: "fileInput", first: true, predicate: ["fileInput"], descendants: true }, { propertyName: "content", first: true, predicate: ["content"], descendants: true }], ngImport: i0, template: "<div class=\"field\">\r\n  <label *ngIf=\"!isSignDigital\" class=\"block text-sm font-semibold\">{{ label }}</label>\r\n\r\n  <div #content (dragenter)=\"onDragEnter($event)\" (dragleave)=\"onDragLeave($event)\" (drop)=\"onDrop($event)\"\r\n    class=\"flex flex-column align-items-center border-dashed border-round border-2 select-none surface-border\"\r\n    [ngClass]=\"isSignDigital ? 'p-3' : 'p-6'\">\r\n    <div *ngIf=\"uploadingFile\" class=\"w-full -mt-3 mb-5\">\r\n      <p-progressBar mode=\"indeterminate\" [style]=\"{ height: '6px' }\"></p-progressBar>\r\n    </div>\r\n    <p-messages [value]=\"msgs\" [enableService]=\"false\"></p-messages>\r\n\r\n    <fn-icon [ico]=\"iFileUpload\" height=\"2rem\" color=\"#B3B3B3\" class=\"mb-3 mt-3\"></fn-icon>\r\n    <div class=\"font-semibold\">\r\n      {{ firstLabel }}\r\n      <label (click)=\"chooseFile()\" class=\"text-blue-400 underline cursor-pointer\">\r\n        haz click aqu\u00ED\r\n      </label>\r\n      <input #fileInput class=\"hidden\" type=\"file\" [multiple]=\"multiple\" [disabled]=\"disabled\" [accept]=\"acceptedFiles\"\r\n        (change)=\"onFileSelect($event)\">\r\n    </div>\r\n    <p class=\"text-center px-6 text-700\">{{ filesDescription }}</p>\r\n    <p class=\"font-semibold text-sm text-700\">M\u00E1ximo {{ maxFileSizeDescription }} {{ perFileLabel }}</p>\r\n  </div>\r\n\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && !isSignDigital\">\r\n  <label class=\"block text-sm font-semibold\">{{ titleDocumentUpload }}</label>\r\n  <div class=\"flex justify-content-between align-items-center mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div class=\"flex align-items-center\">\r\n      <div class=\"surface-200 border-round px-1 py-2 flex align-items-center\">\r\n        <fn-icon [ico]=\"getFileCategoryIcon(file.nombre)\"></fn-icon>\r\n      </div>\r\n      <div class=\"ml-3\">\r\n        <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        {{ file.nombreOrigen }}\r\n        <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"flex align-items-center\">\r\n      {{getFileSize(file.tamanyo)}}\r\n      <p-button (onClick)=\"removeAttachment(file)\" class=\"ml-1\" styleClass=\"p-button-text\">\r\n        <fn-icon [ico]=\"iTrashCan\"></fn-icon>\r\n      </p-button>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && isSignDigital && !isSignMassive\">\r\n  <div class=\"mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div [ngClass]=\"file.isFocus ? 'bg-color' : 'null'\">\r\n      <div class=\"flex justify-content-between align-items-center\">\r\n        <div class=\"flex flex-wrap cursor-pointer\" (click)=\"showDocument(file)\">\r\n          <fn-icon [ico]=\"iFile\" height=\"1.1rem\"></fn-icon>\r\n          <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        </div>\r\n        <div class=\"flex flex-wrap border-round flex align-items-center\">\r\n          <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n          <span class=\"fontsize-10 ml-1 mr-2\">{{getFileSize(file.tamanyo)}}</span>\r\n          <p-button *ngIf=\"!file.isSign\" (onClick)=\"signDocument(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iEdit\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button *ngIf=\"file.isSign\" styleClass=\"p-button-text refactor\" [disabled]=\"true\">\r\n            <fn-icon [ico]=\"iCheck\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button (onClick)=\"removeAttachment(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iTrashCan\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n        </div>\r\n      </div>\r\n      <div class=\"ml-3 cursor-pointer\" (click)=\"showDocument(file)\">  {{ file.nombreOrigen }} </div>\r\n    </div>\r\n\r\n    <div class=\"flex justify-content-between align-items-center gap-3 mt-2\">\r\n      <p-dropdown [options]=\"dataDropDown\" [disabled]=\"file.isSign\" [(ngModel)]=\"file.dataSelected\"\r\n        optionLabel=\"label\"></p-dropdown>\r\n      <input class=\"flex-1\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.descriptionDocument\"\r\n        [disabled]=\"file.isSign\" placeholder=\"Ingresar el n\u00FAmero del documento\" />\r\n    </div>\r\n    <div class=\"flex justify-content-between align-items-center mt-2\">\r\n      <div *ngIf=\"!file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div *ngFor=\"let dataRadio of dataRadioButton; index as i;\">\r\n          <div class=\"flex align-items-center\">\r\n            <p-radioButton name=\"typecopy\" value=\"{{dataRadio.id}}\" [(ngModel)]=\"file.optionRadio\"\r\n              inputId=\"or{{i}}{{file.id}}\" (onClick)=\"file.nombreRadio = dataRadio.noDescripcion\"></p-radioButton>\r\n            <label for=\"or{{i}}{{file.id}}\" class=\"ml-2\">{{dataRadio.noDescripcion}}</label>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div *ngIf=\"file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div class=\"flex align-items-center\">\r\n          <p-radioButton name=\"result\" value=\"{{file.optionRadio}}\" [(ngModel)]=\"file.optionRadio\" [disabled]=\"true\"\r\n            inputId=\"ores{{file.id}}\"></p-radioButton>\r\n          <label class=\"ml-2\">{{file.nombreRadio}}</label>\r\n        </div>\r\n        <div class=\"badge-firma-ok flex align-items-center\">\r\n          <span>Documento firmado digitalmente</span>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"mt-2\">\r\n      <input class=\"wp-100\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.observationDocument\"\r\n      [disabled]=\"file.isSign\" placeholder=\"Observaci\u00F3n (Opcional)\" />\r\n    </div>\r\n  </div>\r\n</div>", styles: [".flex-1{flex:1}.fontsize-10{font-size:10px}.badge-firma-ok{color:#3cc85a;background-color:#d9ecf7;padding:.3rem;border-radius:5px;font-weight:600;font-size:11px}.cursor-pointer{cursor:pointer}.bg-color{background-color:#89898929}.wp-100{width:100%}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i4.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "component", type: i5.Button, selector: "p-button", inputs: ["type", "iconPos", "icon", "badge", "label", "disabled", "loading", "loadingIcon", "raised", "rounded", "text", "plain", "severity", "outlined", "link", "tabindex", "size", "style", "styleClass", "badgeClass", "ariaLabel", "autofocus"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: i6.ProgressBar, selector: "p-progressBar", inputs: ["value", "showValue", "styleClass", "style", "unit", "mode", "color"] }, { kind: "component", type: i7.Messages, selector: "p-messages", inputs: ["value", "closable", "style", "styleClass", "enableService", "key", "escape", "severity", "showTransitionOptions", "hideTransitionOptions"], outputs: ["valueChange", "onClose"] }, { kind: "component", type: i8.RadioButton, selector: "p-radioButton", inputs: ["value", "formControlName", "name", "disabled", "label", "variant", "tabindex", "inputId", "ariaLabelledBy", "ariaLabel", "style", "styleClass", "labelStyleClass", "autofocus"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "component", type: i9.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "component", type: i10.IconComponent, selector: "fn-icon", inputs: ["ico", "height", "color"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.3", ngImport: i0, type: FnFileUploadComponent, decorators: [{
            type: Component,
            args: [{ selector: 'fn-file-upload', template: "<div class=\"field\">\r\n  <label *ngIf=\"!isSignDigital\" class=\"block text-sm font-semibold\">{{ label }}</label>\r\n\r\n  <div #content (dragenter)=\"onDragEnter($event)\" (dragleave)=\"onDragLeave($event)\" (drop)=\"onDrop($event)\"\r\n    class=\"flex flex-column align-items-center border-dashed border-round border-2 select-none surface-border\"\r\n    [ngClass]=\"isSignDigital ? 'p-3' : 'p-6'\">\r\n    <div *ngIf=\"uploadingFile\" class=\"w-full -mt-3 mb-5\">\r\n      <p-progressBar mode=\"indeterminate\" [style]=\"{ height: '6px' }\"></p-progressBar>\r\n    </div>\r\n    <p-messages [value]=\"msgs\" [enableService]=\"false\"></p-messages>\r\n\r\n    <fn-icon [ico]=\"iFileUpload\" height=\"2rem\" color=\"#B3B3B3\" class=\"mb-3 mt-3\"></fn-icon>\r\n    <div class=\"font-semibold\">\r\n      {{ firstLabel }}\r\n      <label (click)=\"chooseFile()\" class=\"text-blue-400 underline cursor-pointer\">\r\n        haz click aqu\u00ED\r\n      </label>\r\n      <input #fileInput class=\"hidden\" type=\"file\" [multiple]=\"multiple\" [disabled]=\"disabled\" [accept]=\"acceptedFiles\"\r\n        (change)=\"onFileSelect($event)\">\r\n    </div>\r\n    <p class=\"text-center px-6 text-700\">{{ filesDescription }}</p>\r\n    <p class=\"font-semibold text-sm text-700\">M\u00E1ximo {{ maxFileSizeDescription }} {{ perFileLabel }}</p>\r\n  </div>\r\n\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && !isSignDigital\">\r\n  <label class=\"block text-sm font-semibold\">{{ titleDocumentUpload }}</label>\r\n  <div class=\"flex justify-content-between align-items-center mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div class=\"flex align-items-center\">\r\n      <div class=\"surface-200 border-round px-1 py-2 flex align-items-center\">\r\n        <fn-icon [ico]=\"getFileCategoryIcon(file.nombre)\"></fn-icon>\r\n      </div>\r\n      <div class=\"ml-3\">\r\n        <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        {{ file.nombreOrigen }}\r\n        <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n      </div>\r\n    </div>\r\n    <div class=\"flex align-items-center\">\r\n      {{getFileSize(file.tamanyo)}}\r\n      <p-button (onClick)=\"removeAttachment(file)\" class=\"ml-1\" styleClass=\"p-button-text\">\r\n        <fn-icon [ico]=\"iTrashCan\"></fn-icon>\r\n      </p-button>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"field\" *ngIf=\"files.length > 0 && isSignDigital && !isSignMassive\">\r\n  <div class=\"mb-2\" *ngFor=\"let file of files; let i = index\">\r\n    <div [ngClass]=\"file.isFocus ? 'bg-color' : 'null'\">\r\n      <div class=\"flex justify-content-between align-items-center\">\r\n        <div class=\"flex flex-wrap cursor-pointer\" (click)=\"showDocument(file)\">\r\n          <fn-icon [ico]=\"iFile\" height=\"1.1rem\"></fn-icon>\r\n          <span class=\"font-semibold mr-1\">Anexo {{ i+1 }}: </span>\r\n        </div>\r\n        <div class=\"flex flex-wrap border-round flex align-items-center\">\r\n          <i class=\"pi pi-check text-green-500 ml-1\"></i>\r\n          <span class=\"fontsize-10 ml-1 mr-2\">{{getFileSize(file.tamanyo)}}</span>\r\n          <p-button *ngIf=\"!file.isSign\" (onClick)=\"signDocument(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iEdit\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button *ngIf=\"file.isSign\" styleClass=\"p-button-text refactor\" [disabled]=\"true\">\r\n            <fn-icon [ico]=\"iCheck\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n          <p-button (onClick)=\"removeAttachment(file)\" styleClass=\"p-button-text refactor\">\r\n            <fn-icon [ico]=\"iTrashCan\" height=\"1.5rem\"></fn-icon>\r\n          </p-button>\r\n        </div>\r\n      </div>\r\n      <div class=\"ml-3 cursor-pointer\" (click)=\"showDocument(file)\">  {{ file.nombreOrigen }} </div>\r\n    </div>\r\n\r\n    <div class=\"flex justify-content-between align-items-center gap-3 mt-2\">\r\n      <p-dropdown [options]=\"dataDropDown\" [disabled]=\"file.isSign\" [(ngModel)]=\"file.dataSelected\"\r\n        optionLabel=\"label\"></p-dropdown>\r\n      <input class=\"flex-1\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.descriptionDocument\"\r\n        [disabled]=\"file.isSign\" placeholder=\"Ingresar el n\u00FAmero del documento\" />\r\n    </div>\r\n    <div class=\"flex justify-content-between align-items-center mt-2\">\r\n      <div *ngIf=\"!file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div *ngFor=\"let dataRadio of dataRadioButton; index as i;\">\r\n          <div class=\"flex align-items-center\">\r\n            <p-radioButton name=\"typecopy\" value=\"{{dataRadio.id}}\" [(ngModel)]=\"file.optionRadio\"\r\n              inputId=\"or{{i}}{{file.id}}\" (onClick)=\"file.nombreRadio = dataRadio.noDescripcion\"></p-radioButton>\r\n            <label for=\"or{{i}}{{file.id}}\" class=\"ml-2\">{{dataRadio.noDescripcion}}</label>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      <div *ngIf=\"file.isSign\" class=\"flex flex-wrap gap-3\">\r\n        <div class=\"flex align-items-center\">\r\n          <p-radioButton name=\"result\" value=\"{{file.optionRadio}}\" [(ngModel)]=\"file.optionRadio\" [disabled]=\"true\"\r\n            inputId=\"ores{{file.id}}\"></p-radioButton>\r\n          <label class=\"ml-2\">{{file.nombreRadio}}</label>\r\n        </div>\r\n        <div class=\"badge-firma-ok flex align-items-center\">\r\n          <span>Documento firmado digitalmente</span>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"mt-2\">\r\n      <input class=\"wp-100\" type=\"text\" maxlength=\"60\" pInputText [(ngModel)]=\"file.observationDocument\"\r\n      [disabled]=\"file.isSign\" placeholder=\"Observaci\u00F3n (Opcional)\" />\r\n    </div>\r\n  </div>\r\n</div>", styles: [".flex-1{flex:1}.fontsize-10{font-size:10px}.badge-firma-ok{color:#3cc85a;background-color:#d9ecf7;padding:.3rem;border-radius:5px;font-weight:600;font-size:11px}.cursor-pointer{cursor:pointer}.bg-color{background-color:#89898929}.wp-100{width:100%}\n"] }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: i0.NgZone }, { type: i0.Renderer2 }], propDecorators: { url: [{
                type: Input
            }], deleteURL: [{
                type: Input
            }], maxFileSize: [{
                type: Input
            }], label: [{
                type: Input
            }], type: [{
                type: Input
            }], fileLimit: [{
                type: Input
            }], headers: [{
                type: Input
            }], disabled: [{
                type: Input
            }], multiple: [{
                type: Input
            }], files: [{
                type: Input
            }], perFileLabel: [{
                type: Input
            }], firstLabel: [{
                type: Input
            }], isAccumulated: [{
                type: Input
            }], isInMemory: [{
                type: Input
            }], sumSize: [{
                type: Input
            }], sumSizeChange: [{
                type: Output
            }], fileInput: [{
                type: ViewChild,
                args: ['fileInput']
            }], content: [{
                type: ViewChild,
                args: ['content']
            }], isSignDigital: [{
                type: Input
            }], isSignMassive: [{
                type: Input
            }], dataDropDown: [{
                type: Input
            }], dataDropDownSelected: [{
                type: Input
            }], dataRadioButton: [{
                type: Input
            }], filesChange: [{
                type: Output
            }], processSignDocument: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm4tZmlsZS11cGxvYWQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY21wLWxpYi9zcmMvbGliL2ZpbGUvZm4tZmlsZS11cGxvYWQvZm4tZmlsZS11cGxvYWQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY21wLWxpYi9zcmMvbGliL2ZpbGUvZm4tZmlsZS11cGxvYWQvZm4tZmlsZS11cGxvYWQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBVSxNQUFNLEVBQWEsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hJLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUkvRCxNQUFNO0FBQ04sT0FBTyxFQUNMLFdBQVcsRUFDWCxNQUFNLEVBQ04sVUFBVSxFQUNWLFVBQVUsRUFDVixVQUFVLEVBQ1YsS0FBSyxFQUNMLEtBQUssRUFDTCxNQUFNLEVBQ1AsTUFBTSw0QkFBNEIsQ0FBQztBQUdwQyxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7O0FBSXBDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDOUIsS0FBSyxFQUFFLG1CQUFtQjtJQUMxQixLQUFLLEVBQUUsNENBQTRDO0lBQ25ELEtBQUssRUFBRSxrQkFBa0I7SUFDekIsUUFBUSxFQUFFLHlCQUF5QjtJQUNuQyxHQUFHLEVBQUUsTUFBTTtJQUNYLEtBQUssRUFBRSxZQUFZO0lBQ25CLElBQUksR0FBRztRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDaEUsQ0FBQztDQUNGLENBQUMsQ0FBQTtBQUVGLDBCQUEwQjtBQUMxQixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQWMsRUFBRSxFQUFFO0lBQ2xDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUN0RixDQUFDLENBQUE7QUFFRCxNQUFNLGdCQUFnQixHQUFHO0lBQ3ZCLEdBQUcsRUFBRSx5QkFBeUIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxRQUFRLENBQUMsT0FBTyxDQUFDLG1CQUFtQixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDeEosS0FBSyxFQUFFLHlCQUF5QixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUk7SUFDckQsS0FBSyxFQUFFLHVCQUF1QixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUk7SUFDbkQsS0FBSyxFQUFFLHVCQUF1QixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUk7SUFDbkQsUUFBUSxFQUFFLDJCQUEyQixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDN0QsR0FBRyxFQUFFLCtDQUErQztJQUNwRCxLQUFLLEVBQUUsK0NBQStDO0NBQ3ZELENBQUE7QUFFRCxNQUFNLGdCQUFnQixHQUFHLENBQUMsS0FBYSxFQUFFLGVBQXVCLENBQUMsRUFBRSxFQUFFO0lBQ25FLElBQUcsS0FBSyxJQUFJLENBQUM7UUFBRSxPQUFPLFNBQVMsQ0FBQztJQUNoQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDYixJQUFJLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckYsQ0FBQyxDQUFBO0FBT0QsTUFBTSxPQUFPLHFCQUFxQjtJQUVoQyxZQUNVLElBQWdCLEVBQ2pCLElBQVksRUFDWCxRQUFtQjtRQUZuQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2pCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBR3BCLFFBQUcsR0FBVyxvREFBb0QsQ0FBQyxDQUFBLFVBQVU7UUFDN0UsY0FBUyxHQUFXLDhEQUE4RCxDQUFBO1FBQ2xGLGdCQUFXLEdBQVcsT0FBTyxDQUFDLENBQUEsS0FBSztRQUNuQyxVQUFLLEdBQVcsa0JBQWtCLENBQUM7UUFDbkMsU0FBSSxHQUFhLEtBQUssQ0FBQztRQUV2QixZQUFPLEdBQWdCLElBQUksV0FBVyxDQUFDO1FBQ3ZDLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFDMUIsYUFBUSxHQUF3QixJQUFJLENBQUM7UUFDckMsVUFBSyxHQUFVLEVBQUUsQ0FBQztRQUNsQixpQkFBWSxHQUFXLGFBQWEsQ0FBQztRQUNyQyxlQUFVLEdBQVcsMENBQTBDLENBQUM7UUFDaEUsa0JBQWEsR0FBWSxLQUFLLENBQUMsQ0FBQyxpS0FBaUs7UUFDak0sZUFBVSxHQUFZLEtBQUssQ0FBQyxDQUFDLDRFQUE0RTtRQUN6RyxZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUk1QyxrQkFBYSxHQUFZLEtBQUssQ0FBQyxDQUFDLDJDQUEyQztRQUMzRSxrQkFBYSxHQUFZLEtBQUssQ0FBQyxDQUFDLHdIQUF3SDtRQUN4SixpQkFBWSxHQUFRLEVBQUUsQ0FBQTtRQUN0Qix5QkFBb0IsR0FBUSxJQUFJLENBQUE7UUFDaEMsb0JBQWUsR0FBUSxFQUFFLENBQUE7UUFDeEIsZ0JBQVcsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3RDLHdCQUFtQixHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFJakQsbUNBQThCLEdBQUMsK0NBQStDLENBQUE7UUFDOUUsa0NBQTZCLEdBQUMsK0JBQStCLENBQUE7UUFDcEUsMkJBQTJCO1FBQ3BCLGtDQUE2QixHQUFDLG9DQUFvQyxDQUFBO1FBQ2xFLGlDQUE0QixHQUFDLG9DQUFvQyxDQUFBO1FBQ3hFLDhCQUE4QjtRQUN2QixrQ0FBNkIsR0FBRyxpQ0FBaUMsQ0FBQTtRQUNqRSxpQ0FBNEIsR0FBRyxrQ0FBa0MsQ0FBQTtRQUN4RSxzREFBc0Q7UUFDL0Msc0NBQWlDLEdBQUMseURBQXlELENBQUE7UUFDM0YscUNBQWdDLEdBQUMsOEJBQThCLENBQUE7UUFFL0QsZ0JBQVcsR0FBVyxXQUFxQixDQUFDO1FBQzVDLGNBQVMsR0FBVyxNQUFnQixDQUFDO1FBQ3JDLFVBQUssR0FBVyxLQUFlLENBQUM7UUFDaEMsVUFBSyxHQUFXLEtBQWUsQ0FBQztRQUNoQyxXQUFNLEdBQVcsTUFBZ0IsQ0FBQztRQUV6QyxvQ0FBb0M7UUFFN0IsU0FBSSxHQUFjLEVBQUUsQ0FBQztRQUVyQixrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUM5QixnQkFBVyxHQUFhLElBQUksUUFBUSxFQUFFLENBQUM7SUF0RDVDLENBQUM7SUF3REosSUFBSSxhQUFhO1FBQ2YsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNsQixJQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFHLENBQUM7WUFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyw0Q0FBNEMsQ0FBQTtRQUMxRyxDQUFDO2FBQUssQ0FBQztZQUNMLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BDLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxtQkFBbUI7UUFDckIsSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUcsQ0FBQztZQUM5QixPQUFPLGtCQUFrQixDQUFBO1FBQzNCLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxvQkFBb0IsQ0FBQTtRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksc0JBQXNCO1FBQ3hCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQzNDLENBQUM7SUFFTSxXQUFXLENBQUMsSUFBWTtRQUM3QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sbUJBQW1CLENBQUMsUUFBZ0I7UUFDekMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDM0QsSUFBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFBRSxPQUFPLFVBQVUsQ0FBQTthQUNwRCxJQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUFFLE9BQU8sVUFBVSxDQUFBO2FBQ3pELElBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQUUsT0FBTyxVQUFVLENBQUE7O1lBQ3pELE9BQU8sS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O1FBWUk7SUFFSixVQUFVO1FBQ1IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDdEMsQ0FBQztJQUVNLFlBQVksQ0FBQyxLQUFVO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFckIsQ0FBQztJQUNELHFCQUFxQjtJQUVyQixRQUFRLENBQUMsSUFBVTtRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVmLElBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNiLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUcsSUFBSSxDQUFDLFNBQW9CLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xHLE1BQU0sRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRyxJQUFJLENBQUMsU0FBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqRyxDQUFDLENBQUM7WUFDSCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFFRCxJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsTUFBTSxFQUFFLGNBQWMsSUFBSSxDQUFDLElBQUkscUJBQXFCO2FBQ3JELENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3JFLE1BQU0sRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQzdFLENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3JFLE1BQU0sRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDN0YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO1lBQzFDLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUssSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFHLENBQUM7WUFDNUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFHLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNiLFFBQVEsRUFBRSxPQUFPO29CQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNsRyxNQUFNLEVBQUUsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2hILENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUE7Z0JBQzFDLE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxlQUFlLENBQUMsSUFBVTtRQUNoQyxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssSUFBSSxJQUFJLElBQUksZUFBZ0IsRUFBRSxDQUFDO1lBQ2xDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFMUwsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDZixPQUFPLElBQUksQ0FBQztZQUNkLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsWUFBWSxDQUFDLFFBQWdCO1FBQzNCLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxVQUFVLENBQUMsUUFBZ0I7UUFDekIsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVO1FBQ3pCLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTSxZQUFZLENBQUMsSUFBVTtRQUM1QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BFLE9BQU8sU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkQsQ0FBQztJQUVNLFlBQVksQ0FBQyxLQUFVO1FBQzVCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMvRSxJQUFHLElBQUksQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkQsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFHLElBQUksQ0FBQyxTQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsRyxNQUFNLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUcsSUFBSSxDQUFDLFNBQW9CLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDakcsQ0FBQyxDQUFDO1lBQ0gsT0FBTTtRQUNSLENBQUM7UUFFQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFFeEIsSUFBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUcsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7b0JBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN0QzttaUVBQytnRTtvQkFDL2dFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7eUJBQzVDLFNBQVMsQ0FBQzt3QkFDVCxJQUFJLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTs0QkFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7NEJBQzNCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDcEMsNkJBQTZCO3dCQUM5QixDQUFDO3dCQUNELEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFOzRCQUNmLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDOzRCQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQTs0QkFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQ0FDYixRQUFRLEVBQUUsT0FBTztnQ0FDakIsT0FBTyxFQUFFLFNBQVM7Z0NBQ2xCLE1BQU0sRUFBRSxjQUFjLElBQUksQ0FBQyxJQUFJLHVCQUF1Qjs2QkFDdkQsQ0FBQyxDQUFBO3dCQUNKLENBQUM7cUJBQ0YsQ0FBQyxDQUFBO29CQUVKLDZCQUE2QjtvQkFDN0I7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBZ0JLO2dCQUNQLENBQUM7cUJBQU0sQ0FBQztvQkFDTixJQUFJLElBQUksR0FBRyxFQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxDQUFDLEVBQUMsQ0FBQTtvQkFDcEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ2hDOzs7Ozs7OztpREFRNkI7Z0JBQzlCLENBQUM7WUFFSCxDQUFDO1FBQ0gsQ0FBQztJQUdMLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBUSxFQUFFLElBQVE7UUFDOUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNwRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3BELElBQUksSUFBSSxHQUFDO1lBQ1AsRUFBRSxFQUFFLE1BQU0sRUFBRTtZQUNaLElBQUksRUFBRSxJQUFJO1lBQ1YsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzFCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtZQUMvQixZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2xCLFlBQVksRUFBRSxJQUFJLENBQUMsb0JBQW9CO1lBQ3ZDLG1CQUFtQixFQUFFLElBQUk7WUFDekIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixXQUFXLEVBQUUsSUFBSTtZQUNqQixXQUFXLEVBQUUsSUFBSTtZQUNqQixNQUFNLEVBQUUsS0FBSztZQUNiLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLENBQUMsK0VBQStFO1NBQzNGLENBQUE7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUN4QixJQUFJLE9BQU87WUFBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRDs7O09BR0c7SUFFSCxpQkFBaUI7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVE7UUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDekIsSUFBSSxTQUFTLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUFFLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBOztvQkFDakQsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7WUFDaEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtZQUNoQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3JDLENBQUM7SUFFSCxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVE7UUFDbkIsbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWYsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLG1CQUFtQjtnQkFDNUIsTUFBTSxFQUFFLGlDQUFpQzthQUMxQyxDQUFDLENBQUM7WUFDSCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3pFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNiLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixPQUFPLEVBQUUscUJBQXFCO2dCQUM5QixNQUFNLEVBQUUsMkNBQTJDO2FBQ3BELENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsT0FBTztnQkFDakIsT0FBTyxFQUFFLHFCQUFxQjtnQkFDOUIsTUFBTSxFQUFFLHlFQUF5RTthQUNsRixDQUFDLENBQUM7WUFDSCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ2IsUUFBUSxFQUFFLE9BQU87Z0JBQ2pCLE9BQU8sRUFBRSxlQUFlO2dCQUN4QixNQUFNLEVBQUUsb0NBQW9DO2FBQzdDLENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksU0FBUyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtvQkFBRSxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTs7b0JBQ2pELFNBQVMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFBO1FBQ2hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbkMsT0FBTyxJQUFJLENBQUM7SUFFZCxDQUFDO0lBRUQsV0FBVyxDQUFDLENBQVk7UUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBRUQsVUFBVSxDQUFDLENBQVk7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQjt5Q0FDNkI7WUFDN0IsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNyQixDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFnQjtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLGlGQUFpRjtRQUNuRixDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFVO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixpRkFBaUY7WUFDakYsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV2QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDL0UsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRS9ELElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRDs7OztRQUlJO0lBRUcsZ0JBQWdCLENBQUMsSUFBUztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZCOytoRUFDbWhFO1lBQzdnRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUMxRCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDWixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFBO29CQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNiLFFBQVEsRUFBRSxTQUFTO3dCQUNuQixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJO3dCQUNqQyxNQUFNLEVBQUUsNENBQTRDO3FCQUNyRCxDQUFDLENBQUE7b0JBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUEsQ0FBQyxVQUFVO29CQUMzQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNyQyxDQUFDO2dCQUNELEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFBO29CQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNiLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJO3dCQUNqQyxNQUFNLEVBQUUsa0NBQWtDO3FCQUMzQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQzthQUNGLENBQUMsQ0FBQTtRQUNSLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixRQUFRLEVBQUUsU0FBUztnQkFDbkIsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSTtnQkFDakMsTUFBTSxFQUFFLDRDQUE0QzthQUNyRCxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQSxDQUFDLFVBQVU7WUFDM0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNyQyxDQUFDO0lBQ0gsQ0FBQzs4R0FoZVUscUJBQXFCO2tHQUFyQixxQkFBcUIsZzNCQzlEbEMsa3ZMQXlHTTs7MkZEM0NPLHFCQUFxQjtrQkFMakMsU0FBUzsrQkFDRSxnQkFBZ0I7NEhBWWpCLEdBQUc7c0JBQVgsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLE9BQU87c0JBQWYsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNJLGFBQWE7c0JBQXRCLE1BQU07Z0JBQ2lCLFNBQVM7c0JBQWhDLFNBQVM7dUJBQUMsV0FBVztnQkFDQSxPQUFPO3NCQUE1QixTQUFTO3VCQUFDLFNBQVM7Z0JBRVgsYUFBYTtzQkFBckIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csb0JBQW9CO3NCQUE1QixLQUFLO2dCQUNHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBQ0ksV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxtQkFBbUI7c0JBQTVCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE5nWm9uZSwgT3V0cHV0LCBSZW5kZXJlcjIsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycyB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xyXG5cclxuLy9wcmltZW5nXHJcbmltcG9ydCB7IEZuSWNvbiB9IGZyb20gJy4uLy4uL3NoYXJlZC9pbnRlcmZhY2VzL2ZuLWljb24nO1xyXG4vL21wZm5cclxuaW1wb3J0IHtcclxuICBpRmlsZVVwbG9hZCxcclxuICBpVHJhc2gsXHJcbiAgaUZpbGVJbWFnZSxcclxuICBpRmlsZVZpZGVvLFxyXG4gIGlGaWxlQXVkaW8sXHJcbiAgaUZpbGUsXHJcbiAgaUVkaXQsXHJcbiAgaUNoZWNrXHJcbn0gZnJvbSBcIm5neC1tcGZuLWRldi1pY29qcy1yZWd1bGFyXCI7XHJcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcblxyXG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcclxuXHJcbnR5cGUgRmlsZVR5cGUgPSAnaW1hZ2UnIHwgJ3ZpZGVvJyB8ICdhdWRpbycgfCAnZG9jdW1lbnQnIHwgJ3BkZicgfCAnZXhjZWwnIHwgJ2FsbCc7XHJcblxyXG5jb25zdCBGSUxFX1RZUEUgPSBPYmplY3QuZnJlZXplKHtcclxuICBpbWFnZTogJy5qcGcsIC5qcGVnLCAucG5nJyxcclxuICB2aWRlbzogJy5oMjY0LCAuM2dwLCAud2VibSwgLm1rdiwgLm1wNCwgLm1vdiwgLmF2aScsXHJcbiAgYXVkaW86ICcubXAzLCAuYWFjLCAud2F2JyxcclxuICBkb2N1bWVudDogJy5wZGYsIC5kb2MsIC5kb2N4LCAucHB0JyxcclxuICBwZGY6ICcucGRmJyxcclxuICBleGNlbDogJy54bHMsLnhsc3gnLFxyXG4gIGdldCBhbGwoKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuaW1hZ2UsdGhpcy52aWRlbyx0aGlzLmF1ZGlvLHRoaXMuZG9jdW1lbnRdLmpvaW4oKVxyXG4gIH1cclxufSlcclxuXHJcbi8vZGVzY3JpcGNpw7NuIGRlIGV4dGVuc2nDs25cclxuY29uc3QgRVhUX0RFU0MgPSAodHlwZTogRmlsZVR5cGUpID0+IHtcclxuICByZXR1cm4gRklMRV9UWVBFW3R5cGVdLnJlcGxhY2UoLywoW14sXSopJC8sICcgTyQxJykucmVwbGFjZUFsbCgnLicsJycpLnRvVXBwZXJDYXNlKClcclxufVxyXG5cclxuY29uc3QgRklMRV9ERVNDUklQVElPTiA9IHtcclxuICBhbGw6IGBQdWVkZSBzdWJpciBpbcOhZ2VuZXMgKCR7RVhUX0RFU0MoJ2ltYWdlJyl9KSwgdmlkZW9zICgke0VYVF9ERVNDKCd2aWRlbycpfSksIGF1ZGlvcyAoJHtFWFRfREVTQygnYXVkaW8nKX0pIHkgZG9jdW1lbnRvcyAoJHtFWFRfREVTQygnZG9jdW1lbnQnKX0pLmAsXHJcbiAgaW1hZ2U6IGBQdWVkZSBzdWJpciBpbcOhZ2VuZXMgKCR7RVhUX0RFU0MoJ2ltYWdlJyl9KS5gLFxyXG4gIHZpZGVvOiBgUHVlZGUgc3ViaXIgdmlkZW9zICgke0VYVF9ERVNDKCd2aWRlbycpfSkuYCxcclxuICBhdWRpbzogYFB1ZWRlIHN1YmlyIGF1ZGlvcyAoJHtFWFRfREVTQygnYXVkaW8nKX0pLmAsXHJcbiAgZG9jdW1lbnQ6IGBQdWVkZSBzdWJpciBkb2N1bWVudG9zICgke0VYVF9ERVNDKCdkb2N1bWVudCcpfSkuYCxcclxuICBwZGY6IGBTb2xvIHB1ZWRlIHN1YmlyIHVuIGRvY3VtZW50byBlbiBmb3JtYXRvIFBERi5gLFxyXG4gIGV4Y2VsOiBgU29sbyBwdWVkZSBzdWJpciB1biBhcmNoaXZvIGVuIGZvcm1hdG8gRXhjZWwuYCxcclxufVxyXG5cclxuY29uc3QgRk9STUFUX0ZJTEVfU0laRSA9IChieXRlczogbnVtYmVyLCBkZWNpbWFsUG9pbnQ6IG51bWJlciA9IDIpID0+IHtcclxuICBpZihieXRlcyA9PSAwKSByZXR1cm4gJzAgQnl0ZXMnO1xyXG4gIGxldCBrID0gMTAyNDtcclxuICBsZXQgc2l6ZXMgPSBbJ0J5dGVzJywgJ0tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ107XHJcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcclxuICByZXR1cm4gcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZChkZWNpbWFsUG9pbnQpKSArICcgJyArIHNpemVzW2ldO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2ZuLWZpbGUtdXBsb2FkJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vZm4tZmlsZS11cGxvYWQuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL2ZuLWZpbGUtdXBsb2FkLmNvbXBvbmVudC5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRm5GaWxlVXBsb2FkQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxyXG4gICAgcHVibGljIHpvbmU6IE5nWm9uZSxcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMlxyXG4gICkge31cclxuXHJcbiAgQElucHV0KCkgdXJsOiBzdHJpbmcgPSAnaHR0cDovLzE3Mi4xNi4xMTEuMTI4OjgwODEvbXMtbWVzYS9yZXBvc2l0b3Jpby82NzYnOy8vZW5kcG9pbnRcclxuICBASW5wdXQoKSBkZWxldGVVUkw6IHN0cmluZyA9ICdodHRwOi8vMTcyLjE2LjExMS4xMjg6ODA4MS9tcy1tZXNhL3JlcG9zaXRvcmlvL2VsaW1pbmFyP3VybD0nXHJcbiAgQElucHV0KCkgbWF4RmlsZVNpemU6IG51bWJlciA9IDEwNDg1NzY7Ly8xbWJcclxuICBASW5wdXQoKSBsYWJlbDogc3RyaW5nID0gJ1N1YmlyIGRvY3VtZW50b3MnO1xyXG4gIEBJbnB1dCgpIHR5cGU6IEZpbGVUeXBlID0gJ2FsbCc7XHJcbiAgQElucHV0KCkgZmlsZUxpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQ7Ly9tYXggbnVtYmVyIG9mIGZpbGVzIHRoYXQgY2FuIGJlIHVwbG9hZGVkXHJcbiAgQElucHV0KCkgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnM7XHJcbiAgQElucHV0KCkgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHRydWU7XHJcbiAgQElucHV0KCkgZmlsZXM6IGFueVtdID0gW107XHJcbiAgQElucHV0KCkgcGVyRmlsZUxhYmVsOiBzdHJpbmcgPSAncG9yIGFyY2hpdm8nO1xyXG4gIEBJbnB1dCgpIGZpcnN0TGFiZWw6IHN0cmluZyA9ICdBcnJhc3RyYSB5IHN1ZWx0YSBsb3MgYXJjaGl2b3MgYSBzdWJpciBvJztcclxuICBASW5wdXQoKSBpc0FjY3VtdWxhdGVkOiBib29sZWFuID0gZmFsc2U7IC8vRXMgYWN1bXVsYWRvLCBwb3IgZGVmZWN0byBmYWxzZS4gSW5kaWNhIHF1ZSB0b2RvIGVsIHBlc28gZGUgbG9zIGFyY2hpdm9zIGRlIHRvZG9zIGxvcyBjb21wb25lbnRlcyB0ZW5kcmFuIHVuYSBzdW1hdG9yaWEgdG90YWwgcXVlIG5vIGRlYmUgc3VwZXJhciBhIG1heEZpbGVTaXplXHJcbiAgQElucHV0KCkgaXNJbk1lbW9yeTogYm9vbGVhbiA9IGZhbHNlOyAvL0xhIGzDs2dpY2EgZGUgc3ViaWRhIGRlIGZpbGVzIHNlIG1hbnRpZW5lIGVuIG1lbW9yaWEgeSBubyBlbnZpYSBhbCBzZXJ2aWRvclxyXG4gIEBJbnB1dCgpIHN1bVNpemU6IG51bWJlciA9IDA7XHJcbiAgQE91dHB1dCgpIHN1bVNpemVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPG51bWJlcj4oKTtcclxuICBAVmlld0NoaWxkKCdmaWxlSW5wdXQnKSBmaWxlSW5wdXQhOiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoJ2NvbnRlbnQnKSBjb250ZW50OiBFbGVtZW50UmVmIHwgdW5kZWZpbmVkO1xyXG5cclxuICBASW5wdXQoKSBpc1NpZ25EaWdpdGFsOiBib29sZWFuID0gZmFsc2U7IC8vTXVlc3RyYSBvdHJhIGxpc3RhIGRlIGRvY3VtZW50b3MgYWRqdW50b3NcclxuICBASW5wdXQoKSBpc1NpZ25NYXNzaXZlOiBib29sZWFuID0gZmFsc2U7IC8vT2N1bHRhIGxpc3RhIGRvY3VtZW50b3MgYWRqdW50b3MgZWwgZm9ybXVsYXJpbyBzZSBoYWNlIGVuIGNhZGEgY29tcG9uZW50ZSBwb3IgYWdpbGlkYWQgeSBsaW1pdGFudGVzIGVuIGVzdGUgY29tcG9uZW50ZVxyXG4gIEBJbnB1dCgpIGRhdGFEcm9wRG93bjogYW55ID0gW11cclxuICBASW5wdXQoKSBkYXRhRHJvcERvd25TZWxlY3RlZDogYW55ID0gbnVsbFxyXG4gIEBJbnB1dCgpIGRhdGFSYWRpb0J1dHRvbjogYW55ID0gW11cclxuICBAT3V0cHV0KCkgZmlsZXNDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgcHJvY2Vzc1NpZ25Eb2N1bWVudCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICBkcmFnT3Zlckxpc3RlbmVyOiBWb2lkRnVuY3Rpb24gfCBudWxsIHwgdW5kZWZpbmVkO1xyXG5cclxuICBwdWJsaWMgaW52YWxpZEZpbGVMaW1pdE1lc3NhZ2VTdW1tYXJ5PVwiU2UgaGEgZXhjZWRpZG8gZWwgbsO6bWVybyBtw6F4aW1vIGRlIGFyY2hpdm9zLCBcIlxyXG4gIHB1YmxpYyBpbnZhbGlkRmlsZUxpbWl0TWVzc2FnZURldGFpbD1cImVsIGzDrW1pdGUgZXMgezB9IGNvbW8gbcOheGltby5cIlxyXG4gIC8vZXJyb3IgbXNnIGZvciBtYXhGaWxlU2l6ZVxyXG4gIHB1YmxpYyBpbnZhbGlkRmlsZVNpemVNZXNzYWdlU3VtbWFyeT1cInswfTogVGFtYcOxbyBkZSBhcmNoaXZvIG5vIHbDoWxpZG8sIFwiXHJcbiAgcHVibGljIGludmFsaWRGaWxlU2l6ZU1lc3NhZ2VEZXRhaWw9XCJlbCB0YW1hw7FvIG3DoXhpbW8gZGUgc3ViaWRhIGVzIHswfS5cIlxyXG4gIC8vdGlwbyBkZSBhcmNoaXZvIG5vIHBlcm1pdGlkb1xyXG4gIHB1YmxpYyBpbnZhbGlkRmlsZVR5cGVNZXNzYWdlU3VtbWFyeSA9ICd7MH06IFRpcG8gZGUgYXJjaGl2byBpbnbDoWxpZG8sICdcclxuICBwdWJsaWMgaW52YWxpZEZpbGVUeXBlTWVzc2FnZURldGFpbCA9ICd0aXBvIGRlIGFyY2hpdm9zIHBlcm1pdGlkb3M6IHswfSdcclxuICAvL2Vycm9yIG1heGltbyB0b3RhbCBkZSB0YW1hw7FvIGN1YW5kbyBpc0luTWVtb3J5OiB0cnVlXHJcbiAgcHVibGljIGludmFsaWRtYXhTaXplTGltaXRNZXNzYWdlU3VtbWFyeT1cIlNlIGhhIGV4Y2VkaWRvIGVuIGVsIGxpbWl0ZSB0b3RhbCBkZSBsb3MgYXJjaGl2b3MgezB9LCBcIlxyXG4gIHB1YmxpYyBpbnZhbGlkbWF4U2l6ZUxpbWl0TWVzc2FnZURldGFpbD1cImVsIGzDrW1pdGUgcmVzdGFudGUgZXMgZGUgezB9XCJcclxuXHJcbiAgcHVibGljIGlGaWxlVXBsb2FkOiBGbkljb24gPSBpRmlsZVVwbG9hZCBhcyBGbkljb247XHJcbiAgcHVibGljIGlUcmFzaENhbjogRm5JY29uID0gaVRyYXNoIGFzIEZuSWNvbjtcclxuICBwdWJsaWMgaUZpbGU6IEZuSWNvbiA9IGlGaWxlIGFzIEZuSWNvbjtcclxuICBwdWJsaWMgaUVkaXQ6IEZuSWNvbiA9IGlFZGl0IGFzIEZuSWNvbjtcclxuICBwdWJsaWMgaUNoZWNrOiBGbkljb24gPSBpQ2hlY2sgYXMgRm5JY29uO1xyXG5cclxuICAvLyBwdWJsaWMgdXBsb2FkZWRGaWxlczogYW55W10gPSBbXTtcclxuXHJcbiAgcHVibGljIG1zZ3M6IE1lc3NhZ2VbXSA9IFtdO1xyXG5cclxuICBwdWJsaWMgdXBsb2FkaW5nRmlsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgdG1wRm9ybURhdGE6IEZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcblxyXG4gIGdldCBhY2NlcHRlZEZpbGVzKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gRklMRV9UWVBFW3RoaXMudHlwZV1cclxuICB9XHJcblxyXG4gIGdldCBmaWxlc0Rlc2NyaXB0aW9uKCk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gJ3BkZicgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZpbGVMaW1pdCA9PT0gMSA/IEZJTEVfREVTQ1JJUFRJT05bdGhpcy50eXBlXSA6ICdTb2xvIHB1ZWRlIHN1YmlyIGRvY3VtZW50b3MgZW4gZm9ybWF0byBQREYnXHJcbiAgICB9IGVsc2V7XHJcbiAgICAgIHJldHVybiBGSUxFX0RFU0NSSVBUSU9OW3RoaXMudHlwZV1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCB0aXRsZURvY3VtZW50VXBsb2FkKCk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHRoaXMuZmlsZXMubGVuZ3RoID09PSAxICkge1xyXG4gICAgICByZXR1cm4gJ0RvY3VtZW50byBzdWJpZG8nXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gJ0RvY3VtZW50b3Mgc3ViaWRvcydcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCBtYXhGaWxlU2l6ZURlc2NyaXB0aW9uKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gRk9STUFUX0ZJTEVfU0laRSh0aGlzLm1heEZpbGVTaXplKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEZpbGVTaXplKHNpemU6IG51bWJlcik6c3RyaW5nIHtcclxuICAgIHJldHVybiBGT1JNQVRfRklMRV9TSVpFKHNpemUpO1xyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuY29udGVudCkge1xyXG4gICAgICAgIHRoaXMuZHJhZ092ZXJMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMuY29udGVudC5uYXRpdmVFbGVtZW50LCAnZHJhZ292ZXInLCB0aGlzLm9uRHJhZ092ZXIuYmluZCh0aGlzKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEZpbGVDYXRlZ29yeUljb24oZmlsZU5hbWU6IHN0cmluZykge1xyXG4gICAgY29uc3QgZXh0ZW5zaW9uID0gZmlsZU5hbWUuc2xpY2UoZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSlcclxuICAgIGlmKEZJTEVfVFlQRS5pbWFnZS5pbmNsdWRlcyhleHRlbnNpb24pKSByZXR1cm4gaUZpbGVJbWFnZVxyXG4gICAgZWxzZSBpZihGSUxFX1RZUEUuYXVkaW8uaW5jbHVkZXMoZXh0ZW5zaW9uKSkgcmV0dXJuIGlGaWxlQXVkaW9cclxuICAgIGVsc2UgaWYoRklMRV9UWVBFLnZpZGVvLmluY2x1ZGVzKGV4dGVuc2lvbikpIHJldHVybiBpRmlsZVZpZGVvXHJcbiAgICBlbHNlIHJldHVybiBpRmlsZVxyXG4gIH1cclxuXHJcbiAgLyogcHVibGljIG9uVXBsb2FkKGU6YW55KSB7XHJcbiAgICBjb25zb2xlLmxvZygnRWwgZTogJywgZSk7XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGUub3JpZ2luYWxFdmVudC5ib2R5KTtcclxuICAgIGZvcihsZXQgZmlsZSBvZiBlLmZpbGVzKSB7XHJcbiAgICAgIHRoaXMudXBsb2FkZWRGaWxlcy5wdXNoKHtcclxuICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxyXG4gICAgICAgIGlkOiBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyKVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfSAqL1xyXG5cclxuICBjaG9vc2VGaWxlKCkge1xyXG4gICAgdGhpcy5maWxlSW5wdXQubmF0aXZlRWxlbWVudC5jbGljaygpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb25GaWxlVXBsb2FkKGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgIFxyXG4gIH1cclxuICAvL1RPRE86IG5ldyBjb21wb25lbnRcclxuXHJcbiAgdmFsaWRhdGUoZmlsZTogRmlsZSk6IGJvb2xlYW4ge1xyXG4gICAgdGhpcy5tc2dzID0gW107XHJcblxyXG4gICAgaWYodGhpcy5maWxlTGltaXQgJiYgKHRoaXMuZmlsZUxpbWl0IDw9IHRoaXMuZmlsZXMubGVuZ3RoKSkge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogdGhpcy5pbnZhbGlkRmlsZUxpbWl0TWVzc2FnZVN1bW1hcnkucmVwbGFjZSgnezB9JywgKHRoaXMuZmlsZUxpbWl0IGFzIG51bWJlcikudG9TdHJpbmcoKSksXHJcbiAgICAgICAgZGV0YWlsOiB0aGlzLmludmFsaWRGaWxlTGltaXRNZXNzYWdlRGV0YWlsLnJlcGxhY2UoJ3swfScsICh0aGlzLmZpbGVMaW1pdCBhcyBudW1iZXIpLnRvU3RyaW5nKCkpXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZih0aGlzLmlzRmlsZUV4aXN0cyhmaWxlKSkge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogYEFyY2hpdm8gZHVwbGljYWRvLCBgLFxyXG4gICAgICAgIGRldGFpbDogYGVsIGFyY2hpdm8gJHtmaWxlLm5hbWV9IHlhIGhhIHNpZG8gc3ViaWRvLmBcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5hY2NlcHRlZEZpbGVzICYmICF0aGlzLmlzRmlsZVR5cGVWYWxpZChmaWxlKSkge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogdGhpcy5pbnZhbGlkRmlsZVR5cGVNZXNzYWdlU3VtbWFyeS5yZXBsYWNlKCd7MH0nLCBmaWxlLm5hbWUpLFxyXG4gICAgICAgIGRldGFpbDogdGhpcy5pbnZhbGlkRmlsZVR5cGVNZXNzYWdlRGV0YWlsLnJlcGxhY2UoJ3swfScsIHRoaXMuYWNjZXB0ZWRGaWxlcylcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5tYXhGaWxlU2l6ZSAmJiBmaWxlLnNpemUgPiB0aGlzLm1heEZpbGVTaXplKSB7XHJcbiAgICAgIHRoaXMubXNncy5wdXNoKHtcclxuICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcclxuICAgICAgICBzdW1tYXJ5OiB0aGlzLmludmFsaWRGaWxlU2l6ZU1lc3NhZ2VTdW1tYXJ5LnJlcGxhY2UoJ3swfScsIGZpbGUubmFtZSksXHJcbiAgICAgICAgZGV0YWlsOiB0aGlzLmludmFsaWRGaWxlU2l6ZU1lc3NhZ2VEZXRhaWwucmVwbGFjZSgnezB9JywgRk9STUFUX0ZJTEVfU0laRSh0aGlzLm1heEZpbGVTaXplKSlcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMucHJvY2Vzc1NpZ25Eb2N1bWVudC5lbWl0KHtwcm9jZXNzOjN9KVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmlzSW5NZW1vcnkgfHwgdGhpcy5pc0FjY3VtdWxhdGVkICkge1xyXG4gICAgICBsZXQgc3VtRmlsZSA9IGZpbGUuc2l6ZTtcclxuICAgICAgaWYgKCAodGhpcy5zdW1TaXplICsgc3VtRmlsZSkgPiB0aGlzLm1heEZpbGVTaXplICkge1xyXG4gICAgICAgIHRoaXMubXNncy5wdXNoKHtcclxuICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxyXG4gICAgICAgICAgc3VtbWFyeTogdGhpcy5pbnZhbGlkbWF4U2l6ZUxpbWl0TWVzc2FnZVN1bW1hcnkucmVwbGFjZSgnezB9JywgRk9STUFUX0ZJTEVfU0laRSh0aGlzLm1heEZpbGVTaXplKSksXHJcbiAgICAgICAgICBkZXRhaWw6IHRoaXMuaW52YWxpZG1heFNpemVMaW1pdE1lc3NhZ2VEZXRhaWwucmVwbGFjZSgnezB9JywgRk9STUFUX0ZJTEVfU0laRSh0aGlzLm1heEZpbGVTaXplIC0gdGhpcy5zdW1TaXplKSlcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnByb2Nlc3NTaWduRG9jdW1lbnQuZW1pdCh7cHJvY2VzczozfSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH0gICAgICAgICAgICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNGaWxlVHlwZVZhbGlkKGZpbGU6IEZpbGUpOiBib29sZWFuIHtcclxuICAgIGxldCBhY2NlcHRhYmxlVHlwZXMgPSB0aGlzLmFjY2VwdGVkRmlsZXM/LnNwbGl0KCcsJykubWFwKCh0eXBlKSA9PiB0eXBlLnRyaW0oKSk7XHJcbiAgICBmb3IgKGxldCB0eXBlIG9mIGFjY2VwdGFibGVUeXBlcyEpIHtcclxuICAgICAgbGV0IGFjY2VwdGFibGUgPSB0aGlzLmlzV2lsZGNhcmQodHlwZSkgPyB0aGlzLmdldFR5cGVDbGFzcyhmaWxlLnR5cGUpID09PSB0aGlzLmdldFR5cGVDbGFzcyh0eXBlKSA6IGZpbGUudHlwZSA9PSB0eXBlIHx8IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihmaWxlKS50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICBpZiAoYWNjZXB0YWJsZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZ2V0VHlwZUNsYXNzKGZpbGVUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGZpbGVUeXBlLnN1YnN0cmluZygwLCBmaWxlVHlwZS5pbmRleE9mKCcvJykpO1xyXG4gIH1cclxuXHJcbiAgaXNXaWxkY2FyZChmaWxlVHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZmlsZVR5cGUuaW5kZXhPZignKicpICE9PSAtMTtcclxuICB9XHJcblxyXG4gIGdldEZpbGVFeHRlbnNpb24oZmlsZTogRmlsZSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gJy4nICsgZmlsZS5uYW1lLnNwbGl0KCcuJykucG9wKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNGaWxlRXhpc3RzKGZpbGU6IEZpbGUpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGZpbGVGb3VuZCA9IHRoaXMuZmlsZXMuZmluZChpID0+IGkubm9tYnJlT3JpZ2VuID09PSBmaWxlLm5hbWUpXHJcbiAgICByZXR1cm4gZmlsZUZvdW5kICYmIChmaWxlRm91bmQudGFtYW55byA9PT0gZmlsZS5zaXplKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uRmlsZVNlbGVjdChldmVudDogYW55KSB7XHJcbiAgICBsZXQgZmlsZXMgPSBldmVudC5kYXRhVHJhbnNmZXIgPyBldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMgOiBldmVudC50YXJnZXQuZmlsZXM7XHJcbiAgICBpZih0aGlzLmZpbGVMaW1pdCAmJiBmaWxlcy5sZW5ndGggPiB0aGlzLmZpbGVMaW1pdCkge1xyXG4gICAgICB0aGlzLm1zZ3MgPSBbXVxyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogdGhpcy5pbnZhbGlkRmlsZUxpbWl0TWVzc2FnZVN1bW1hcnkucmVwbGFjZSgnezB9JywgKHRoaXMuZmlsZUxpbWl0IGFzIG51bWJlcikudG9TdHJpbmcoKSksXHJcbiAgICAgICAgZGV0YWlsOiB0aGlzLmludmFsaWRGaWxlTGltaXRNZXNzYWdlRGV0YWlsLnJlcGxhY2UoJ3swfScsICh0aGlzLmZpbGVMaW1pdCBhcyBudW1iZXIpLnRvU3RyaW5nKCkpXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICAgIGZvcihsZXQgaT0wOyBpPGZpbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGZpbGUgPSBmaWxlc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGUoZmlsZSkpIHtcclxuXHJcbiAgICAgICAgICBpZiAoICF0aGlzLmlzSW5NZW1vcnkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBsb2FkaW5nRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudG1wRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgICAgdGhpcy50bXBGb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcclxuICAgICAgICAgICAgLyogY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpXHJcbiAgICAgICAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgZXlKaGJHY2lPaUpJVXpVeE1pSjkuZXlKemRXSWlPaUpTVDBKRlVsUWdXa0ZEU0VGU1dTQkZVMUJKVGs5YVFTQkRSVk5RUlVSRlV5SXNJbWx6Y3lJNkltaDBkSEE2THk4eE9ERXVNVGMyTGpFME5TNHhOVFU2TnpBNE15OWpabVYwYjJ0bGJpOXlaWE52ZFhKalpYTXZkakl2Ykc5bmFXNVViMnRsYmlJc0ltbHdJam9pTVRreUxqRTJPQzR4TGpFMElpd2lkWE4xWVhKcGJ5STZleUpsYzNSaFpHOGlPaUl3TVNJc0ltbHdJam9pTVRreUxqRTJPQzR4TGpFMElpd2lkWE4xWVhKcGJ5STZJakV3TnpZME1qWTBJaXdpYVc1bWJ5STZleUpoY0dWc2JHbGtiMUJoZEdWeWJtOGlPaUpGVTFCSlRrOWFRU0lzSW1WelVISnBiV1Z5VEc5bmFXNGlPbVpoYkhObExDSmtibWtpT2lJeE1EYzJOREkyTkNJc0ltNXZiV0p5WlhNaU9pSlNUMEpGVWxRZ1drRkRTRUZTV1NJc0ltRndaV3hzYVdSdlRXRjBaWEp1YnlJNklrTkZVMUJGUkVWVEluMHNJbU52WkVSbGNHVnVaR1Z1WTJsaElqb2lOREF3TmpBeE5EVXdOQ0lzSW1SbGNHVnVaR1Z1WTJsaElqb2lOTUt3SUVaSlUwTkJURWxCSUZCU1QxWkpUa05KUVV3Z1VFVk9RVXdnUTA5U1VFOVNRVlJKVmtFZ1JFVWdWa1ZPVkVGT1NVeE1RU0lzSW1OdlpFUmxjM0JoWTJodklqb2lOREF3TmpBeE5EVXdOQzB5SWl3aWMyVmtaU0k2SWtOUFVsQlBVa0ZVU1ZaQklpd2laR1Z6Y0dGamFHOGlPaUl5d3JBZ1JFVlRVRUZEU0U4aUxDSmpiMlJEWVhKbmJ5STZJa1pRSWl3aVkyOWtVMlZrWlNJNklqQXdNVEF3SWl3aVkyRnlaMjhpT2lKR1NWTkRRVXdnVUZKUFZrbE9RMGxCVENJc0ltTnZaRVJwYzNSeWFYUnZSbWx6WTJGc0lqb2lNREEwTnlJc0ltUnBjM1J5YVhSdlJtbHpZMkZzSWpvaVJFbFRWRkpKVkU4Z1JrbFRRMEZNSUVSRklFeEpUVUVnVGs5U1QwVlRWRVVpTENKa2JtbEdhWE5qWVd3aU9pSXhNRGMyTkRJMk5DSXNJbVJwY21WalkybHZiaUk2SWtGQkxpQklTQzRnVEU5VElFeEpRMFZPUTBsQlJFOVRJRTFhTGlCV0xTQXpJRXhQVkVVZ016TWdMU0JXUlU1VVFVNUpURXhCSWl3aVptbHpZMkZzSWpvaVVrOUNSVkpVSUZwQlEwaEJVbGtnUlZOUVNVNVBXa0VnUTBWVFVFVkVSVk1pTENKamIzSnlaVzlHYVhOallXd2lPaUpqY21semIzUm5RR2h2ZEcxaGFXd3VZMjl0SWl3aVkyOWtTbVZ5WVhKeGRXbGhJam9pTURFaUxDSmpiMlJEWVhSbFoyOXlhV0VpT2lJd01TSXNJbU52WkVWemNHVmphV0ZzYVdSaFpDSTZJakF4SWl3aWRXSnBaMlZ2SWpvaU1EY3dNVEEySWl3aVpHbHpkSEpwZEc4aU9pSldSVTVVUVU1SlRFeEJJaXdpWTI5eWNtVnZJam9pWTNKcGMyOTBaMEJvYjNSdFlXbHNMbU52YlNJc0luUmxiR1ZtYjI1dklqb2lJaXdpYzJsemRHVnRZWE1pT2x0N0ltTnZaR2xuYnlJNklqRTBOU0lzSW05d1kybHZibVZ6SWpwYklqQXlJaXdpTURNaUxDSXdOQ0lzSWpBM0lpd2lNakVpTENJeU1pSXNJakl6SWl3aU1qUWlMQ0l5TlNJc0lqSTJJaXdpTWpnaUxDSXpNU0lzSWpRMklpd2lOVEFpWFN3aWNHVnlabWxzWlhNaU9sc2lNRE1pWFgwc2V5SmpiMlJwWjI4aU9pSXhORGNpTENKdmNHTnBiMjVsY3lJNlcxMHNJbkJsY21acGJHVnpJanBiSWpFeElsMTlMSHNpWTI5a2FXZHZJam9pTWpBd0lpd2liM0JqYVc5dVpYTWlPbHNpTWpBd0xUQXhJaXdpTWpBd0xUQXpJaXdpTWpBd0xUQTBJaXdpTWpBd0xUQTJJaXdpTWpBd0xUQTVJbDBzSW5CbGNtWnBiR1Z6SWpwYklqSTFJaXdpTWpraUxDSXpNU0pkZlN4N0ltTnZaR2xuYnlJNklqRTFOU0lzSW05d1kybHZibVZ6SWpwYklqQXlJaXdpTURRaUxDSXdOU0lzSWpBMklpd2lNRGNpTENJd09DSXNJakE1SWwwc0luQmxjbVpwYkdWeklqcGJJakl4SWwxOUxIc2lZMjlrYVdkdklqb2lNakF6SWl3aWIzQmphVzl1WlhNaU9sc2lNakF6TFRBeElpd2lNakF6TFRBeUlsMHNJbkJsY21acGJHVnpJanBiSWpZMElsMTlYWDBzSW1saGRDSTZNVFl5TlRjNE5qWTVOU3dpWlhod0lqb3hOemd6TlRVek1EazFmUS5NWVZuN2FVZi1DV29aYU5xUnZvQ1NBVXoxdDFKM0xPc1ZvczJTQVFqMW9ydmVYdllnMW9uaENSZTlQYlJrWEJiTVF2Q1pJQXQwSmdFa0xLeHpmam1NdycpICovXHJcbiAgICAgICAgICAgIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMudXJsfWAsIHRoaXMudG1wRm9ybURhdGEpXHJcbiAgICAgICAgICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICAgICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy51cGxvYWRpbmdGaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RmlsZXNTYXZlZChmaWxlLCByZXMuZGF0YSk7ICAgXHJcbiAgICAgICAgICAgICAgICAgLy8gdGhpcy5maWxlcy5wdXNoKHJlcy5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkaW5nRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLm1zZ3MgPSBbXVxyXG4gICAgICAgICAgICAgICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogJ0Vycm9yOiAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogYGVsIGFyY2hpdm8gJHtmaWxlLm5hbWV9IG5vIHB1ZG8gc2VyIGNhcmdhZG8uYFxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzLmZpbGVzLnB1c2goZmlsZS5uYW1lKVxyXG4gICAgICAgICAgICAvKiB0aGlzLmZpbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgIGlkOiA0MDMxMSArIGkgKyAxLFxyXG4gICAgICAgICAgICAgIGNhcnBldGE6IFwibWVzYS1wYXJ0ZXMvYW5leG9zXCIsXHJcbiAgICAgICAgICAgICAgZXh0ZW5zaW9uOiBcInBkZlwiLFxyXG4gICAgICAgICAgICAgIG1pbWV0eXBlOiBcImFwcGxpY2F0aW9uL3BkZlwiLFxyXG4gICAgICAgICAgICAgIHBhdGg6IFwibWVzYS1wYXJ0ZXMvYW5leG9zL2FuZXhvMS5wZGZcIixcclxuICAgICAgICAgICAgICB0YWdzOiBbXSxcclxuICAgICAgICAgICAgICBkZXRhbGxlOiB7fSxcclxuICAgICAgICAgICAgICBub21icmU6IGAke2ZpbGUubmFtZX1gLFxyXG4gICAgICAgICAgICAgIHRhbWFueW86IGZpbGUuc2l6ZSxcclxuICAgICAgICAgICAgICBwYWdpbmFzOiAxLFxyXG4gICAgICAgICAgICAgIGFyY2hpdm86IDYyMzMxMixcclxuICAgICAgICAgICAgICBmZWNDcmVhY2lvbjogXCIyMDIzLTA1LTI1IDE5OjI1OjA2XCIsXHJcbiAgICAgICAgICAgICAgZmVjTW9kaWZpY2FjaW9uOiBcIjIwMjMtMDUtMjUgMTk6MjU6MDZcIixcclxuICAgICAgICAgICAgICBub21icmVVc3VhcmlvQ3JlYWNpb246IFwiXCIsXHJcbiAgICAgICAgICAgICAgbm9tYnJlVXN1YXJpb01vZGlmaWNhY2lvbjogJydcclxuICAgICAgICAgICAgfSkgKi9cclxuICAgICAgICAgIH0gZWxzZSB7ICAgIFxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtub21icmVBcmNoaXZvOiBmaWxlLm5hbWUsbnVtZXJvRm9saW9zOjB9XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RmlsZXNTYXZlZChmaWxlLCBkYXRhKTsgICAgIFxyXG4gICAgICAgICAgIC8qIGxldCBpbmZvPXtcclxuICAgICAgICAgICAgICBpZDogdXVpZHY0KCksXHJcbiAgICAgICAgICAgICAgZmlsZTogZmlsZSxcclxuICAgICAgICAgICAgICBub21icmU6IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgICBub21icmVPcmlnZW46IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgICB0YW1hbnlvOiBmaWxlLnNpemVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmZpbGVzLnB1c2goaW5mbyk7ICAgXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q3VycmVudFN1bVNpemUoKTsgKi8gICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICBcclxuICB9XHJcblxyXG4gIHNldEZpbGVzU2F2ZWQoZmlsZTphbnksIGRhdGE6YW55KTp2b2lkIHtcclxuICAgIGxldCBpc0ZvY3VzID0gdGhpcy5maWxlcy5sZW5ndGggPT09IDAgPyB0cnVlOiBmYWxzZTtcclxuICAgIGxldCBpc0ZpcnN0ID0gdGhpcy5maWxlcy5sZW5ndGggPT09IDAgPyB0cnVlOiBmYWxzZTtcclxuICAgIGxldCBpbmZvPXtcclxuICAgICAgaWQ6IHV1aWR2NCgpLFxyXG4gICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICBub21icmU6IGRhdGEubm9tYnJlQXJjaGl2byxcclxuICAgICAgbnVtZXJvRm9saW9zOiBkYXRhLm51bWVyb0ZvbGlvcyxcclxuICAgICAgbm9tYnJlT3JpZ2VuOiBmaWxlLm5hbWUsXHJcbiAgICAgIHRhbWFueW86IGZpbGUuc2l6ZSxcclxuICAgICAgZGF0YVNlbGVjdGVkOiB0aGlzLmRhdGFEcm9wRG93blNlbGVjdGVkLFxyXG4gICAgICBkZXNjcmlwdGlvbkRvY3VtZW50OiBudWxsLFxyXG4gICAgICBvYnNlcnZhdGlvbkRvY3VtZW50OiBudWxsLFxyXG4gICAgICBub21icmVSYWRpbzogbnVsbCxcclxuICAgICAgb3B0aW9uUmFkaW86IG51bGwsXHJcbiAgICAgIGlzU2lnbjogZmFsc2UsXHJcbiAgICAgIGlzRm9jdXM6IGlzRm9jdXMsXHJcbiAgICAgIGlzRmlyc3Q6IGlzRmlyc3QsXHJcbiAgICAgIHByb2Nlc3M6IDAgLy8wIHBhcmEgdmlzdWFsaXphciwgMSBwYXJhIGZpcm1hciwgMiBlbGltaW5hciwgMyBzZSBzdXBlcm8gcGVzbyBtw6F4aW1vIHBlcm1pdG9cclxuICAgIH1cclxuICAgIHRoaXMuZmlsZXMucHVzaChpbmZvKVxyXG4gICAgdGhpcy5nZXRDdXJyZW50U3VtU2l6ZSgpXHJcbiAgICBpZiggaXNGb2N1cyApIHRoaXMucHJvY2Vzc1NpZ25Eb2N1bWVudC5lbWl0KGluZm8pXHJcbiAgfVxyXG5cclxuICAvKmVtaXR0ZXJGaXJzdEZpbGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLmZpbGVzWzBdLmlzRm9jdXMgPSB0cnVlXHJcbiAgICB0aGlzLnByb2Nlc3NTaWduRG9jdW1lbnQuZW1pdCh0aGlzLmZpbGVzWzBdKVxyXG4gIH0qL1xyXG5cclxuICBnZXRDdXJyZW50U3VtU2l6ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3VtU2l6ZSA9IHRoaXMuZmlsZXMubWFwKGZpbGUgPT4gZmlsZS50YW1hbnlvKVxyXG4gICAgICAgICAgICAucmVkdWNlKChhY2MsIHZhbHVlKSA9PiBhY2MgKyB2YWx1ZSwgMCk7XHJcbiAgICB0aGlzLnN1bVNpemVDaGFuZ2UuZW1pdCh0aGlzLnN1bVNpemUpO1xyXG4gIH1cclxuXHJcbiAgc2hvd0RvY3VtZW50KGZpbGU6YW55KTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCFmaWxlLmlzRm9jdXMpIHtcclxuICAgICAgdGhpcy5maWxlcy5tYXAoZmlsZUFycmF5ID0+IHtcclxuICAgICAgICBpZiAoZmlsZUFycmF5LmlkID09PSBmaWxlLmlkKSBmaWxlQXJyYXkuaXNGb2N1cyA9IHRydWVcclxuICAgICAgICBlbHNlIGZpbGVBcnJheS5pc0ZvY3VzID0gZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmaWxlLnByb2Nlc3MgPSAwXHJcbiAgICAgIHRoaXMucHJvY2Vzc1NpZ25Eb2N1bWVudC5lbWl0KGZpbGUpXHJcbiAgICB9XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzaWduRG9jdW1lbnQoZmlsZTphbnkpOiBib29sZWFuIHtcclxuICAgIC8qVkFMSURBQ0lPTiBGSUxFKi9cclxuICAgIHRoaXMubXNncyA9IFtdO1xyXG5cclxuICAgIGlmIChmaWxlLmRhdGFTZWxlY3RlZCA9PT0gbnVsbCB8fCBmaWxlLmRhdGFTZWxlY3RlZC5jb2RlID09PSAnVEREJykge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogJ1RpcG8gZGUgZG9jdW1lbnRvJyxcclxuICAgICAgICBkZXRhaWw6ICdTZWxlY2Npb25lIHVuIHRpcG8gZGUgZG9jdW1lbnRvJ1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmaWxlLmRlc2NyaXB0aW9uRG9jdW1lbnQgPT09IG51bGwgfHwgZmlsZS5kZXNjcmlwdGlvbkRvY3VtZW50ID09PSAnJykge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogJ07Dum1lcm8gZGUgZG9jdW1lbnRvJyxcclxuICAgICAgICBkZXRhaWw6ICdEw61naXRlIGRlc2NyaXBjacOzbiBkZSBuw7ptZXJvIGRlIGRvY3VtZW50bydcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZmlsZS5kZXNjcmlwdGlvbkRvY3VtZW50LnRyaW0oKS5sZW5ndGggPiA2MCkge1xyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXHJcbiAgICAgICAgc3VtbWFyeTogJ07Dum1lcm8gZGUgZG9jdW1lbnRvJyxcclxuICAgICAgICBkZXRhaWw6ICdMYSBkZXNjcmlwY2nDs24gZGUgbsO6bWVybyBkZSBkb2N1bWVudG8gbm8gZGViZSBzdXBlcmFyIGxvcyA2MCBjYXJhY3RlcmVzJ1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmaWxlLm9wdGlvblJhZGlvID09PSBudWxsIHx8IGZpbGUub3B0aW9uUmFkaW8gPT09ICcnKSB7XHJcbiAgICAgIHRoaXMubXNncy5wdXNoKHtcclxuICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcclxuICAgICAgICBzdW1tYXJ5OiAnVGlwbyBkZSBjb3BpYScsXHJcbiAgICAgICAgZGV0YWlsOiAnU2VsZWNjaW9uZSB1biB0aXBvIGRlIGNvcGlhIHbDoWxpZG8nXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFmaWxlLmlzRm9jdXMpIHtcclxuICAgICAgdGhpcy5maWxlcy5tYXAoZmlsZUFycmF5ID0+IHtcclxuICAgICAgICBpZiAoZmlsZUFycmF5LmlkID09PSBmaWxlLmlkKSBmaWxlQXJyYXkuaXNGb2N1cyA9IHRydWVcclxuICAgICAgICBlbHNlIGZpbGVBcnJheS5pc0ZvY3VzID0gZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlsZS5wcm9jZXNzID0gMVxyXG4gICAgdGhpcy5wcm9jZXNzU2lnbkRvY3VtZW50LmVtaXQoZmlsZSlcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9XHJcblxyXG4gIG9uRHJhZ0VudGVyKGU6IERyYWdFdmVudCkge1xyXG4gICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uRHJhZ092ZXIoZTogRHJhZ0V2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgLyogRG9tSGFuZGxlci5hZGRDbGFzcyh0aGlzLmNvbnRlbnQ/Lm5hdGl2ZUVsZW1lbnQsICdwLWZpbGV1cGxvYWQtaGlnaGxpZ2h0Jyk7XHJcbiAgICAgIHRoaXMuZHJhZ0hpZ2hsaWdodCA9IHRydWU7ICovXHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uRHJhZ0xlYXZlKGV2ZW50OiBEcmFnRXZlbnQpIHtcclxuICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAvLyBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMuY29udGVudD8ubmF0aXZlRWxlbWVudCwgJ3AtZmlsZXVwbG9hZC1oaWdobGlnaHQnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uRHJvcChldmVudDogYW55KSB7XHJcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgLy8gRG9tSGFuZGxlci5yZW1vdmVDbGFzcyh0aGlzLmNvbnRlbnQ/Lm5hdGl2ZUVsZW1lbnQsICdwLWZpbGV1cGxvYWQtaGlnaGxpZ2h0Jyk7XHJcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgbGV0IGZpbGVzID0gZXZlbnQuZGF0YVRyYW5zZmVyID8gZXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzIDogZXZlbnQudGFyZ2V0LmZpbGVzO1xyXG4gICAgICBsZXQgYWxsb3dEcm9wID0gdGhpcy5tdWx0aXBsZSB8fCAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoID09PSAxKTtcclxuXHJcbiAgICAgIGlmIChhbGxvd0Ryb3ApIHtcclxuICAgICAgICB0aGlzLm9uRmlsZVNlbGVjdChldmVudCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qIHB1YmxpYyBvbkRlbGV0ZUZpbGUoaWQ6IG51bWJlcikge1xyXG4gICAgY29uc3QgaW5kZXhUb0RlbGV0ZSA9IHRoaXMuZmlsZXMuZmluZEluZGV4KGkgPT4gaS5pZCA9PT0gaWQpO1xyXG4gICAgLy8gUmVtb3ZlIHZpYSBhcGkgYXdhaXRcclxuICAgIHRoaXMuZmlsZXMuc3BsaWNlKGluZGV4VG9EZWxldGUsIDEpO1xyXG4gIH0gKi9cclxuXHJcbiAgcHVibGljIHJlbW92ZUF0dGFjaG1lbnQoZmlsZTogYW55KTogdm9pZCB7XHJcbiAgICBpZiggIXRoaXMuaXNJbk1lbW9yeSApe1xyXG4gICAgLyogY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpXHJcbiAgICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciBleUpoYkdjaU9pSklVelV4TWlKOS5leUp6ZFdJaU9pSlNUMEpGVWxRZ1drRkRTRUZTV1NCRlUxQkpUazlhUVNCRFJWTlFSVVJGVXlJc0ltbHpjeUk2SW1oMGRIQTZMeTh4T0RFdU1UYzJMakUwTlM0eE5UVTZOekE0TXk5alptVjBiMnRsYmk5eVpYTnZkWEpqWlhNdmRqSXZiRzluYVc1VWIydGxiaUlzSW1sd0lqb2lNVGt5TGpFMk9DNHhMakUwSWl3aWRYTjFZWEpwYnlJNmV5SmxjM1JoWkc4aU9pSXdNU0lzSW1sd0lqb2lNVGt5TGpFMk9DNHhMakUwSWl3aWRYTjFZWEpwYnlJNklqRXdOelkwTWpZMElpd2lhVzVtYnlJNmV5SmhjR1ZzYkdsa2IxQmhkR1Z5Ym04aU9pSkZVMUJKVGs5YVFTSXNJbVZ6VUhKcGJXVnlURzluYVc0aU9tWmhiSE5sTENKa2Jta2lPaUl4TURjMk5ESTJOQ0lzSW01dmJXSnlaWE1pT2lKU1QwSkZVbFFnV2tGRFNFRlNXU0lzSW1Gd1pXeHNhV1J2VFdGMFpYSnVieUk2SWtORlUxQkZSRVZUSW4wc0ltTnZaRVJsY0dWdVpHVnVZMmxoSWpvaU5EQXdOakF4TkRVd05DSXNJbVJsY0dWdVpHVnVZMmxoSWpvaU5NS3dJRVpKVTBOQlRFbEJJRkJTVDFaSlRrTkpRVXdnVUVWT1FVd2dRMDlTVUU5U1FWUkpWa0VnUkVVZ1ZrVk9WRUZPU1V4TVFTSXNJbU52WkVSbGMzQmhZMmh2SWpvaU5EQXdOakF4TkRVd05DMHlJaXdpYzJWa1pTSTZJa05QVWxCUFVrRlVTVlpCSWl3aVpHVnpjR0ZqYUc4aU9pSXl3ckFnUkVWVFVFRkRTRThpTENKamIyUkRZWEpuYnlJNklrWlFJaXdpWTI5a1UyVmtaU0k2SWpBd01UQXdJaXdpWTJGeVoyOGlPaUpHU1ZORFFVd2dVRkpQVmtsT1EwbEJUQ0lzSW1OdlpFUnBjM1J5YVhSdlJtbHpZMkZzSWpvaU1EQTBOeUlzSW1ScGMzUnlhWFJ2Um1selkyRnNJam9pUkVsVFZGSkpWRThnUmtsVFEwRk1JRVJGSUV4SlRVRWdUazlTVDBWVFZFVWlMQ0prYm1sR2FYTmpZV3dpT2lJeE1EYzJOREkyTkNJc0ltUnBjbVZqWTJsdmJpSTZJa0ZCTGlCSVNDNGdURTlUSUV4SlEwVk9RMGxCUkU5VElFMWFMaUJXTFNBeklFeFBWRVVnTXpNZ0xTQldSVTVVUVU1SlRFeEJJaXdpWm1selkyRnNJam9pVWs5Q1JWSlVJRnBCUTBoQlVsa2dSVk5RU1U1UFdrRWdRMFZUVUVWRVJWTWlMQ0pqYjNKeVpXOUdhWE5qWVd3aU9pSmpjbWx6YjNSblFHaHZkRzFoYVd3dVkyOXRJaXdpWTI5a1NtVnlZWEp4ZFdsaElqb2lNREVpTENKamIyUkRZWFJsWjI5eWFXRWlPaUl3TVNJc0ltTnZaRVZ6Y0dWamFXRnNhV1JoWkNJNklqQXhJaXdpZFdKcFoyVnZJam9pTURjd01UQTJJaXdpWkdsemRISnBkRzhpT2lKV1JVNVVRVTVKVEV4Qklpd2lZMjl5Y21Wdklqb2lZM0pwYzI5MFowQm9iM1J0WVdsc0xtTnZiU0lzSW5SbGJHVm1iMjV2SWpvaUlpd2ljMmx6ZEdWdFlYTWlPbHQ3SW1OdlpHbG5ieUk2SWpFME5TSXNJbTl3WTJsdmJtVnpJanBiSWpBeUlpd2lNRE1pTENJd05DSXNJakEzSWl3aU1qRWlMQ0l5TWlJc0lqSXpJaXdpTWpRaUxDSXlOU0lzSWpJMklpd2lNamdpTENJek1TSXNJalEySWl3aU5UQWlYU3dpY0dWeVptbHNaWE1pT2xzaU1ETWlYWDBzZXlKamIyUnBaMjhpT2lJeE5EY2lMQ0p2Y0dOcGIyNWxjeUk2VzEwc0luQmxjbVpwYkdWeklqcGJJakV4SWwxOUxIc2lZMjlrYVdkdklqb2lNakF3SWl3aWIzQmphVzl1WlhNaU9sc2lNakF3TFRBeElpd2lNakF3TFRBeklpd2lNakF3TFRBMElpd2lNakF3TFRBMklpd2lNakF3TFRBNUlsMHNJbkJsY21acGJHVnpJanBiSWpJMUlpd2lNamtpTENJek1TSmRmU3g3SW1OdlpHbG5ieUk2SWpFMU5TSXNJbTl3WTJsdmJtVnpJanBiSWpBeUlpd2lNRFFpTENJd05TSXNJakEySWl3aU1EY2lMQ0l3T0NJc0lqQTVJbDBzSW5CbGNtWnBiR1Z6SWpwYklqSXhJbDE5TEhzaVkyOWthV2R2SWpvaU1qQXpJaXdpYjNCamFXOXVaWE1pT2xzaU1qQXpMVEF4SWl3aU1qQXpMVEF5SWwwc0luQmxjbVpwYkdWeklqcGJJalkwSWwxOVhYMHNJbWxoZENJNk1UWXlOVGM0TmpZNU5Td2laWGh3SWpveE56Z3pOVFV6TURrMWZRLk1ZVm43YVVmLUNXb1phTnFSdm9DU0FVejF0MUozTE9zVm9zMlNBUWoxb3J2ZVh2WWcxb25oQ1JlOVBiUmtYQmJNUXZDWklBdDBKZ0VrTEt4emZqbU13JykgKi9cclxuICAgICAgICAgIHRoaXMuaHR0cC5kZWxldGUoYCR7dGhpcy5kZWxldGVVUkx9JHtmaWxlLm5hbWV9YCkuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgbmV4dDogKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGluZGV4VG9EZWxldGUgPSB0aGlzLmZpbGVzLmZpbmRJbmRleChpID0+IGkuaWQgPT09IGZpbGUuaWQpO1xyXG4gICAgICAgICAgICAgIHRoaXMuZmlsZXMuc3BsaWNlKGluZGV4VG9EZWxldGUsIDEpO1xyXG4gICAgICAgICAgICAgIHRoaXMubXNncyA9IFtdXHJcbiAgICAgICAgICAgICAgdGhpcy5tc2dzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgIHN1bW1hcnk6IGAke2ZpbGUubm9tYnJlT3JpZ2VufTogYCxcclxuICAgICAgICAgICAgICAgIGRldGFpbDogYEVsIGFuZXhvIGZ1ZSBlbGltaW5hZG8gc2F0aXNmYWN0b3JpYW1lbnRlLmBcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIGZpbGUucHJvY2VzcyA9IDIgLy9lbGltaW5hclxyXG4gICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1NpZ25Eb2N1bWVudC5lbWl0KGZpbGUpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLm1zZ3MgPSBbXVxyXG4gICAgICAgICAgICAgIHRoaXMubXNncy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogYCR7ZmlsZS5ub21icmVPcmlnZW59OiBgLFxyXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBgRWwgYXJjaGl2byBubyBwdWRvIHNlciByZW1vdmlkby5gXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGluZGV4VG9EZWxldGUgPSB0aGlzLmZpbGVzLmZpbmRJbmRleChpID0+IGkuaWQgPT09IGZpbGUuaWQpO1xyXG4gICAgICB0aGlzLmZpbGVzLnNwbGljZShpbmRleFRvRGVsZXRlLCAxKTtcclxuICAgICAgdGhpcy5nZXRDdXJyZW50U3VtU2l6ZSgpO1xyXG4gICAgICB0aGlzLm1zZ3MgPSBbXVxyXG4gICAgICB0aGlzLm1zZ3MucHVzaCh7XHJcbiAgICAgICAgc2V2ZXJpdHk6ICdzdWNjZXNzJyxcclxuICAgICAgICBzdW1tYXJ5OiBgJHtmaWxlLm5vbWJyZU9yaWdlbn06IGAsXHJcbiAgICAgICAgZGV0YWlsOiBgRWwgYW5leG8gZnVlIGVsaW1pbmFkbyBzYXRpc2ZhY3RvcmlhbWVudGUuYFxyXG4gICAgICB9KVxyXG4gICAgICBmaWxlLnByb2Nlc3MgPSAyIC8vZWxpbWluYXJcclxuICAgICAgdGhpcy5wcm9jZXNzU2lnbkRvY3VtZW50LmVtaXQoZmlsZSlcclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcbiIsIjxkaXYgY2xhc3M9XCJmaWVsZFwiPlxyXG4gIDxsYWJlbCAqbmdJZj1cIiFpc1NpZ25EaWdpdGFsXCIgY2xhc3M9XCJibG9jayB0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIj57eyBsYWJlbCB9fTwvbGFiZWw+XHJcblxyXG4gIDxkaXYgI2NvbnRlbnQgKGRyYWdlbnRlcik9XCJvbkRyYWdFbnRlcigkZXZlbnQpXCIgKGRyYWdsZWF2ZSk9XCJvbkRyYWdMZWF2ZSgkZXZlbnQpXCIgKGRyb3ApPVwib25Ecm9wKCRldmVudClcIlxyXG4gICAgY2xhc3M9XCJmbGV4IGZsZXgtY29sdW1uIGFsaWduLWl0ZW1zLWNlbnRlciBib3JkZXItZGFzaGVkIGJvcmRlci1yb3VuZCBib3JkZXItMiBzZWxlY3Qtbm9uZSBzdXJmYWNlLWJvcmRlclwiXHJcbiAgICBbbmdDbGFzc109XCJpc1NpZ25EaWdpdGFsID8gJ3AtMycgOiAncC02J1wiPlxyXG4gICAgPGRpdiAqbmdJZj1cInVwbG9hZGluZ0ZpbGVcIiBjbGFzcz1cInctZnVsbCAtbXQtMyBtYi01XCI+XHJcbiAgICAgIDxwLXByb2dyZXNzQmFyIG1vZGU9XCJpbmRldGVybWluYXRlXCIgW3N0eWxlXT1cInsgaGVpZ2h0OiAnNnB4JyB9XCI+PC9wLXByb2dyZXNzQmFyPlxyXG4gICAgPC9kaXY+XHJcbiAgICA8cC1tZXNzYWdlcyBbdmFsdWVdPVwibXNnc1wiIFtlbmFibGVTZXJ2aWNlXT1cImZhbHNlXCI+PC9wLW1lc3NhZ2VzPlxyXG5cclxuICAgIDxmbi1pY29uIFtpY29dPVwiaUZpbGVVcGxvYWRcIiBoZWlnaHQ9XCIycmVtXCIgY29sb3I9XCIjQjNCM0IzXCIgY2xhc3M9XCJtYi0zIG10LTNcIj48L2ZuLWljb24+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZm9udC1zZW1pYm9sZFwiPlxyXG4gICAgICB7eyBmaXJzdExhYmVsIH19XHJcbiAgICAgIDxsYWJlbCAoY2xpY2spPVwiY2hvb3NlRmlsZSgpXCIgY2xhc3M9XCJ0ZXh0LWJsdWUtNDAwIHVuZGVybGluZSBjdXJzb3ItcG9pbnRlclwiPlxyXG4gICAgICAgIGhheiBjbGljayBhcXXDrVxyXG4gICAgICA8L2xhYmVsPlxyXG4gICAgICA8aW5wdXQgI2ZpbGVJbnB1dCBjbGFzcz1cImhpZGRlblwiIHR5cGU9XCJmaWxlXCIgW211bHRpcGxlXT1cIm11bHRpcGxlXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgW2FjY2VwdF09XCJhY2NlcHRlZEZpbGVzXCJcclxuICAgICAgICAoY2hhbmdlKT1cIm9uRmlsZVNlbGVjdCgkZXZlbnQpXCI+XHJcbiAgICA8L2Rpdj5cclxuICAgIDxwIGNsYXNzPVwidGV4dC1jZW50ZXIgcHgtNiB0ZXh0LTcwMFwiPnt7IGZpbGVzRGVzY3JpcHRpb24gfX08L3A+XHJcbiAgICA8cCBjbGFzcz1cImZvbnQtc2VtaWJvbGQgdGV4dC1zbSB0ZXh0LTcwMFwiPk3DoXhpbW8ge3sgbWF4RmlsZVNpemVEZXNjcmlwdGlvbiB9fSB7eyBwZXJGaWxlTGFiZWwgfX08L3A+XHJcbiAgPC9kaXY+XHJcblxyXG48L2Rpdj5cclxuXHJcbjxkaXYgY2xhc3M9XCJmaWVsZFwiICpuZ0lmPVwiZmlsZXMubGVuZ3RoID4gMCAmJiAhaXNTaWduRGlnaXRhbFwiPlxyXG4gIDxsYWJlbCBjbGFzcz1cImJsb2NrIHRleHQtc20gZm9udC1zZW1pYm9sZFwiPnt7IHRpdGxlRG9jdW1lbnRVcGxvYWQgfX08L2xhYmVsPlxyXG4gIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktY29udGVudC1iZXR3ZWVuIGFsaWduLWl0ZW1zLWNlbnRlciBtYi0yXCIgKm5nRm9yPVwibGV0IGZpbGUgb2YgZmlsZXM7IGxldCBpID0gaW5kZXhcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJmbGV4IGFsaWduLWl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic3VyZmFjZS0yMDAgYm9yZGVyLXJvdW5kIHB4LTEgcHktMiBmbGV4IGFsaWduLWl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICAgIDxmbi1pY29uIFtpY29dPVwiZ2V0RmlsZUNhdGVnb3J5SWNvbihmaWxlLm5vbWJyZSlcIj48L2ZuLWljb24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwibWwtM1wiPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1zZW1pYm9sZCBtci0xXCI+QW5leG8ge3sgaSsxIH19OiA8L3NwYW4+XHJcbiAgICAgICAge3sgZmlsZS5ub21icmVPcmlnZW4gfX1cclxuICAgICAgICA8aSBjbGFzcz1cInBpIHBpLWNoZWNrIHRleHQtZ3JlZW4tNTAwIG1sLTFcIj48L2k+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBhbGlnbi1pdGVtcy1jZW50ZXJcIj5cclxuICAgICAge3tnZXRGaWxlU2l6ZShmaWxlLnRhbWFueW8pfX1cclxuICAgICAgPHAtYnV0dG9uIChvbkNsaWNrKT1cInJlbW92ZUF0dGFjaG1lbnQoZmlsZSlcIiBjbGFzcz1cIm1sLTFcIiBzdHlsZUNsYXNzPVwicC1idXR0b24tdGV4dFwiPlxyXG4gICAgICAgIDxmbi1pY29uIFtpY29dPVwiaVRyYXNoQ2FuXCI+PC9mbi1pY29uPlxyXG4gICAgICA8L3AtYnV0dG9uPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvZGl2PlxyXG5cclxuPGRpdiBjbGFzcz1cImZpZWxkXCIgKm5nSWY9XCJmaWxlcy5sZW5ndGggPiAwICYmIGlzU2lnbkRpZ2l0YWwgJiYgIWlzU2lnbk1hc3NpdmVcIj5cclxuICA8ZGl2IGNsYXNzPVwibWItMlwiICpuZ0Zvcj1cImxldCBmaWxlIG9mIGZpbGVzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICA8ZGl2IFtuZ0NsYXNzXT1cImZpbGUuaXNGb2N1cyA/ICdiZy1jb2xvcicgOiAnbnVsbCdcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cImZsZXgganVzdGlmeS1jb250ZW50LWJldHdlZW4gYWxpZ24taXRlbXMtY2VudGVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGN1cnNvci1wb2ludGVyXCIgKGNsaWNrKT1cInNob3dEb2N1bWVudChmaWxlKVwiPlxyXG4gICAgICAgICAgPGZuLWljb24gW2ljb109XCJpRmlsZVwiIGhlaWdodD1cIjEuMXJlbVwiPjwvZm4taWNvbj5cclxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1zZW1pYm9sZCBtci0xXCI+QW5leG8ge3sgaSsxIH19OiA8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC13cmFwIGJvcmRlci1yb3VuZCBmbGV4IGFsaWduLWl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICAgICAgPGkgY2xhc3M9XCJwaSBwaS1jaGVjayB0ZXh0LWdyZWVuLTUwMCBtbC0xXCI+PC9pPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250c2l6ZS0xMCBtbC0xIG1yLTJcIj57e2dldEZpbGVTaXplKGZpbGUudGFtYW55byl9fTwvc3Bhbj5cclxuICAgICAgICAgIDxwLWJ1dHRvbiAqbmdJZj1cIiFmaWxlLmlzU2lnblwiIChvbkNsaWNrKT1cInNpZ25Eb2N1bWVudChmaWxlKVwiIHN0eWxlQ2xhc3M9XCJwLWJ1dHRvbi10ZXh0IHJlZmFjdG9yXCI+XHJcbiAgICAgICAgICAgIDxmbi1pY29uIFtpY29dPVwiaUVkaXRcIiBoZWlnaHQ9XCIxLjVyZW1cIj48L2ZuLWljb24+XHJcbiAgICAgICAgICA8L3AtYnV0dG9uPlxyXG4gICAgICAgICAgPHAtYnV0dG9uICpuZ0lmPVwiZmlsZS5pc1NpZ25cIiBzdHlsZUNsYXNzPVwicC1idXR0b24tdGV4dCByZWZhY3RvclwiIFtkaXNhYmxlZF09XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgIDxmbi1pY29uIFtpY29dPVwiaUNoZWNrXCIgaGVpZ2h0PVwiMS41cmVtXCI+PC9mbi1pY29uPlxyXG4gICAgICAgICAgPC9wLWJ1dHRvbj5cclxuICAgICAgICAgIDxwLWJ1dHRvbiAob25DbGljayk9XCJyZW1vdmVBdHRhY2htZW50KGZpbGUpXCIgc3R5bGVDbGFzcz1cInAtYnV0dG9uLXRleHQgcmVmYWN0b3JcIj5cclxuICAgICAgICAgICAgPGZuLWljb24gW2ljb109XCJpVHJhc2hDYW5cIiBoZWlnaHQ9XCIxLjVyZW1cIj48L2ZuLWljb24+XHJcbiAgICAgICAgICA8L3AtYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cIm1sLTMgY3Vyc29yLXBvaW50ZXJcIiAoY2xpY2spPVwic2hvd0RvY3VtZW50KGZpbGUpXCI+ICB7eyBmaWxlLm5vbWJyZU9yaWdlbiB9fSA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG5cclxuICAgIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktY29udGVudC1iZXR3ZWVuIGFsaWduLWl0ZW1zLWNlbnRlciBnYXAtMyBtdC0yXCI+XHJcbiAgICAgIDxwLWRyb3Bkb3duIFtvcHRpb25zXT1cImRhdGFEcm9wRG93blwiIFtkaXNhYmxlZF09XCJmaWxlLmlzU2lnblwiIFsobmdNb2RlbCldPVwiZmlsZS5kYXRhU2VsZWN0ZWRcIlxyXG4gICAgICAgIG9wdGlvbkxhYmVsPVwibGFiZWxcIj48L3AtZHJvcGRvd24+XHJcbiAgICAgIDxpbnB1dCBjbGFzcz1cImZsZXgtMVwiIHR5cGU9XCJ0ZXh0XCIgbWF4bGVuZ3RoPVwiNjBcIiBwSW5wdXRUZXh0IFsobmdNb2RlbCldPVwiZmlsZS5kZXNjcmlwdGlvbkRvY3VtZW50XCJcclxuICAgICAgICBbZGlzYWJsZWRdPVwiZmlsZS5pc1NpZ25cIiBwbGFjZWhvbGRlcj1cIkluZ3Jlc2FyIGVsIG7Dum1lcm8gZGVsIGRvY3VtZW50b1wiIC8+XHJcbiAgICA8L2Rpdj5cclxuICAgIDxkaXYgY2xhc3M9XCJmbGV4IGp1c3RpZnktY29udGVudC1iZXR3ZWVuIGFsaWduLWl0ZW1zLWNlbnRlciBtdC0yXCI+XHJcbiAgICAgIDxkaXYgKm5nSWY9XCIhZmlsZS5pc1NpZ25cIiBjbGFzcz1cImZsZXggZmxleC13cmFwIGdhcC0zXCI+XHJcbiAgICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgZGF0YVJhZGlvIG9mIGRhdGFSYWRpb0J1dHRvbjsgaW5kZXggYXMgaTtcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGFsaWduLWl0ZW1zLWNlbnRlclwiPlxyXG4gICAgICAgICAgICA8cC1yYWRpb0J1dHRvbiBuYW1lPVwidHlwZWNvcHlcIiB2YWx1ZT1cInt7ZGF0YVJhZGlvLmlkfX1cIiBbKG5nTW9kZWwpXT1cImZpbGUub3B0aW9uUmFkaW9cIlxyXG4gICAgICAgICAgICAgIGlucHV0SWQ9XCJvcnt7aX19e3tmaWxlLmlkfX1cIiAob25DbGljayk9XCJmaWxlLm5vbWJyZVJhZGlvID0gZGF0YVJhZGlvLm5vRGVzY3JpcGNpb25cIj48L3AtcmFkaW9CdXR0b24+XHJcbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJvcnt7aX19e3tmaWxlLmlkfX1cIiBjbGFzcz1cIm1sLTJcIj57e2RhdGFSYWRpby5ub0Rlc2NyaXBjaW9ufX08L2xhYmVsPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2ICpuZ0lmPVwiZmlsZS5pc1NpZ25cIiBjbGFzcz1cImZsZXggZmxleC13cmFwIGdhcC0zXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggYWxpZ24taXRlbXMtY2VudGVyXCI+XHJcbiAgICAgICAgICA8cC1yYWRpb0J1dHRvbiBuYW1lPVwicmVzdWx0XCIgdmFsdWU9XCJ7e2ZpbGUub3B0aW9uUmFkaW99fVwiIFsobmdNb2RlbCldPVwiZmlsZS5vcHRpb25SYWRpb1wiIFtkaXNhYmxlZF09XCJ0cnVlXCJcclxuICAgICAgICAgICAgaW5wdXRJZD1cIm9yZXN7e2ZpbGUuaWR9fVwiPjwvcC1yYWRpb0J1dHRvbj5cclxuICAgICAgICAgIDxsYWJlbCBjbGFzcz1cIm1sLTJcIj57e2ZpbGUubm9tYnJlUmFkaW99fTwvbGFiZWw+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImJhZGdlLWZpcm1hLW9rIGZsZXggYWxpZ24taXRlbXMtY2VudGVyXCI+XHJcbiAgICAgICAgICA8c3Bhbj5Eb2N1bWVudG8gZmlybWFkbyBkaWdpdGFsbWVudGU8L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2IGNsYXNzPVwibXQtMlwiPlxyXG4gICAgICA8aW5wdXQgY2xhc3M9XCJ3cC0xMDBcIiB0eXBlPVwidGV4dFwiIG1heGxlbmd0aD1cIjYwXCIgcElucHV0VGV4dCBbKG5nTW9kZWwpXT1cImZpbGUub2JzZXJ2YXRpb25Eb2N1bWVudFwiXHJcbiAgICAgIFtkaXNhYmxlZF09XCJmaWxlLmlzU2lnblwiIHBsYWNlaG9sZGVyPVwiT2JzZXJ2YWNpw7NuIChPcGNpb25hbClcIiAvPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvZGl2PiJdfQ==