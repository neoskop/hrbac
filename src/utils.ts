export function objectEntries<T>(object: { [key: string]: T }) : [ string, T ][] {
    /* istanbul ignore else */
    if(Object.entries) {
        return Object.entries(object);
    }
    return Object.keys(object).map<[ string, T ]>(key => [ key, object[key] ]);
}
