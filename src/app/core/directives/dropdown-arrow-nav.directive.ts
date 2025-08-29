import { AfterViewInit, Directive, HostListener, Input } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Directive({
  selector: 'p-dropdown:not([noArrowNav])',
})
export class DropdownArrowNavDirective implements AfterViewInit {
  /** true = al mover con flechas selecciona y dispara onChange */
  @Input() selectOnFocus: boolean = true;

  constructor(private dd: Dropdown) {}

  ngAfterViewInit(): void {
    const d = this.dd as any;

    // Que al abrir haya una opción enfocada (para que ↑/↓ funcionen).
    d.autoOptionFocus = true;

    // Foco en la LISTA al abrir (no en el input de filtro) => flechas navegan opciones.
    d.autofocusFilter = false;

    // No cambia la lógica, pero mejora UX.
    d.resetFilterOnHide = true;

    // Selecciona al enfocar (dispara onChange al moverse con flechas).
    d.selectOnFocus = this.selectOnFocus;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    const k = e.key;
    const d = this.dd as any;

    // Panel cerrado + ↑/↓ => abrir SIN avanzar (evita caer en el 2.º ítem)
    if ((k === 'ArrowDown' || k === 'ArrowUp') && !d.overlayVisible) {
      e.preventDefault();
      e.stopPropagation();
      (e as any).stopImmediatePropagation?.();

      // Abrimos en el próximo tick para que este keydown no lo procese el dropdown.
      setTimeout(() => {
        d.show(); // con autoOptionFocus, se enfoca el 1.º; si selectOnFocus=true, se selecciona también
      }, 0);


    }

    // resto de teclas: lo maneja PrimeNG normalmente
  }
}
