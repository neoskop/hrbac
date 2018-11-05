import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
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
        
        const aces = await permissionManager.getAcesForRolesAndResource([ 'roleA', 'roleB' ], 'resource');
        
        expect(aces).to.be.an('array').with.length(2);
        expect(aces[0].type).to.be.equal(Type.Allow);
        expect(aces[0].privileges).to.be.eql(new Set([ 'privA' ]));
        expect(aces[0].assertion!.assert).to.be.equal(assertA);
        expect(aces[1].type).to.be.equal(Type.Deny);
        expect(aces[1].privileges).to.be.eql(new Set([ 'privB' ]));
        expect(aces[1].assertion!.assert).to.be.equal(assertB);
    });
    
    it('should export permissions', () => {
        permissionManager.allow('roleA', 'resource', 'privA');
        permissionManager.deny('roleB', 'resource', [ 'privB', 'privC' ]);
        permissionManager.allow('roleC', 'resourceC');
        permissionManager.allow('roleD');
        
        const exp = permissionManager.export();
        
        expect(exp).to.be.eql([
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
        
        expect(pm).to.be.eql(permissionManager);
    })
});

describe('Assertion', () => {
    it('should create an assertion', () => {
        const fn = () => true;
        
        expect(new Assertion(fn).assert).to.be.equal(fn);
    });
});
