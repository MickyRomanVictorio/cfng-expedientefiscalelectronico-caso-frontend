export interface PaginacionInterface {
  limit: number,
  page: number,
  resetPage: boolean,
  data: any
}

export interface FiltroPaginacionInterface {
  page: number,
  per_page: number,
}