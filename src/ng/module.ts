import { inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import {
    HRBAC,
    isPlainObject,
    PermissionManager,
    ResourceManager,
    RoleManager,
    StaticPermissionManager,
    StaticResourceManager,
    StaticRoleManager
} from '@neoskop/hrbac';
import { AllowedDirective, DeniedDirective } from './directives';
import { AllowedPipe, DeniedPipe } from './pipes';
import { _CONFIG, CONFIG, HrbacConfiguration } from './config';


export function configFactory(config : Partial<HrbacConfiguration>) : HrbacConfiguration {
    return {
        defaultRole     : 'guest',
        guardDenyHandler: {
            unauthenticated: [ '/login' ],
            unauthorized: [ '/unauthorized' ],
            ...(isPlainObject(config.guardDenyHandler) ? config.guardDenyHandler as {} : {})
        },
        ...config
    }
}

export function roleManagerFactory(roleManager : StaticRoleManager, config : HrbacConfiguration) : RoleManager {
    if(config.roles) {
        roleManager.import(config.roles instanceof InjectionToken ? inject(config.roles) : config.roles);
    }
    
    return roleManager;
}

export function resourceManagerFactory(resourceManager : StaticResourceManager, config : HrbacConfiguration) : ResourceManager {
    if(config.resources) {
        resourceManager.import(config.resources instanceof InjectionToken ? inject(config.resources) : config.resources);
    }
    
    return resourceManager;
}

export function permissionManagerFactory(permissionManager : StaticPermissionManager, config : HrbacConfiguration) : PermissionManager {
    if(config.permissions) {
        permissionManager.import(config.permissions instanceof InjectionToken ? inject(config.permissions) : config.permissions);
    }
    
    return permissionManager;
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
    ],
    providers: [
        HRBAC,
        StaticPermissionManager,
        StaticResourceManager,
        StaticRoleManager
    ]
})
export class HrbacModule {
    static forRoot(config : Partial<HrbacConfiguration> = {}) : ModuleWithProviders<HrbacModule> {
        return {
            ngModule : HrbacModule,
            providers: [
                { provide: _CONFIG, useValue: config },
                { provide: CONFIG, useFactory: configFactory, deps: [ _CONFIG ] },
                { provide: RoleManager, useFactory: roleManagerFactory, deps: [ StaticRoleManager, CONFIG ] },
                { provide: ResourceManager, useFactory: resourceManagerFactory, deps: [ StaticResourceManager, CONFIG ] },
                { provide: PermissionManager, useFactory: permissionManagerFactory, deps: [ StaticPermissionManager, CONFIG ] },
            ]
        }
    }
}
