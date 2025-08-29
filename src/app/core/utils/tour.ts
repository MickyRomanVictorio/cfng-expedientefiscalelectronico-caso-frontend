import {Injectable} from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class tourService {
  private tour: any;
  buttons = {
    first: [
      {
        text: 'Anterior',
        classes: 'shepherd-button-none'
      },
      {
        action: () => this.tour.next(),
        text: 'Siguiente',
        classes: 'shepherd-button-next'
      }
    ],
    middle: [
      {
        action: () => this.tour.back(),
        text: 'Anterior',
        classes: 'shepherd-button-back'
      },
      {
        action: () => this.tour.next(),
        text: 'Siguiente',
        classes: 'shepherd-button-next'
      }
    ],
    last: [
      {
        action: () => this.tour.back(),
        text: 'Anterior',
        classes: 'shepherd-button-back'
      }
    ]
  };

  private getButtons(index: number, totalSteps: number) {
    if (index === 0) return this.buttons.first;
    if (index === totalSteps - 1) return this.buttons.last;
    return this.buttons.middle;
  }

  constructor() {
    this.tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: '',
        scrollTo: {behavior: 'smooth', block: 'center'}
      },
      useModalOverlay: true,
    });
  }

  startTour(stepsData: {}[]) {
    this.tour.steps = [];
    stepsData.forEach((step, index) => {
      this.tour.addStep({
        ...step,
        buttons: this.getButtons(index, stepsData.length)
      });
    });
    this.tour.start();
  }

}
