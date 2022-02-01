import { RoleManager } from './role-manager';
import { Resource, Role } from "./types";
import { PermissionManager, Type } from './permission-manager';
import { Injectable } from '@angular/core';
import { ResourceManager } from './resource-manager';

@Injectable({ providedIn: 'root' })
export class HRBAC<RolM extends RoleManager = RoleManager,
                   ResM extends ResourceManager = ResourceManager,
                   PM extends PermissionManager = PermissionManager> {
    protected readonly roleManager : RolM;
    protected readonly resourceManager : ResM;
    protected readonly permissionManager : PM;
    
    constructor(roleManager : RoleManager, resourceManager: ResourceManager, permissionManager : PermissionManager) {
        this.roleManager = roleManager as RolM;
        this.resourceManager = resourceManager as ResM;
        this.permissionManager = permissionManager as PM;
    }
    
    getRoleManager() : RolM {
        return this.roleManager;
    }
    
    getResourceManager() : ResM {
        return this.resourceManager;
    }
    
    getPermissionManager() : PM {
        return this.permissionManager;
    }
    
    protected async getRecursiveParentRolesOf(role : Role) : Promise<string[]> {
        return (await this.getRoleManager().getRecursiveParentsOf(role)).reverse();
    }
    
    protected async getRecursiveParentResourcesOf(resource : Resource) : Promise<string[]> {
        return (await this.getResourceManager().getRecursiveParentsOf(resource)).reverse();
    }
    
    async isAllowed(role : Role | string, resource : Resource | string, privilege : string | null = null) : Promise<boolean> {
        if(typeof role === 'string') {
            role = new Role(role);
        }
        if(typeof resource === 'string') {
            resource = new Resource(resource);
        }
        
        const roles = await this.getRecursiveParentRolesOf(role);
        const resources = await this.getRecursiveParentResourcesOf(resource);
        const aces = await this.getPermissionManager().getAcesForRolesAndResources(roles, resources);
        
        
        let result : Type = Type.Deny;
        for(const ace of aces) {
            if(null === privilege) {
                if(null === ace.privileges) {
                    if(null === ace.assertion || await ace.assertion.assert(this, role, resource, privilege)) {
                        result = ace.type;
                    }
                }
            } else if((null === ace.privileges || ace.privileges.has(privilege)) && (null === ace.assertion || await ace.assertion.assert(this, role, resource, privilege))) {
                result = ace.type;
            }
        }
        
        return result === Type.Allow;
    }
    
    async isDenied(role : Role | string, resource : Resource | string, privilege? : string | null) : Promise<boolean> {
        return !(await this.isAllowed(role, resource, privilege));
    }
}
