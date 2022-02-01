import { Role } from './types';
import { assertRoleId } from './utils';
import { Injectable } from '@angular/core';
import { ParentManager, StaticParentManager } from './parent-manager';

@Injectable()
export abstract class RoleManager extends ParentManager<Role> {
    abstract getParents(role : Role|string) : Promise<Set<string>|undefined>|Set<string>|undefined;
    abstract getRecursiveParentsOf(role : Role|string) : Promise<string[]>|string[];
}

@Injectable({ providedIn: 'root' })
export class StaticRoleManager extends StaticParentManager<Role> {
  
  protected getId(value: Role|string): string {
    return assertRoleId(value);
  }
}
