import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconAsset } from 'ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-file-info-caso',
  templateUrl: './file-info-caso.component.html',
  styleUrls: ['./file-info-caso.component.scss'],
  imports: [
    CommonModule,
  ],
})
export class FileInfoCaso {

  @Input() value: number = 0;

  constructor(
    protected iconAsset: IconAsset,
  ) { }
}
