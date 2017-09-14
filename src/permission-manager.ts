import { Injectable } from '@angular/core';
import { Assertion, AssertionFunction, Resource, Role } from "./types";

export interface IPermissionManager {
    getAcesForRolesAndResource(roles : string[], resource : Resource|string|null) : ACE[];
}

export enum Type {
  Deny = 'deny',
  Allow = 'allow'
}

type TRole = string|null;
type TResource = string|null;

export class ACE {
  constructor(public readonly type : Type,
              public readonly privileges : Set<string>|null,
              public readonly assertion : Assertion|null) {}
}

export class ACL extends Map<TResource, ACE[]>{
  
  add(role : TResource, ace : ACE) {
    if(!this.has(role)) {
      this.set(role, []);
    }
    this.get(role)!.push(ace);
  }
  
  static create<K, V>(arr? : [ K, V ][]) : ACL {
    const map = new Map<K, V>(arr);
    Object.setPrototypeOf(map, ACL.prototype);
    
    return map as any;
  }
}

export class ACLS extends Map<TRole, ACL> {
  
  get(role : TRole) : ACL {
    if(!this.has(role)) {
      this.set(role, ACL.create());
    }
    
    return super.get(role)!;
  }
  
  
  static create<K, V>(arr? : [ K, V ][]) : ACLS {
    const map = new Map<K, V>(arr);
    Object.setPrototypeOf(map, ACLS.prototype);
    
    return map as any;
  }
}

@Injectable()
export class PermissionManager implements IPermissionManager {
  protected acls = ACLS.create();
  
  protected add(type : Type,
                role : Role|string|null = null,
                resource : Resource|string|null = null,
                privilege : string[]|string|null = null,
                assertion : AssertionFunction|Assertion|null = null) {
    const roleId : TRole = role && (role as Role).roleId || role as string;
    const resourceId : TResource = resource && (resource as Resource).resourceId || resource as string;
    if(typeof assertion === 'function') {
      assertion = new Assertion(assertion);
    }
    
    if(typeof privilege === 'string') {
      privilege = [ privilege ];
    }
    
    const privileges : Set<string>|null = privilege && new Set(privilege);
    
    this.acls.get(roleId).add(resourceId, new ACE(type, privileges, assertion));
  }
  
  allow(role? : Role|string|null,
        resource? : Resource|string|null,
        privilege? : string[]|string|null,
        assertion? : AssertionFunction|Assertion|null) : void {
    this.add(Type.Allow, role, resource, privilege, assertion);
  }
  
  deny(role? : Role|string|null,
       resource? : Resource|string|null,
       privilege? : string[]|string|null,
       assertion? : AssertionFunction|Assertion|null) : void {
    this.add(Type.Deny, role, resource, privilege, assertion);
  }
  
  getAcesForRolesAndResource(roles : string[], resource : Resource|string|null) : ACE[] {
    const resourceId : TResource = resource && (resource as Resource).resourceId || resource as string;
    let result : ACE[] = [];
    
    for(const [ role, acl ] of this.acls) {
      for(const r of roles) {
        if(null === role || r === role) {
          for(const [ res, aces ] of acl) {
            if(null === res || res === resourceId) {
              result.push(...aces);
            }
          }
        }
      }
    }
    
    return result;
  }
}
