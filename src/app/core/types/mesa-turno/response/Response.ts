export type ListItemResponse = {
    id: number,
    nombre: string,
    idEquivalente?: number,
}

export type ListItemResponseForm = {
    id: number,
    idEquivalente?: number,
    nombre: string
}

export type MaestroResponse = {
    code: number,
    message: string,
    data: ListItemResponse[]
  }