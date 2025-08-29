export interface Module {
    module: string,
    url: string,
    count: number,
    icon?: string,
    options: Option[]
    code?: string,
}

export interface Option {
    id?: number,
    name: string,
    url: string,
    count: number,
    extended: boolean,
    children: SubOption[]
}

export interface SubOption {
    id?: number,
    name: string,
    url: string,
    count: number,
}
