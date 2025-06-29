import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _visible = signal(false);

  visible = this._visible.asReadonly();

  show(minDuration = 500) {
    this._visible.set(true);
    setTimeout(() => {
        this._visible.set(false);
    }, minDuration);
  }

  hide() {
    this._visible.set(false);
  }
}
