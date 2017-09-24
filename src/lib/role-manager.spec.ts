import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { RoleManager, AsyncRoleManager } from './role-manager';
import { Role } from "./types";

class AsyncRoleManagerImpl extends AsyncRoleManager {
    roles = new Map([
        [ 'user', new Set([ 'guest' ]) ],
        [ 'author', new Set([ 'user', 'creator' ]) ],
        [ 'editor', new Set([ 'user', 'manager' ]) ],
        [ 'manager', new Set([ 'editor' ]) ]
    ])
    
    async getParents(role : Role | string) : Promise<Set<string>> {
        const roleId = (role as Role).roleId || role as string;
        
        return this.roles.get(roleId)!;
    }
}

describe('RoleManager', () => {
    let roleManager : RoleManager;
    beforeEach(() => {
        roleManager = new RoleManager();
    });
    
    it('should add parents via addParents', () => {
        roleManager.addParents('a', [ 'b', 'c' ]);
        
        expect(roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c' ]));
    
        roleManager.addParents('a', [ 'b', 'd', 'e' ]);
    
        expect(roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c', 'd', 'e' ]));
    });
    
    it('should set parents via setParents', () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        
        expect(roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'c' ]));
    
        roleManager.setParents('a', [ 'b', 'd', 'e' ]);
    
        expect(roleManager.getParents('a')).to.be.eql(new Set([ 'b', 'd', 'e' ]));
    });
    
    it('should return recursively all parents', () => {
        roleManager.setParents('a', [ 'b', 'c' ]);
        roleManager.setParents('b', [ 'd' ]);
        
        expect(roleManager.getRecursiveParentsOf('a')).to.be.eql([ 'a', 'b', 'c', 'd' ]);
    });
    
    it('should export roles', () => {
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
    
        const rm = new RoleManager();
        
        rm.import(exp);
        
        expect(rm).to.be.eql(roleManager);
    });
  
    it('should consider circular role dependencies', () => {
        roleManager.setParents('b', [ 'a', 'c' ]);
        roleManager.setParents('a', [ 'b' ]);
        
        expect(roleManager.getRecursiveParentsOf('b')).to.be.eql([ 'b', 'a', 'c' ]);
    })
});

describe('RoleManager', () => {
    let roleManager : AsyncRoleManager;
    beforeEach(() => {
        roleManager = new AsyncRoleManagerImpl();
    });
    
    it('should consider circular role dependencies', async () => {
        expect(await roleManager.getRecursiveParentsOf('manager')).to.be.eql([ 'manager', 'editor', 'user', 'guest' ]);
    });
});
