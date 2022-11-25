import { Assertion, AssertionFunction, Resource, Role } from "./types";
import { assertResourceId } from "./utils";

export abstract class PermissionManager {
  abstract getAcesForRolesAndResources(
    roles: string[],
    resources: string[] | [null]
  ): Promise<ACE[]> | ACE[];
}

export enum Type {
  Deny = "deny",
  Allow = "allow",
}

export type TRole = string | null;
export type TResource = string | null;

export class ACE {
  constructor(
    public readonly type: Type,
    public readonly privileges: Set<string> | null,
    public readonly assertion: Assertion<any, any> | null
  ) {}
}

export class ACL extends Map<TResource, ACE[]> {
  add(role: TResource, ace: ACE) {
    if (!this.has(role)) {
      this.set(role, []);
    }
    this.get(role)!.push(ace);
  }

  static create(arr?: [TResource, ACE[]][]): ACL {
    const map = new Map(arr);
    Object.setPrototypeOf(map, ACL.prototype);

    return map as any;
  }
}

export class ACLS extends Map<TRole, ACL> {
  get(role: TRole): ACL {
    if (!this.has(role)) {
      this.set(role, ACL.create());
    }

    return super.get(role)!;
  }

  static create(arr?: [TRole, ACL][]): ACLS {
    const map = new Map(arr);
    Object.setPrototypeOf(map, ACLS.prototype);

    return map as any;
  }
}

export type PermissionTransfer = [
  string | null,
  [
    string | null,
    {
      type: "allow" | "deny" | Type;
      privileges: string[] | null;
      assertion?:
        | AssertionFunction<any, any>
        | Assertion<any, any>
        | null
        | undefined;
    }[]
  ][]
][];

export class StaticPermissionManager extends PermissionManager {
  protected acls = ACLS.create();

  protected add<O extends Role, R extends Resource>(
    type: Type,
    role: Role | string | null = null,
    resource: Resource | string | null = null,
    privilege: string[] | string | null = null,
    assertion: AssertionFunction<O, R> | Assertion<O, R> | null = null
  ) {
    const roleId: TRole = (role && (role as Role).roleId) || (role as string);
    const resourceId: TResource = resource && assertResourceId(resource);
    if (typeof assertion === "function") {
      assertion = new Assertion(assertion);
    }

    if (typeof privilege === "string") {
      privilege = [privilege];
    }

    const privileges: Set<string> | null = privilege && new Set(privilege);

    this.acls.get(roleId).add(resourceId, new ACE(type, privileges, assertion));
  }

  allow<O extends Role, R extends Resource>(
    role?: Role | string | null,
    resource?: Resource | string | null,
    privilege?: string[] | string | null,
    assertion?: AssertionFunction<O, R> | Assertion<O, R> | null
  ): void {
    this.add(Type.Allow, role, resource, privilege, assertion);
  }

  deny<O extends Role, R extends Resource>(
    role?: Role | string | null,
    resource?: Resource | string | null,
    privilege?: string[] | string | null,
    assertion?: AssertionFunction<O, R> | Assertion<O, R> | null
  ): void {
    this.add(Type.Deny, role, resource, privilege, assertion);
  }

  export(): PermissionTransfer {
    const data: PermissionTransfer = [];

    for (const [role, acl] of this.acls) {
      const resources: [
        string | null,
        { type: "allow" | "deny" | Type; privileges: string[] | null }[]
      ][] = [];

      for (const [resource, aces] of acl) {
        resources.push([
          resource,
          aces.map((ace) => ({
            type: ace.type,
            privileges: ace.privileges && Array.from(ace.privileges),
            ...(ace.assertion ? { assertion: ace.assertion } : {}),
          })),
        ]);
      }

      data.push([role, resources]);
    }

    return data;
  }

  import(data: PermissionTransfer): void {
    for (const [role, resources] of data) {
      for (const [resource, aces] of resources) {
        for (const ace of aces) {
          this.add(
            ace.type as Type,
            role,
            resource,
            ace.privileges,
            ace.assertion
          );
        }
      }
    }
  }

  getAcesForRolesAndResources(
    roles: string[],
    resources: string[] | [null]
  ): ACE[] {
    // const resourceId : TResource = resource && assertResourceId(resource);
    let result: ACE[] = [];

    for (const [role, acl] of this.acls) {
      for (const resource of resources) {
        for (const r of roles) {
          if (null === role || r === role) {
            for (const [res, aces] of acl) {
              if (null === res || res === resource) {
                result.push(...aces);
              }
            }
          }
        }
      }
    }

    return result;
  }
}
