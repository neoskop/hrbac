import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { TemplateRef } from '@angular/core';
import { HierarchicalRoleBaseAccessControl } from '../hrbac';
import { RoleStore } from "./role-store";
import { AllowedDirective, DeniedDirective } from "./directives";
import { RoleManager } from "../role-manager";
import { PermissionManager } from "../permission-manager";
import { SinonSpy, spy } from 'sinon';

use(sinonChai);

describe('AllowedDirective', () => {
    let hrbac : HierarchicalRoleBaseAccessControl;
    let roleStore : RoleStore;
    let directive : AllowedDirective;
    let viewContainerRef : {
        clear: SinonSpy,
        createEmbeddedView: SinonSpy
    };
    const templateRef : TemplateRef<AllowedDirective> = {} as any;
    
    
    function isVisible() {
        expect(viewContainerRef.createEmbeddedView).to.have.been.calledAfter(viewContainerRef.clear);
    }
    
    function isHidden() {
        if(viewContainerRef.createEmbeddedView.callCount) {
            expect(viewContainerRef.clear).to.have.been.calledAfter(viewContainerRef.createEmbeddedView);
        } else {
            expect(viewContainerRef.clear).to.have.been.called;
        }
    }
    
    beforeEach(() => {
        hrbac = new HierarchicalRoleBaseAccessControl(new RoleManager(), new PermissionManager());
        
        hrbac.getPermissionManager().allow('guest', 'index');
        hrbac.getPermissionManager().allow('guest', 'comment', [ 'read', 'create' ]);
        
        hrbac.getPermissionManager().allow('user', 'profil');
        hrbac.getPermissionManager().allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        hrbac.getPermissionManager().allow('admin');
        
        roleStore = new RoleStore('guest');
        
        viewContainerRef = {
            clear: spy(),
            createEmbeddedView: spy()
        };
        
        directive = new AllowedDirective(hrbac, roleStore, viewContainerRef as any, templateRef)
    });
    
    afterEach(() => {
        directive.ngOnDestroy();
    });
    
    it('should display if allowed', () => {
        directive.resource = 'index';
        
        directive.ngOnChanges(null as any);
        
        isVisible();
    });
    
    it('should hide if not allowed', () => {
        directive.resource = 'admin-user';
    
        directive.ngOnChanges(null as any);
        
        isHidden();
    });
    
    it('should display if allowed with privilege', () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should hide if not allowed with privilege', () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should display if allowed with role', () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should hide if not allowed with role', () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should display if not allowed with role and privilege', () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should hide if not allowed with role and privilege', () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should update after roleUpdate on RoleStore', () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
        
        roleStore.setRole('admin');
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should throw error when role cannot be resolved', () => {
        expect(() => {
            roleStore.setRole(null);
        }).to.throw(Error, 'Cannot resolve role');
    });
});

describe('DeniedDirective', () => {
    let hrbac : HierarchicalRoleBaseAccessControl;
    let roleStore : RoleStore;
    let directive : DeniedDirective;
    let viewContainerRef : {
        clear: SinonSpy,
        createEmbeddedView: SinonSpy
    };
    const templateRef : TemplateRef<DeniedDirective> = {} as any;
    
    
    function isVisible() {
        expect(viewContainerRef.createEmbeddedView).to.have.been.calledAfter(viewContainerRef.clear);
    }
    
    function isHidden() {
        if(viewContainerRef.createEmbeddedView.callCount) {
            expect(viewContainerRef.clear).to.have.been.calledAfter(viewContainerRef.createEmbeddedView);
        } else {
            expect(viewContainerRef.clear).to.have.been.called;
        }
    }
    
    beforeEach(() => {
        hrbac = new HierarchicalRoleBaseAccessControl(new RoleManager(), new PermissionManager());
        
        hrbac.getPermissionManager().allow('guest', 'index');
        hrbac.getPermissionManager().allow('guest', 'comment', [ 'read', 'create' ]);
        
        hrbac.getPermissionManager().allow('user', 'profil');
        hrbac.getPermissionManager().allow('user', 'comment', [ 'read', 'create', 'update' ]);
        
        hrbac.getPermissionManager().allow('admin');
        
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
    
    it('should hide if allowed', () => {
        directive.resource = 'index';
        
        directive.ngOnChanges(null as any);
        
        isHidden();
    });
    
    it('should display if not allowed', () => {
        directive.resource = 'admin-user';
    
        directive.ngOnChanges(null as any);
        
        isVisible();
    });
    
    it('should hide if allowed with privilege', () => {
        directive.resource = 'comment';
        directive.privilege = 'read';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should display if not allowed with privilege', () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should hide if allowed with role', () => {
        directive.resource = 'profil';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should display if not allowed with role', () => {
        directive.resource = 'admin-center';
        directive.role = 'user';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should hide if allowed with role and privilege', () => {
        directive.resource = 'profil';
        directive.role = 'user';
        directive.privilege = 'update';
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should display if not allowed with role and privilege', () => {
        directive.resource = 'comment';
        directive.role = 'user';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
    });
    
    it('should update after roleUpdate on RoleStore', () => {
        directive.resource = 'comment';
        directive.privilege = 'delete';
    
        directive.ngOnChanges(null as any);
    
        isVisible();
        
        roleStore.setRole('admin');
    
        directive.ngOnChanges(null as any);
    
        isHidden();
    });
    
    it('should throw error when role cannot be resolved', () => {
        expect(() => {
            roleStore.setRole(null);
        }).to.throw(Error, 'Cannot resolve role');
    });
});
