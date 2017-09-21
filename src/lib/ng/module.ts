import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import { PermissionTransfer, PermissionManager } from '../permission-manager';
import { Role } from '../types';
import { AllowedDirective, DeniedDirective } from './directives';
import { AllowedPipe, DeniedPipe } from './pipes';
import { _PERMISSIONS, _ROLES, _DEFAULT_ROLE } from './tokens';
import { DEFAULT_ROLE, RoleStore } from './role-store';
import { HierarchicalRoleBaseAccessControl } from '../hrbac';
import { RoleManager } from '../role-manager';
import { HrbacGuard } from './guard';

export function defaultRoleFactory(role : string = 'guest') {
    return new Role(role);
}

export interface IRoles {
    [role : string] : string[]
}

export interface IHrbacRootConfiguration {
    defaultRole? : string;
    roles? : IRoles;
    permissions? : PermissionTransfer;
}




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
export class HrbacChildModule {}

@NgModule({
    imports: [
        HrbacChildModule
    ],
    exports: [
        HrbacChildModule
    ]
})
export class HrbacRootModule {
    constructor(protected hrbac: HierarchicalRoleBaseAccessControl,
                @Inject(_ROLES) protected roles : IRoles,
                @Inject(_PERMISSIONS) protected permissions : PermissionTransfer) {
        if(roles) {
            hrbac.getRoleManager().import(roles);
        }

        if(permissions) {
            hrbac.getPermissionManager().import(permissions);
        }
    }
}


@NgModule({})
export class HrbacModule {
    static forRoot(config : IHrbacRootConfiguration = {}) : ModuleWithProviders {
        return {
            ngModule : HrbacRootModule,
            providers: [
                { provide: _DEFAULT_ROLE, useValue: config.defaultRole },
                { provide: _ROLES, useValue: config.roles },
                { provide: _PERMISSIONS, useValue: config.permissions },
                { provide: DEFAULT_ROLE, deps: [ _DEFAULT_ROLE ], useFactory: defaultRoleFactory },
                HierarchicalRoleBaseAccessControl,
                RoleManager,
                PermissionManager,
                RoleStore,
                HrbacGuard
            ]
        }
    }
    
    static forChild() : ModuleWithProviders {
        return {
            ngModule: HrbacChildModule,
            providers: []
        }
    }
    
    
}
