import 'reflect-metadata';
import { StaticPermissionManager, Type } from './permission-manager';
import { Assertion, AssertionFunction } from './types';

describe('PermissionManager', () => {
    let permissionManager : StaticPermissionManager;
    beforeEach(() => {
        permissionManager = new StaticPermissionManager();
    });
    
    it('should store and serve permissions', async () => {
        const assertA : AssertionFunction = () => true;
        const assertB : AssertionFunction = () => true;
        permissionManager.allow('roleA', 'resource', 'privA', assertA);
        permissionManager.deny('roleB', 'resource', 'privB', assertB);
        permissionManager.allow('roleC', 'resourceC', null, () => true);
        permissionManager.allow('roleD');
        
        const aces = await permissionManager.getAcesForRolesAndResources([ 'roleA', 'roleB' ], ['resource']);
        
        expect(aces).toBeInstanceOf(Array);
        expect(aces.length).toEqual(2);
        expect(aces[0].type).toEqual(Type.Allow);
        expect(aces[0].privileges).toEqual(new Set([ 'privA' ]));
        expect(aces[0].assertion!.assert).toEqual(assertA);
        expect(aces[1].type).toEqual(Type.Deny);
        expect(aces[1].privileges).toEqual(new Set([ 'privB' ]));
        expect(aces[1].assertion!.assert).toEqual(assertB);
    });
    
    it('should export permissions', () => {
        permissionManager.allow('roleA', 'resource', 'privA');
        permissionManager.deny('roleB', 'resource', [ 'privB', 'privC' ]);
        permissionManager.allow('roleC', 'resourceC');
        permissionManager.allow('roleD');
        
        const exp = permissionManager.export();
        
        expect(exp).toEqual([
            [ 'roleA', [ [ 'resource', [ { type: 'allow', privileges: [ 'privA' ] } ] ] ] ],
            [ 'roleB', [ [ 'resource', [ { type: 'deny', privileges: [ 'privB', 'privC' ] } ] ] ] ],
            [ 'roleC', [ [ 'resourceC', [ { type: 'allow', privileges: null }] ] ] ],
            [ 'roleD', [ [ null, [ { type: 'allow', privileges: null }] ] ] ],
        ]);
    });
    
    it('should import permissions', () => {
        permissionManager.allow('roleA', 'resource', 'privA');
        permissionManager.deny('roleB', 'resource', [ 'privB', 'privC' ]);
        permissionManager.allow('roleC', 'resourceC');
        permissionManager.allow('roleD');
    
        const exp = permissionManager.export();
        
        const pm = new StaticPermissionManager();
        
        pm.import(exp);
        
        expect(pm).toEqual(permissionManager);
    })
});

describe('Assertion', () => {
    it('should create an assertion', () => {
        const fn = () => true;
        
        expect(new Assertion(fn).assert).toEqual(fn);
    });
});
