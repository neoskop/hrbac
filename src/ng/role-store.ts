import { Inject, Injectable } from '@angular/core';
import { Role } from '@neoskop/hrbac';
import { BehaviorSubject, Observable } from 'rxjs';
import { skip } from 'rxjs/operators';
import { CONFIG, HrbacConfiguration } from './config';

@Injectable({ providedIn: 'root' })
export class RoleStore {
  protected _role = new BehaviorSubject<Role|null>(null);
  readonly roleChange : Observable<Role|null> = this._role.pipe(skip(1));
  
  
  constructor(@Inject(CONFIG) config : HrbacConfiguration) {
    this.setRole(config.defaultRole);
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
