import { Resource } from './types';
import { assertResourceId } from './utils';
import { ParentManager, StaticParentManager } from './parent-manager';

export abstract class ResourceManager extends ParentManager<Resource> {
    abstract getParents(resource : Resource|string) : Promise<Array<string>|undefined>|Array<string>|undefined;
    abstract getRecursiveParentsOf(resource : Resource|string) : Promise<string[]>|string[];
}

export class StaticResourceManager extends StaticParentManager<Resource> {
  
  protected getId(value: Resource|string): string {
    return assertResourceId(value);
  }
}
