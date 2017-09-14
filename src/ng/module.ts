import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { HierarchicalRoleBaseAccessControl } from '../hrbac';
import { RoleManager } from '../role-manager';
import { PermissionManager, PermissionTransfer } from '../permission-manager';
import { Role } from '../types';
import { DEFAULT_ROLE, RoleStore } from './role-store';
import { HrbacGuard } from "./guard";
import { AllowedDirective, DeniedDirective } from "./directives";
import { AllowedPipe, DeniedPipe } from './pipes';

export function defaultRoleFactory(role : string = 'guest') {
    return new Role(role);
}

export function hrbacFactory(roleManager : RoleManager,
                             permissionManager : PermissionManager,
                             roles? : { [role : string] : string[] },
                             permissions? : PermissionTransfer) {
    const hrbac = new HierarchicalRoleBaseAccessControl(roleManager, permissionManager);
    
    if(roles) {
        hrbac.getRoleManager().import(roles);
    }
    
    if(permissions) {
        hrbac.getPermissionManager().import(permissions);
    }
    
    return hrbac;
}

export interface IHrbacRootConfiguration {
    defaultRole? : string;
    roles? : { [role : string] : string[] };
    permissions? : PermissionTransfer;
}

export const _DEFAULT_ROLE = new InjectionToken<string | undefined>('DefaultRole');
export const _ROLES = new InjectionToken<{ [role : string] : string[] } | undefined>('Roles');
export const _PERMISSIONS = new InjectionToken<PermissionTransfer | undefined>('Permissions');

@NgModule({
    declarations: [
        AllowedDirective,
        DeniedDirective,
        AllowedPipe,
        DeniedPipe
    ],
    exports     : [
        AllowedDirective,
        DeniedDirective,
        AllowedPipe,
        DeniedPipe
    ]
})
export class HrbacModule {
    static forRoot(config : IHrbacRootConfiguration = {}) : ModuleWithProviders {
        return {
            ngModule : HrbacModule,
            providers: [
                { provide: _DEFAULT_ROLE, useValue: config.defaultRole },
                { provide: _ROLES, useValue: config.roles },
                { provide: _PERMISSIONS, useValue: config.permissions },
                {
                    provide: HierarchicalRoleBaseAccessControl,
                    deps: [ RoleManager, PermissionManager, _ROLES, _PERMISSIONS ],
                    useFactory: hrbacFactory
                },
                RoleManager,
                PermissionManager,
                RoleStore,
                { provide: DEFAULT_ROLE, deps: [ _DEFAULT_ROLE ], useFactory: defaultRoleFactory },
                HrbacGuard
            ]
        }
    }
    
}
