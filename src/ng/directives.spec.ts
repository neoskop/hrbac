import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { TemplateRef } from '@angular/core';
import { AsyncHRBAC } from '../hrbac';
import { RoleStore } from "./role-store";
import { AllowedDirective, DeniedDirective } from "./directives";
import { RoleManager } from "../role-manager";
import { PermissionManager } from "../permission-manager";
import { SinonSpy, spy } from 'sinon';

use(sinonChai);

describe('AllowedDirective', () => {
    let hrbac : AsyncHRBAC;
    let roleStore : RoleStore;
    let directive : AllowedDirective;
    let viewContainerRef : {
        clear: SinonSpy,
        createEmbeddedView: SinonSpy
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
        const pm = new PermissionManager();
        hrbac = new AsyncHRBAC(new RoleManager() as any, pm as any);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore('guest');
        
        viewContainerRef = {
            clear: spy(function clear() {}),
            createEmbeddedView: spy(function createEmbeddedView() {})
        };
        
        directive = new AllowedDirective(hrbac, roleStore, viewContainerRef as any, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should display if allowed', async () => {
        directive.resource = 'index';
        
        directive.ngOnChanges(null as any);
        
        await isVisible();
    });
    
    it('should hide if not allowed', async () => {
        directive.resource = 'admin-user';
    
        directive.ngOnChanges(null as any);
        
        await isHidden();
    });
    
    it('should display if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
        
        roleStore.setRole('admin');
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should throw error when role cannot be resolved', () => {
        expect(() => {
            roleStore.setRole(null);
        }).to.throw(Error, 'Cannot resolve role');
    });
});

describe('DeniedDirective', () => {
    let hrbac : AsyncHRBAC;
    let roleStore : RoleStore;
    let directive : DeniedDirective;
    let viewContainerRef : {
        clear: SinonSpy,
        createEmbeddedView: SinonSpy
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
        const pm = new PermissionManager();
        hrbac = new AsyncHRBAC(new RoleManager() as any, pm as any);
        
        pm.allow('guest', 'index');
        pm.allow('guest', 'comment', [ 'read', 'create' ]);
        
        pm.allow('user', 'profil');
        pm.allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        pm.allow('admin');
        
        roleStore = new RoleStore('guest');
        
        viewContainerRef = {
            clear: spy(),
            createEmbeddedView: spy()
        };
        
        directive = new DeniedDirective(hrbac, roleStore, viewContainerRef as any, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should hide if allowed', async () => {
        directive.resource = 'index';
        
        directive.ngOnChanges(null as any);
        
        await isHidden();
    });
    
    it('should display if not allowed', async () => {
        directive.resource = 'admin-user';
    
        directive.ngOnChanges(null as any);
        
        await isVisible();
    });
    
    it('should hide if allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with privilege', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if allowed with role', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role', async () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should hide if allowed with role and privilege', async () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should display if not allowed with role and privilege', async () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
    });
    
    it('should update after roleUpdate on RoleStore', async () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        await isVisible();
        
        roleStore.setRole('admin');
    
        directive.ngOnChanges(null as any);
    
        await isHidden();
    });
    
    it('should throw error when role cannot be resolved', async () => {
        expect(() => {
            roleStore.setRole(null);
        }).to.throw(Error, 'Cannot resolve role');
    });
});

function wait() {
    return new Promise<void>(resolve => setTimeout(() => resolve(), 1));
}
