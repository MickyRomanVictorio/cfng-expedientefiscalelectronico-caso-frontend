import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, CmpLibModule],
  templateUrl: './paginator.component.html',
  styleUrls: [],
})
export class PaginatorComponent implements OnChanges {
  protected obtenerIcono = obtenerIcono;

  @Input() query: any;
  @Input() items: any;
  @Input() rowsPerPageOptions = [10, 20, 30];
  @Input() resetPage: boolean = false;
  @Output() paginate = new EventEmitter<PaginacionInterface>();
  currentPage: number = 1;

  ngOnChanges(changes: SimpleChanges): void {
    this.currentPage = this.query.page;
    setTimeout(() => {
      changes['resetPage'] &&
        changes['resetPage'].currentValue &&
        this.goToPage(1);
    }, 0);
  }

  get rows(): number {
    return this.query.limit;
  }

  get totalPages(): number {
    return Math.ceil(this.items.data.total / this.rows);
  }

  paginateTable() {
    const start = (this.currentPage - 1) * this.rows;
    let dataPaginate = {
      page: this.currentPage - 1,
      first: start,
      rows: this.rows,
      pageCount: this.endPage + 1,
    };
    this.onPageChange(dataPaginate);
  }

  goToPage(page: number) {
    if (page === this.currentPage) return;
    this.currentPage = page;
    this.paginateTable();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateTable();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateTable();
    }
  }

  shouldShowPage(page: number) {
    return (
      page === 1 ||
      page === this.totalPages ||
      (page >= this.startPage && page <= this.endPage)
    );
  }

  get startPage() {
    return Math.max(2, this.currentPage - 2);
  }

  get endPage() {
    return Math.min(this.totalPages - 1, this.currentPage + 2);
  }

  pagesToShow() {
    const pages = [];
    for (let i = this.startPage; i <= this.endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(paginator: any) {
    this.paginate.emit({
      limit: paginator.rows,
      page: paginator.page + 1,
      resetPage: false,
      data: this.items.data.data,
    });
  }
}
