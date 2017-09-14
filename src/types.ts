import { HierarchicalRoleBaseAccessControl } from './hrbac';
import { IRoleManager } from './role-manager';
import { IPermissionManager } from './permission-manager';

export class Role {
  constructor(public roleId : string) {}
}

export class Resource {
  constructor(public resourceId : string) {}
}

export type AssertionFunction = (hrbac : HierarchicalRoleBaseAccessControl<IRoleManager, IPermissionManager>, role : Role|null, resource? : Resource|null, privilege? : string|null) => boolean;

export class Assertion {
  constructor(public assert : AssertionFunction) {}
}
