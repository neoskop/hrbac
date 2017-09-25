import { ChangeDetectorRef, Injectable, OnDestroy, Pipe, PipeTransform, WrappedValue } from '@angular/core';
import { AsyncHRBAC } from '../hrbac';
import { RoleStore } from './role-store';
import { Subscription } from 'rxjs/Subscription';
import { Resource, Role } from '../types';

@Injectable()
export abstract class AbstractPipe implements PipeTransform, OnDestroy {
    private _latestValue : boolean = false;
    private _latestResourceId : string;
    private _latestPrivilege : string|null;
    private _latestRoleId : string;
    
    protected subscription : Subscription;
    
    protected abstract readonly trueValue : boolean;
    
    constructor(protected hrbac : AsyncHRBAC,
                protected roleStore : RoleStore,
                protected cdr : ChangeDetectorRef) {
        this.subscription = this.roleStore.roleChange.subscribe(() => {
            this.cdr.markForCheck();
        });
    }
    
    transform(resource : string | Resource, privilege : string | null = null, role : string | Role | null = null) {
        role = role || this.roleStore.getRole();
    
        if(!role) {
            throw new Error('Cannot resolve current role');
        }
        
        const resourceId = (resource as Resource).resourceId || resource as string;
        const roleId = (role as Role).roleId || role as string;
        
        if(resourceId === this._latestResourceId && roleId === this._latestRoleId && privilege === this._latestPrivilege) {
            return this._latestValue;
        }
    
        Promise.resolve(this.hrbac.isAllowed(role!, resource, privilege)).then(allowed => {
            this._latestResourceId = resourceId;
            this._latestRoleId = roleId;
            this._latestPrivilege = privilege;
            this._latestValue = this.trueValue === allowed;
            this.cdr.markForCheck();
        });
        
        return WrappedValue.wrap(false);
    }
    
    ngOnDestroy() : void {
        this.subscription.unsubscribe();
    }
}

@Pipe({ name: 'neoAllowed', pure: false })
export class AllowedPipe extends AbstractPipe {
    protected readonly trueValue = true;
}

@Pipe({ name: 'neoDenied', pure: false })
export class DeniedPipe extends AbstractPipe {
    protected readonly trueValue = false;
}
