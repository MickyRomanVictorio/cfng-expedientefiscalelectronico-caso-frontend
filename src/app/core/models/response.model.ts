interface StatusModel {
  isLoading: boolean;
}

interface DataModel {
  data: Array<any>;
  pages: number;
  perPage: number;
  total: number;
}

export interface ResponseDocumentCitationModel extends StatusModel {
  data: Array<any>;
}

export interface ResponseCatalogModel extends StatusModel {
  data: Array<any>;
}

export interface ResponsePaginateModel extends StatusModel {
  data: DataModel;
}

export interface ResponseModel extends StatusModel {
  data: any;
}
