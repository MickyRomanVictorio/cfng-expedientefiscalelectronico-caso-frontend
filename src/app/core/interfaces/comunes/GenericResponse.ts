export interface GenericResponseList<T> {
    data: T[];
    message: string;
    code: number;
    id: number;
}

export interface PaginateResponseList<T> {
    data: T[];
    pages: number;
    perPage: number;
    total: number;
}

export interface GenericResponseModel<T> {
    data: T;
    message: string;
    code: number;
    id: number;
}

export interface GenericResponse {
    message: string;
    code: number;
    id: number;
}
