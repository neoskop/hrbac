import { Injectable } from '@angular/core';
import { RoleManager, IRoleManager } from './role-manager';
import { Resource, Role } from "./types";
import { PermissionManager, Type, IPermissionManager } from './permission-manager';

@Injectable()
export class HierarchicalRoleBaseAccessControl<
    R extends IRoleManager = RoleManager,
    P extends IPermissionManager = PermissionManager
>{
    
    constructor(protected readonly roleManager : R,
                protected readonly permissionManager : P) {
    }
    
    getRoleManager() : R {
        return this.roleManager;
    }
    
    getPermissionManager() : P {
        return this.permissionManager;
    }
    
    isAllowed(role : Role | string, resource : Resource | string, privilege : string | null = null) : boolean {
        if(typeof role === 'string') {
            role = new Role(role);
        }
        if(typeof resource === 'string') {
            resource = new Resource(resource);
        }
        
        const roles = this.getRoleManager().getRecursiveParentsOf(role).reverse();
        const aces = this.getPermissionManager().getAcesForRolesAndResource(roles, resource);
        
        
        let result : Type = Type.Deny;
        for(const ace of aces) {
            if(null === ace.assertion || ace.assertion.assert(this, role, resource, privilege)) {
                if(null === privilege) {
                    if(null === ace.privileges) {
                        result = ace.type;
                    }
                } else if(null === ace.privileges || ace.privileges.has(privilege)) {
                    result = ace.type;
                }
            }
        }
        
        return result === Type.Allow;
    }
    
    isDenied(role : Role | string, resource : Resource | string, privilege? : string | null) : boolean {
        return !this.isAllowed(role, resource, privilege);
    }
}
