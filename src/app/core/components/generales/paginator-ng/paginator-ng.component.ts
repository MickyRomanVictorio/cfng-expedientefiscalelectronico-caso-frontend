import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-paginator-ng',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  templateUrl: './paginator-ng.component.html',
  styleUrls: [],
})
export class PaginatorNGComponent {
  @Input() query: any;
  @Input() items: any;
  @Input() rowsPerPageOptions = [10, 20, 30];
  @Output() paginate = new EventEmitter<object>();

  onPageChange(paginator: any) {
    this.paginate.emit({
      limit: paginator.rows,
      page: paginator.page + 1,
    });
  }
}
