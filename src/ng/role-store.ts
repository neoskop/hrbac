import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Role } from '@neoskop/hrbac';
import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

export const DEFAULT_ROLE = new InjectionToken<string|Role>('DefaultRole');

@Injectable()
export class RoleStore {
  protected _role = new BehaviorSubject<Role|null>(null);
  readonly roleChange : Observable<Role|null> = this._role.pipe(skip(1));
  
  
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
