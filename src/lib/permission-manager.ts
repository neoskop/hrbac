import { Injectable } from '@angular/core';
import { Assertion, AssertionFunction, Resource, Role } from "./types";

export interface IPermissionManager {
    getAcesForRolesAndResource(roles : string[], resource : Resource|string|null) : ACE[];
    allow(role? : Role|string|null,
          resource? : Resource|string|null,
          privilege? : string[]|string|null,
          assertion? : AssertionFunction|Assertion|null) : void
    deny(role? : Role|string|null,
          resource? : Resource|string|null,
          privilege? : string[]|string|null,
          assertion? : AssertionFunction|Assertion|null) : void
}

export enum Type {
  Deny,
  Allow
}

/* istanbul ignore next */
export namespace Type {
  export function fromString(str : 'allow'|'deny') {
    return str === 'allow' ? Type.Allow : Type.Deny
  }
  
  export function toString(e : Type) : 'allow'|'deny' {
    return Type[e].toLowerCase() as any;
  }
}

export type TRole = string|null;
export type TResource = string|null;

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

export type PermissionTransfer = [
  string|null,
  [
      string|null,
      { type: 'allow'|'deny', privileges: string[]|null }[]
  ][]
][]

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
  
  export() : PermissionTransfer {
    const data : PermissionTransfer = [];
    
    for(const [ role, acl ] of this.acls) {
      const resources : [
          string|null,
          { type: 'allow'|'deny', privileges: string[]|null }[]
          ][] = [];
      
      for(const [ resource, aces ] of acl) {
        resources.push([
            resource,
            aces.map(ace => ({
                type: Type.toString(ace.type),
                privileges: ace.privileges && Array.from(ace.privileges)
            }))
        ]);
      }
      
      data.push([ role, resources ])
    }
    
    return data;
  }
  
  import(data : PermissionTransfer) : void {
    for(const [ role, resources ] of data) {
      for(const [ resource, aces ] of resources) {
        for(const ace of aces) {
          this.add(Type.fromString(ace.type), role, resource, ace.privileges);
        }
      }
    }
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
