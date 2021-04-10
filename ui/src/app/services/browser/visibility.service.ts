import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  private readonly HIDDEN_PROP: string;
  private readonly VISIBILITY_EVENT: string;

  private _visible$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor() {
    if (typeof document.hidden !== "undefined") {
      this.HIDDEN_PROP = "hidden";
      this.VISIBILITY_EVENT = "visibilitychange";
    } else if (typeof (document as any).msHidden !== "undefined") {
      this.HIDDEN_PROP = "msHidden";
      this.VISIBILITY_EVENT = "msvisibilitychange";
    } else if (typeof (document as any).webkitHidden !== "undefined") {
      this.HIDDEN_PROP = "webkitHidden";
      this.VISIBILITY_EVENT = "webkitvisibilitychange";
    }

    document.addEventListener(this.VISIBILITY_EVENT,
      () => this._visible$.next(this.isVisible()),
      false
    );
  }

  isVisible(): boolean {
    return document[this.HIDDEN_PROP];
  }

  get visible$(): Observable<boolean> {
    return this._visible$.asObservable();
  }
}
