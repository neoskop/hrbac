import 'reflect-metadata';
import { ChangeDetectorRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { HRBAC, StaticPermissionManager, StaticRoleManager, StaticResourceManager } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { AllowedDirective, DeniedDirective } from "./directives";
import { HrbacConfiguration } from './config';


describe('AllowedDirective', () => {
    let hrbac : HRBAC;
    let roleStore : RoleStore;
    let directive : AllowedDirective;
    let viewContainerRef : {
        clear: jest.Mock,
        createEmbeddedView: jest.Mock
    };
    let cdr : {
        markForCheck: jest.Mock
    };
    const templateRef : TemplateRef<AllowedDirective> = {} as any;
    
    
    async function isVisible() {
        await wait();
        expect(viewContainerRef.clear).not.toHaveBeenCalled();
        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    }
    
    async function isHidden() {
        await wait();
        if(viewContainerRef.createEmbeddedView.mock.calls) {
            expect(viewContainerRef.clear).toHaveBeenCalled();
        } else {
            expect(viewContainerRef.clear).not.toHaveBeenCalled();
        }
    }
    
    beforeEach(() => {
        const pm = new StaticPermissionManager();
        hrbac = new HRBAC(new StaticRoleManager(), new StaticResourceManager(), pm);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore({ defaultRole: 'guest' } as HrbacConfiguration);
        
        viewContainerRef = {
            clear: jest.fn(),
            createEmbeddedView: jest.fn().mockReturnValue({})
        };

        cdr = {
            markForCheck: jest.fn()
        };
        
        directive = new AllowedDirective(hrbac, roleStore, cdr as unknown as ChangeDetectorRef, viewContainerRef as unknown as ViewContainerRef, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should display if allowed', async () => {
        directive.resource = 'index';
        
        await directive.ngOnChanges({});
        
        await isVisible();
    });
    
    it('should hide if not allowed', async () => {
        directive.resource = 'admin-user';
    
        await directive.ngOnChanges({});
        
        await isHidden();
    });
    
    it('should display if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should hide if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should display if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should hide if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should hide if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isHidden();
        
        roleStore.setRole('admin');
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
});

describe('DeniedDirective', () => {
    let hrbac : HRBAC;
    let roleStore : RoleStore;
    let directive : DeniedDirective;
    let viewContainerRef : {
        clear: jest.Mock,
        createEmbeddedView: jest.Mock
    };
    let cdr : {
        markForCheck: jest.Mock
    };
    const templateRef : TemplateRef<DeniedDirective> = {} as any;
    
    
    async function isVisible() {
        await wait();
        expect(viewContainerRef.clear).not.toHaveBeenCalled();
        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    }
    
    async function isHidden() {
        await wait();
        if(viewContainerRef.createEmbeddedView.mock.calls) {
            expect(viewContainerRef.clear).toHaveBeenCalled();
        } else {
            expect(viewContainerRef.clear).not.toHaveBeenCalled();
        }
    }
    
    beforeEach(() => {
        const pm = new StaticPermissionManager();
        hrbac = new HRBAC(new StaticRoleManager(), new StaticResourceManager(), pm);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore({ defaultRole: 'guest' } as HrbacConfiguration);
        
        viewContainerRef = {
            clear: jest.fn(),
            createEmbeddedView: jest.fn().mockReturnValue({})
        };

        cdr = {
            markForCheck: jest.fn()
        };
        
        directive = new DeniedDirective(hrbac, roleStore, cdr as unknown as ChangeDetectorRef, viewContainerRef as unknown as ViewContainerRef, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should hide if allowed', async () => {
        directive.resource = 'index';
        
        await directive.ngOnChanges({});
        
        await isHidden();
    });
    
    it('should display if not allowed', async () => {
        directive.resource = 'admin-user';
    
        await directive.ngOnChanges({});
        
        await isVisible();
    });
    
    it('should hide if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should display if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should hide if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should display if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should hide if allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isVisible();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges({});
    
        await isVisible();
        
        roleStore.setRole('admin');
    
        await directive.ngOnChanges({});
    
        await isHidden();
    });
});

function wait() {
    return new Promise<void>(resolve => setTimeout(() => resolve(), 1));
}
