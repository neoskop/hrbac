import { objectEntries } from './utils';

export abstract class ParentManager<T> {
    abstract getParents(value: T|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(value: T|string) : Promise<string[]>|string[];
}

export abstract class BaseParentManager<T> extends ParentManager<T> {
    abstract getParents(value: T|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    protected abstract getId(value: T|string): string;
    async getRecursiveParentsOf(value: T | string) : Promise<string[]> {
        const id = this.getId(value);
    
        const queue = [ id ];
        const parents = new Set<string>();
        let i = 0;
    
        while(i < queue.length) {
            if(parents.has(queue[i])) {
                ++i;
                continue;
            }
            parents.add(queue[i]);
        
            let p = await this.getParents(queue[i]);
            if(p && p.size > 0) {
                queue.push(...Array.from(p!));
            }
            ++i;
        }
    
        return Array.from(parents);
    }
}

export abstract class StaticParentManager<T> extends BaseParentManager<T> {
  
  protected parents = new Map<string, Set<string>>();
  
  protected abstract getId(value: T|string): string;

  addParents(role : T|string, parents : (T|string)[]) : void {
    const id = this.getId(role);
  
    if(!this.parents.has(id)) {
      this.parents.set(id, new Set<string>());
    }
  
    for(const parent of parents) {
      const parentId = this.getId(parent);
    
      this.parents.get(id)!.add(parentId);
    }
  }
  
  setParents(role : T|string, parents : (T|string)[]) : void {
      const id = this.getId(role);
      
      this.parents.delete(id);
      
      this.addParents(role, parents);
  }
  
  getParents(role : T|string) : Set<string>|undefined {
      const id = this.getId(role);
      
    return this.parents.get(id);
  }
  
  export() : Record<string, string[]> {
    const data : Record<string, string[]> = {};
    
    for(const [ role, parents ] of this.parents) {
      data[role] = Array.from(parents);
    }
    
    return data;
  }
  
  import(data : Record<string, string[]>) : void {
      for(const [ role, parents ] of objectEntries(data)) {
        this.setParents(role, parents);
      }
  }
}
