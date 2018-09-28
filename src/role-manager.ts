import { Role } from './types';
import { assertRoleId, objectEntries } from './utils';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class RoleManager {
    abstract getParents(role : Role|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(role : Role|string) : Promise<string[]>|string[];
}

export abstract class BaseRoleManager extends RoleManager {
    abstract getParents(role : Role|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    async getRecursiveParentsOf(role : Role | string) : Promise<string[]> {
        const roleId = assertRoleId(role);
    
        const queue = [ roleId ];
        const parents = new Set<string>();
        let i = 0;
    
        while(i < queue.length) {
            if(parents.has(queue[i])) {
                ++i;
                continue;
            }
            parents.add(queue[i]);
        
            let parentRoles = await this.getParents(queue[i]);
            if(parentRoles && parentRoles.size > 0) {
                queue.push(...Array.from(parentRoles!));
            }
            ++i;
        }
    
        return Array.from(parents);
    }
}

@Injectable({ providedIn: 'root' })
export class StaticRoleManager extends BaseRoleManager {
  
  protected roles = new Map<string, Set<string>>();
  
  addParents(role : Role|string, parents : (Role|string)[]) : void {
    const roleId = (role as Role).roleId || role as string;
  
    if(!this.roles.has(roleId)) {
      this.roles.set(roleId, new Set<string>());
    }
  
    for(const parent of parents) {
      const parentId = (parent as Role).roleId || parent as string;
    
      this.roles.get(roleId)!.add(parentId);
    }
  }
  
  setParents(role : Role|string, parents : (Role|string)[]) : void {
      const roleId = (role as Role).roleId || role as string;
      
      this.roles.delete(roleId);
      
      this.addParents(role, parents);
  }
  
  getParents(role : Role|string) : Set<string>|undefined {
      const roleId = (role as Role).roleId || role as string;
      
    return this.roles.get(roleId);
  }
  
  export() : { [role : string] : string[] } {
    const data : { [role : string] : string[] } = {};
    
    for(const [ role, parents ] of this.roles) {
      data[role] = Array.from(parents);
    }
    
    return data;
  }
  
  import(data : { [role : string] : string[] }) : void {
      for(const [ role, parents ] of objectEntries(data)) {
        this.setParents(role, parents);
      }
  }
}
