import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { TemplateRef } from '@angular/core';
import { HRBAC, StaticPermissionManager, StaticRoleManager } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { AllowedDirective, DeniedDirective } from "./directives";
import { SinonSpy, spy } from 'sinon';

use(sinonChai);

describe('AllowedDirective', () => {
    let hrbac : HRBAC;
    let roleStore : RoleStore;
    let directive : AllowedDirective;
    let viewContainerRef : {
        clear: SinonSpy,
        createEmbeddedView: SinonSpy
    };
    let cdr : {
        markForCheck: SinonSpy
    };
    const templateRef : TemplateRef<AllowedDirective> = {} as any;
    
    
    async function isVisible() {
        await wait();
        expect(viewContainerRef.createEmbeddedView).to.have.been.calledAfter(viewContainerRef.clear);
    }
    
    async function isHidden() {
        await wait();
        if(viewContainerRef.createEmbeddedView.callCount) {
            expect(viewContainerRef.clear).to.have.been.calledAfter(viewContainerRef.createEmbeddedView);
        } else {
            expect(viewContainerRef.clear).to.have.been.called;
        }
    }
    
    beforeEach(() => {
        const pm = new StaticPermissionManager();
        hrbac = new HRBAC(new StaticRoleManager() as any, pm as any);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
        
        viewContainerRef = {
            clear: spy(),
            createEmbeddedView: spy()
        };
        
        cdr = {
            markForCheck: spy()
        };
        
        directive = new AllowedDirective(hrbac, roleStore, cdr as any, viewContainerRef as any, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should display if allowed', async () => {
        directive.resource = 'index';
        
        await directive.ngOnChanges(null as any);
        
        await isVisible();
    });
    
    it('should hide if not allowed', async () => {
        directive.resource = 'admin-user';
    
        await directive.ngOnChanges(null as any);
        
        await isHidden();
    });
    
    it('should display if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
        
        roleStore.setRole('admin');
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
});

describe('DeniedDirective', () => {
    let hrbac : HRBAC;
    let roleStore : RoleStore;
    let directive : DeniedDirective;
    let viewContainerRef : {
        clear: sinon.SinonSpy,
        createEmbeddedView: sinon.SinonSpy
    };
    let cdr : {
        markForCheck: SinonSpy
    };
    const templateRef : TemplateRef<DeniedDirective> = {} as any;
    
    
    async function isVisible() {
        await wait();
        expect(viewContainerRef.createEmbeddedView).to.have.been.calledAfter(viewContainerRef.clear);
    }
    
    async function isHidden() {
        await wait();
        if(viewContainerRef.createEmbeddedView.callCount) {
            expect(viewContainerRef.clear).to.have.been.calledAfter(viewContainerRef.createEmbeddedView);
        } else {
            expect(viewContainerRef.clear).to.have.been.called;
        }
    }
    
    beforeEach(() => {
        const pm = new StaticPermissionManager();
        hrbac = new HRBAC(new StaticRoleManager() as any, pm as any);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
        
        viewContainerRef = {
            clear: spy(),
            createEmbeddedView: spy()
        };
    
        cdr = {
            markForCheck: spy()
        };
        
        directive = new DeniedDirective(hrbac, roleStore, cdr as any, viewContainerRef as any, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should hide if allowed', async () => {
        directive.resource = 'index';
        
        await directive.ngOnChanges(null as any);
        
        await isHidden();
    });
    
    it('should display if not allowed', async () => {
        directive.resource = 'admin-user';
    
        await directive.ngOnChanges(null as any);
        
        await isVisible();
    });
    
    it('should hide if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        await directive.ngOnChanges(null as any);
    
        await isVisible();
        
        roleStore.setRole('admin');
    
        await directive.ngOnChanges(null as any);
    
        await isHidden();
    });
});

function wait() {
    return new Promise<void>(resolve => setTimeout(() => resolve(), 1));
}
