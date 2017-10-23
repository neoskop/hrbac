export function objectEntries<T>(object: { [key: string]: T }) : [ string, T ][] {
    /* istanbul ignore else */
    if(Object.entries) {
        /* istanbul ignore next */
        return Object.entries(object);
    }
    /* istanbul ignore next */
    return Object.keys(object).map<[ string, T ]>(key => [ key, object[key] ]);
}

export function Injectable() : ClassDecorator {
    return () => {}
}
