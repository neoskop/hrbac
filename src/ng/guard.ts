import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { HRBAC } from '@neoskop/hrbac';
import { RouteResource } from './route-resource';
import { RoleStore } from './role-store';
import { GUARD_DENY_HANDLER, GuardDenyHandler } from './config';

@Injectable({ providedIn: 'root' })
export class HrbacGuard implements CanActivate, CanActivateChild {
    
    constructor(protected hrbac : HRBAC,
                protected roleStore : RoleStore,
                @Inject(GUARD_DENY_HANDLER) protected denyHandler : GuardDenyHandler) {
        
    }
    
    async canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Promise<boolean> {
        const resourceId : string | undefined = route.data[ 'resourceId' ];
        const privilege : string | null = route.data[ 'privilege' ] || null;
        
        if(!resourceId) {
            throw new Error(`resourceId in route.data required for HrbacGuard, ${JSON.stringify(route.data)} given.`)
        }
        
        const role = await this.roleStore.getRole();
        
        if(!role) {
            throw new Error(`Cannot resolve current role for ${resourceId}`);
        }
        
        const resource = new RouteResource(resourceId, route, state);
        
        const isAllowed = await this.hrbac.isAllowed(role!, resource, privilege);
        
        if(!isAllowed) {
            await this.denyHandler({ role, resource, privilege, route, state });
        }
        
        return isAllowed;
    }
    
    
    canActivateChild(childRoute : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Promise<boolean> {
        return this.canActivate(childRoute, state);
    }
}
