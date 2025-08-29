export interface ListResponse<T> extends BaseResponse {
  data: Array<T>;
}

export interface BaseResponse {
  timestamp: Date;
  message: string;
  code: number;
}

export interface Response<T> {
  timestamp: Date;
  message: string;
  code: number;
  data: T;
}

export interface Respuesta<T> {
  message: string;
  code: number;
  data: T;
}
export interface InfoResponse {
  message: string;
  code: number;
}
