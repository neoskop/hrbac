import { Inject, inject, InjectionToken, ModuleWithProviders, NgModule, Optional } from '@angular/core';
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

export function hrbacFactory(): HRBAC {
    return new HRBAC(inject(RoleManager), inject(ResourceManager), inject(PermissionManager));
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
export class HrbacModule {
    static forRoot(config : Partial<HrbacConfiguration> = {}) : ModuleWithProviders<HrbacModule> {
        return {
            ngModule : HrbacModule,
            providers: [
                { provide: _CONFIG, useValue: config },
                { provide: CONFIG, useFactory: configFactory, deps: [ _CONFIG ] },
                { provide: HRBAC, useFactory: hrbacFactory },
                StaticRoleManager,
                StaticResourceManager,
                StaticPermissionManager,
                { provide: RoleManager, useFactory: roleManagerFactory, deps: [ StaticRoleManager, CONFIG ] },
                { provide: ResourceManager, useFactory: resourceManagerFactory, deps: [ StaticResourceManager, CONFIG ] },
                { provide: PermissionManager, useFactory: permissionManagerFactory, deps: [ StaticPermissionManager, CONFIG ] },
            ]
        }
    }

    constructor(@Optional() @Inject(HRBAC) hrbac?: HRBAC) {
        if(!hrbac) {
            throw new Error('You need to import "HrbacModule.forRoot" in your root module/component.');
        }
    }
}
