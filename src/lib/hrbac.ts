import { RoleManager, AsyncRoleManager } from './role-manager';
import { Resource, Role, AsyncAssertion, Assertion } from "./types";
import { PermissionManager, Type, ACE, AsyncPermissionManager } from './permission-manager';
import { Injectable } from './utils';

export abstract class HierarchicalRoleBaseAccessControl<RM, PM> {
    
    constructor(protected readonly roleManager : RM,
                protected readonly permissionManager : PM) {
    }
    
    getRoleManager() : RM {
        return this.roleManager;
    }
    
    getPermissionManager() : PM {
        return this.permissionManager;
    }
}

@Injectable()
export class HRBAC extends HierarchicalRoleBaseAccessControl<RoleManager, PermissionManager> {
    
    constructor(roleManager : RoleManager, permissionManager : PermissionManager) {
        super(roleManager, permissionManager);
    }
    
    protected getRecursiveParentsOf(role : Role) : string[] {
        return this.getRoleManager().getRecursiveParentsOf(role).reverse();
    }
    
    protected getAcesForRolesAndResource(roles : string[], resource : Resource) : ACE<Assertion>[] {
        return this.getPermissionManager().getAcesForRolesAndResource(roles, resource)
    }
    
    isAllowed(role : Role | string, resource : Resource | string, privilege : string | null = null) : boolean {
        if(typeof role === 'string') {
            role = new Role(role);
        }
        if(typeof resource === 'string') {
            resource = new Resource(resource);
        }
        
        const roles = this.getRecursiveParentsOf(role);
        const aces = this.getAcesForRolesAndResource(roles, resource);
        
        
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

@Injectable()
export class AsyncHRBAC extends HierarchicalRoleBaseAccessControl<AsyncRoleManager, AsyncPermissionManager> {
    
    constructor(roleManager : AsyncRoleManager, permissionManager : AsyncPermissionManager) {
        super(roleManager, permissionManager);
    }
    
    protected async getRecursiveParentsOf(role : Role) : Promise<string[]> {
        return (await this.getRoleManager().getRecursiveParentsOf(role)).reverse();
    }
    
    protected getAcesForRolesAndResource(roles : string[], resource : Resource) : Promise<ACE<AsyncAssertion>[]>|ACE<AsyncAssertion>[] {
        return this.getPermissionManager().getAcesForRolesAndResource(roles, resource)
    }
    
    async isAllowed(role : Role | string, resource : Resource | string, privilege : string | null = null) : Promise<boolean> {
        if(typeof role === 'string') {
            role = new Role(role);
        }
        if(typeof resource === 'string') {
            resource = new Resource(resource);
        }
        
        const roles = await this.getRecursiveParentsOf(role);
        const aces = await this.getAcesForRolesAndResource(roles, resource);
        
        
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

