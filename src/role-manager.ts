import { Role } from './types';
import { assertRoleId } from './utils';
import { ParentManager, StaticParentManager } from './parent-manager';

export abstract class RoleManager extends ParentManager<Role> {
    abstract getParents(role : Role|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(role : Role|string) : Promise<string[]>|string[];
}

export class StaticRoleManager extends StaticParentManager<Role> {
  
  protected getId(value: Role|string): string {
    return assertRoleId(value);
  }
}
