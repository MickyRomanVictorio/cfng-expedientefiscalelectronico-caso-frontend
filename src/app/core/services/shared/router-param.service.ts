import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouterParamService {
  constructor(private router: Router) {}

  getParam(param: string): string | null {
    for (const route of this.getCurrentRoutesChain()) {
      if (route.snapshot.paramMap.has(param)) {
        return route.snapshot.paramMap.get(param);
      }
    }
    return null;
  }

  getCurrentRoutesChain(): ActivatedRoute[] {
    let currentRoute = this.router.routerState.root;
    const results: ActivatedRoute[] = [currentRoute];
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
      results.push(currentRoute);
    }
    return results;
  }
}
