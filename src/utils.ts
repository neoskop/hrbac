import { Role } from './types';
import { Resource } from './types';

export function objectEntries<T>(object: { [key: string]: T }) : [ string, T ][] {
    /* istanbul ignore else */
    if(Object.entries) {
        /* istanbul ignore next */
        return Object.entries(object);
    }
    /* istanbul ignore next */
    return Object.keys(object).map<[ string, T ]>(key => [ key, object[key] ]);
}

export function assertRoleId(role : Role | string) : string {
    if(typeof role === 'string') {
        return role;
    }
    return role.roleId;
}

export function assertResourceId(resource : Resource | string) : string {
    if(typeof resource === 'string') {
        return resource;
    }
    return resource.resourceId;
}

export function isPlainObject(o : any) : o is Object {
    return typeof o === 'object' && o.constructor === Object;
}
