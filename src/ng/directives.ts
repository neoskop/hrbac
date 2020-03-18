import {
    ChangeDetectorRef,
    Directive,
    Injectable,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription } from "rxjs";
import { RoleStore } from "./role-store";
import { Resource, Role, HRBAC } from '@neoskop/hrbac';

@Injectable()
export abstract class AbstractDirective implements OnChanges, OnDestroy {
  resource? : string|Resource;
  privilege : string|null = null;
  role? : string|Role;
  
  protected ngIf : NgIf;
  protected subscription : Subscription;
  
  protected abstract readonly trueValue : boolean;
  
  constructor(protected hrbac : HRBAC,
              protected roleStore : RoleStore,
              protected cdr : ChangeDetectorRef,
              viewContainer : ViewContainerRef,
              templateRef : TemplateRef<AbstractDirective>) {
    this.ngIf = new NgIf(viewContainer, templateRef as TemplateRef<any>);
    
    this.subscription = this.roleStore.roleChange.subscribe(() => {
      this.updateView();
    });
  }
  
  
  ngOnChanges(_changes : SimpleChanges) {
    return this.updateView();
  }
  
  updateView() : void {
    const role = this.role || this.roleStore.getRole();
    if(null == role) {
      throw new Error(`Cannot resolve role`);
    }
    Promise.resolve(this.hrbac.isAllowed(role!, this.resource!, this.privilege)).then(allowed => {
      this.ngIf.ngIf = this.trueValue === allowed;
      this.cdr.markForCheck()
    });
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

  constructor(hrbac : HRBAC,
    roleStore : RoleStore,
    cdr : ChangeDetectorRef,
    viewContainer : ViewContainerRef,
    templateRef : TemplateRef<AbstractDirective>) {
    super(hrbac, roleStore, cdr, viewContainer, templateRef);
  }
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

  constructor(hrbac : HRBAC,
    roleStore : RoleStore,
    cdr : ChangeDetectorRef,
    viewContainer : ViewContainerRef,
    templateRef : TemplateRef<AbstractDirective>) {
    super(hrbac, roleStore, cdr, viewContainer, templateRef);
  }
}


