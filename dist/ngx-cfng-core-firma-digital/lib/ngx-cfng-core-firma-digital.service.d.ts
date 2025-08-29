import * as i0 from "@angular/core";
export declare class NgxCfngCoreFirmaDigitalService {
    private scripts;
    load(scriptName: string, src: string): Promise<void>;
    loadScriptsSequentially(scripts: {
        name: string;
        src: string;
    }[]): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxCfngCoreFirmaDigitalService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NgxCfngCoreFirmaDigitalService>;
}
