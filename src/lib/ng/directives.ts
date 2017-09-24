import { Directive, Injectable, OnChanges, OnDestroy, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { HRBAC } from '../hrbac';
import { NgIf } from '@angular/common';
import { Subscription } from "rxjs/Subscription";
import { RoleStore } from "./role-store";
import { Resource, Role } from '../types';

@Injectable()
export abstract class AbstractDirective implements OnChanges, OnDestroy {
  resource : string|Resource;
  privilege : string|null = null;
  role : string|Role;
  
  protected ngIf : NgIf;
  protected subscription : Subscription;
  
  protected abstract readonly trueValue : boolean;
  
  constructor(protected hrbac : HRBAC,
              protected roleStore : RoleStore,
              viewContainer : ViewContainerRef,
              templateRef : TemplateRef<AbstractDirective>) {
    this.ngIf = new NgIf(viewContainer, templateRef as TemplateRef<any>);
    
    this.subscription = this.roleStore.roleChange.subscribe(() => {
      this.updateView();
    });
  }
  
  
  ngOnChanges(_changes : SimpleChanges) : void {
    this.updateView();
  }
  
  updateView() {
    const role = this.role || this.roleStore.getRole();
    if(null == role) {
      throw new Error(`Cannot resolve role`);
    }
    this.ngIf.ngIf =
      this.trueValue === this.hrbac.isAllowed(role!, this.resource, this.privilege);
  }
  
  
  ngOnDestroy() : void {
    this.subscription.unsubscribe();
  }
}

@Directive({
  selector: '[neoAllowed],[neo-allowed]',
  inputs: [
    'resource: neoAllowed',
    'privilege: neoAllowedPrivilege',
    'role: neoAllowedRole'
  ]
})
export class AllowedDirective extends AbstractDirective {
  protected readonly trueValue = true;
}

@Directive({
  selector: '[neoDenied],[neo-denied]',
  inputs: [
    'resource: neoDenied',
    'privilege: neoDeniedPrivilege',
    'role: neoDeniedRole'
  ]
})
export class DeniedDirective extends AbstractDirective {
  protected readonly trueValue = false;
}


