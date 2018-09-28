import { RoleManager } from './role-manager';
import { Resource, Role } from "./types";
import { PermissionManager, Type } from './permission-manager';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HRBAC<RM extends RoleManager = RoleManager,
                   PM extends PermissionManager = PermissionManager> {
    protected readonly roleManager : RM;
    protected readonly permissionManager : PM;
    
    constructor(roleManager : RoleManager, permissionManager : PermissionManager) {
        this.roleManager = roleManager as RM;
        this.permissionManager = permissionManager as PM;
    }
    
    getRoleManager() : RM {
        return this.roleManager;
    }
    
    getPermissionManager() : PM {
        return this.permissionManager;
    }
    
    protected async getRecursiveParentsOf(role : Role) : Promise<string[]> {
        return (await this.getRoleManager().getRecursiveParentsOf(role)).reverse();
    }
    
    async isAllowed(role : Role | string, resource : Resource | string, privilege : string | null = null) : Promise<boolean> {
        if(typeof role === 'string') {
            role = new Role(role);
        }
        if(typeof resource === 'string') {
            resource = new Resource(resource);
        }
        
        const roles = await this.getRecursiveParentsOf(role);
        const aces = await this.getPermissionManager().getAcesForRolesAndResource(roles, resource);
        
        
        let result : Type = Type.Deny;
        for(const ace of aces) {
            if(null === ace.assertion || await ace.assertion.assert(this, role, resource, privilege)) {
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
    
    async isDenied(role : Role | string, resource : Resource | string, privilege? : string | null) : Promise<boolean> {
        return !(await this.isAllowed(role, resource, privilege));
    }
}
