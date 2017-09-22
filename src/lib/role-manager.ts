import { Role } from './types';
import { Injectable, objectEntries } from './utils';

export interface IRoleManager {
  addParents(role : Role|string, parents : (Role|string)[]) : void;
  setParents(role : Role|string, parents : (Role|string)[]) : void;
  getParents(role : Role|string) : Set<string>|undefined;
  getRecursiveParentsOf(role : Role|string) : string[];
}

@Injectable()
export class RoleManager implements IRoleManager {
  
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
  
  getRecursiveParentsOf(role : Role|string) : string[] {
      const roleId = (role as Role).roleId || role as string;

    const queue = [ roleId ];
    const parents = new Set<string>();
    let i = 0;

    while(i < queue.length) {
      if(parents.has(queue[i])) {
        ++i;
        continue;
      }
      parents.add(queue[i]);

      if(this.roles.has(queue[i])) {
        queue.push(...Array.from(this.roles.get(queue[i])!));
      }
      ++i;
    }

    return Array.from(parents);
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
