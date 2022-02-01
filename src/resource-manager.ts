import { Resource } from './types';
import { assertResourceId } from './utils';
import { Injectable } from '@angular/core';
import { ParentManager, StaticParentManager } from './parent-manager';

@Injectable()
export abstract class ResourceManager extends ParentManager<Resource> {
    abstract getParents(resource : Resource|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(resource : Resource|string) : Promise<string[]>|string[];
}

@Injectable({ providedIn: 'root' })
export class StaticResourceManager extends StaticParentManager<Resource> {
  
  protected getId(value: Resource|string): string {
    return assertResourceId(value);
  }
}
