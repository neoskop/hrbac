import { inject, InjectionToken } from '@angular/core';
import { PermissionTransfer, Role } from '@neoskop/hrbac';
import { Router } from '@angular/router';
import { RouteResource } from './route-resource';


export interface IRoles {
    [role : string] : string[]
}

export interface IResources {
    [role : string] : string[]
}

export interface GuardDenyHandlerArgs {
    role: Role;
    resource: RouteResource;
    privilege: string | null;
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
    roles? : IRoles | InjectionToken<IRoles>;
    resources? : IResources | InjectionToken<IResources>;
    permissions? : PermissionTransfer | InjectionToken<PermissionTransfer>;
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
