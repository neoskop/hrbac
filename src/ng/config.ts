import { inject, InjectionToken } from '@angular/core';
import { PermissionTransfer, Resource, Role } from '@neoskop/hrbac';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';


export interface IRoles {
    [role : string] : string[]
}

export interface GuardDenyHandlerArgs {
    role: Role;
    resource: Resource;
    privilege: string | null;
    route: ActivatedRouteSnapshot;
    state : RouterStateSnapshot;
}
export interface GuardDenyHandler {
    (args : GuardDenyHandlerArgs) : void|Promise<void>;
}

export interface GuardDenyHandlerConfig {
    unauthorized: any[];
    unauthenticated: any[];
}

export interface HrbacConfiguration {
    defaultRole : string;
    guardDenyHandler: InjectionToken<GuardDenyHandler> | GuardDenyHandlerConfig;
    roles? : IRoles;
    permissions? : PermissionTransfer;
}

export function guardDenyHandlerFactory() : GuardDenyHandler {
    const config = inject(CONFIG);
    
    if(config.guardDenyHandler instanceof InjectionToken) {
        return inject(config.guardDenyHandler);
    }
    
    const router = inject(Router);
    
    return ({ role } : GuardDenyHandlerArgs) => {
        if(role.roleId === config.defaultRole) {
            router.navigate((config.guardDenyHandler as GuardDenyHandlerConfig).unauthenticated);
        } else {
            router.navigate((config.guardDenyHandler as GuardDenyHandlerConfig).unauthorized);
        }
    }
}

export const _CONFIG = new InjectionToken<Partial<HrbacConfiguration>>('_HRBAC_CONFIG');
export const CONFIG = new InjectionToken<HrbacConfiguration>('HRBAC_CONFIG');
export const GUARD_DENY_HANDLER = new InjectionToken<GuardDenyHandler>('HRBAC_GUARD_DENY_HANDLER', {
    providedIn: 'root',
    factory: guardDenyHandlerFactory
});
