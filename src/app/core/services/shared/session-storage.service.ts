import {Injectable} from '@angular/core';
import {Constants} from 'ngx-cfng-core-lib';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() {}

  get() {
    const _system = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (_system === null) return;
    const _systemParsed = JSON.parse(_system);
    return _systemParsed;
  }

  getItem(itemName: string) {
    const _system = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (_system === null) return;
    const _systemParsed = JSON.parse(_system);
    return _systemParsed[itemName];
  }

  createItem(itemName: string, itemValue: string) {
    const _system = this.get();
    const _systemUpdated = { ..._system, [itemName]: itemValue };
    sessionStorage.setItem(
      Constants.TOKEN_NAME,
      JSON.stringify(_systemUpdated)
    );
  }

  clearItem(itemName: string) {
    const _system = this.get();
    delete _system[itemName];
    sessionStorage.setItem(Constants.TOKEN_NAME, JSON.stringify(_system));
  }

  exist() {
    return !!sessionStorage.getItem(Constants.TOKEN_NAME);
  }

  existItem(itemName: string) {
    return this.exist() ? !!this.getItem(itemName) : false;
  }
}
