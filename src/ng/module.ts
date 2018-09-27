import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import {
    HRBAC,
    PermissionManager,
    PermissionTransfer,
    Role,
    RoleManager,
    StaticRoleManager,
    StaticPermissionManager
} from '@neoskop/hrbac';
import { AllowedDirective, DeniedDirective } from './directives';
import { AllowedPipe, DeniedPipe } from './pipes';
import { _DEFAULT_ROLE, _PERMISSIONS, _ROLES } from './tokens';
import { DEFAULT_ROLE, RoleStore } from './role-store';
import { HrbacGuard } from './guard';

export function defaultRoleFactory(role : string = 'guest') {
    return new Role(role);
}

export interface IRoles {
    [role : string] : string[]
}

export interface IAsyncHrbacRootConfiguration {
    defaultRole?: string;
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
    constructor(protected hrbac: HRBAC<StaticRoleManager, StaticPermissionManager>,
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
                StaticRoleManager,
                StaticPermissionManager,
                { provide: RoleManager, useExisting: StaticRoleManager },
                { provide: PermissionManager, useExisting: StaticPermissionManager },
                RoleStore,
                HrbacGuard,
                HRBAC
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
