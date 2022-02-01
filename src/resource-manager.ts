import { Resource } from './types';
import { assertResourceId, objectEntries } from './utils';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class ResourceManager {
    abstract getParents(resource : Resource|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(resource : Resource|string) : Promise<string[]>|string[];
}

export abstract class BaseResourceManager extends ResourceManager {
    abstract getParents(resource : Resource|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    async getRecursiveParentsOf(resource : Resource | string) : Promise<string[]> {
        const resourceId = assertResourceId(resource);
    
        const queue = [ resourceId ];
        const parents = new Set<string>();
        let i = 0;
    
        while(i < queue.length) {
            if(parents.has(queue[i])) {
                ++i;
                continue;
            }
            parents.add(queue[i]);
        
            let parentResources = await this.getParents(queue[i]);
            if(parentResources && parentResources.size > 0) {
                queue.push(...Array.from(parentResources!));
            }
            ++i;
        }
    
        return Array.from(parents);
    }
}

@Injectable({ providedIn: 'root' })
export class StaticResourceManager extends BaseResourceManager {
  
  protected resources = new Map<string, Set<string>>();
  
  addParents(resource : Resource|string, parents : (Resource|string)[]) : void {
    const resourceId = assertResourceId(resource);
  
    if(!this.resources.has(resourceId)) {
      this.resources.set(resourceId, new Set<string>());
    }
  
    for(const parent of parents) {
      const parentId = assertResourceId(parent);
    
      this.resources.get(resourceId)!.add(parentId);
    }
  }
  
  setParents(resource : Resource|string, parents : (Resource|string)[]) : void {
      const resourceId = assertResourceId(resource);
      
      this.resources.delete(resourceId);
      
      this.addParents(resource, parents);
  }
  
  getParents(resource : Resource|string) : Set<string>|undefined {
      const resourceId = assertResourceId(resource);
      
    return this.resources.get(resourceId);
  }
  
  export() : { [resource : string] : string[] } {
    const data : { [resource : string] : string[] } = {};
    
    for(const [ resource, parents ] of this.resources) {
      data[resource] = Array.from(parents);
    }
    
    return data;
  }
  
  import(data : { [resource : string] : string[] }) : void {
      for(const [ resource, parents ] of objectEntries(data)) {
        this.setParents(resource, parents);
      }
  }
}
