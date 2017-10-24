import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Role } from '..';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/skip';

export const DEFAULT_ROLE = new InjectionToken<string|Role>('DefaultRole');

@Injectable()
export class RoleStore {
  protected _role = new BehaviorSubject<Role|null>(null);
  readonly roleChange : Observable<Role|null> = this._role.skip(1);
  
  
  constructor(@Optional() @Inject(DEFAULT_ROLE) role? : string|Role) {
    if(role) {
      this.setRole(role);
    }
  }
  
  setRole(role : string|Role|null) {
    if(typeof role === 'string') {
      role = new Role(role);
    }
    
    this._role.next(role);
  }
  
  getRole() : Role|null {
    return this._role.value;
  }
}
