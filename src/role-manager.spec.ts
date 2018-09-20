import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { StaticRoleManager } from './role-manager';

describe('RoleManager', () => {
    let roleManager : StaticRoleManager;
    beforeEach(() => {
        roleManager = new StaticRoleManager();
    });
    
    it('should add parents via addParents', async () => {
        roleManager.addParents('a', [ 'b', 'c' ]);
        
        expect(await roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c' ]));
    
        roleManager.addParents('a', [ 'b', 'd', 'e' ]);
    
        expect(await roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c', 'd', 'e' ]));
    });
    
    it('should set parents via setParents', async () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        
        expect(await roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c' ]));
    
        roleManager.setParents('a', [ 'b', 'd', 'e' ]);
    
        expect(await roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'd', 'e' ]));
    });
    
    it('should return recursively all parents', async () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        roleManager.setParents('b', [ 'd' ]);
        
        expect(await roleManager.getRecursiveParentsOf('a')).to.be.eql([ 'a', 'b', 'c', 'd' ]);
    });
    
    it('should export roles', async () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        roleManager.setParents('b', [ 'd' ]);
        
        const exp = roleManager.export();
        
        expect(exp).to.be.eql({
            a: [ 'b', 'c' ],
            b: [ 'd' ]
        });
    });
    
    it('should import roles', () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        roleManager.setParents('b', [ 'd' ]);
    
        const exp = roleManager.export();
    
        const rm = new StaticRoleManager();
        
        rm.import(exp);
        
        expect(rm).to.be.eql(roleManager);
    });
  
    it('should consider circular role dependencies', async () => {
        roleManager.setParents('b', [ 'a', 'c' ]);
        roleManager.setParents('a', [ 'b' ]);
        
        expect(await roleManager.getRecursiveParentsOf('b')).to.be.eql([ 'b', 'a', 'c' ]);
    })
});
