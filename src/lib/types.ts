import { HierarchicalRoleBaseAccessControl } from './hrbac';

export class Role {
  constructor(public roleId : string) {}
}

export class Resource {
  constructor(public resourceId : string) {}
}

export type AssertionFunction<O extends Role = Role, R extends Resource = Resource> = (hrbac : HierarchicalRoleBaseAccessControl<any, any>, role : O|null, resource : R|null, privilege : string|null) => boolean;

export class Assertion<O extends Role = Role, R extends Resource = Resource> {
  constructor(public assert : AssertionFunction<O, R>) {}
}

export type AsyncAssertionFunction<O extends Role = Role, R extends Resource = Resource> = (hrbac : HierarchicalRoleBaseAccessControl<any, any>, role : O|null, resource : R|null, privilege : string|null) => Promise<boolean>|boolean;

export class AsyncAssertion<O extends Role = Role, R extends Resource = Resource> {
  constructor(public assert : AsyncAssertionFunction<O, R>) {}
}
