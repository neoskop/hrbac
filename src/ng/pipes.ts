import { ChangeDetectorRef, Injectable, OnDestroy, Pipe, PipeTransform, OnInit } from '@angular/core';
import { RoleStore } from './role-store';
import { Subscription } from 'rxjs/Subscription';
import { Resource, Role , AsyncHRBAC} from '@neoskop/hrbac';

@Injectable()
export abstract class AbstractPipe implements PipeTransform, OnDestroy, OnInit {
    private _latestValue : boolean|null = null;
    private _latestResourceId : string;
    private _latestPrivilege : string|null;
    private _latestRoleId : string;
    private _role : Role | null;
    
    protected subscription : Subscription;
    
    protected abstract readonly trueValue : boolean;
    
    constructor(protected hrbac : AsyncHRBAC,
                protected roleStore : RoleStore,
                protected cdr : ChangeDetectorRef) {
        this.subscription = this.roleStore.roleChange.subscribe((role) => {
            this._role = role;
            this.cdr.markForCheck();
        });
    }
    
    async ngOnInit() {
        this._role = await this.roleStore.getRole();
        this.cdr.markForCheck();
    }
    
    transform(resource : string | Resource, privilege : string | null = null, role : string | Role | null = null) {
        role = role || this._role;
        
        if(!role) {
            return this._latestValue;
        }
        
        const resourceId = (resource as Resource).resourceId || resource as string;
        const roleId = (role as Role).roleId || role as string;
        
        if(resourceId === this._latestResourceId && roleId === this._latestRoleId && privilege === this._latestPrivilege) {
            return this._latestValue;
        }
        this._latestValue = null;
    
        Promise.resolve(this.hrbac.isAllowed(role!, resource, privilege)).then(allowed => {
            this._latestResourceId = resourceId;
            this._latestRoleId = roleId;
            this._latestPrivilege = privilege;
            this._latestValue = this.trueValue === allowed;
            this.cdr.markForCheck();
        });
        
        return this._latestValue;
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
