import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { RoleStore } from "./role-store";
import { Role } from '@neoskop/hrbac';
import { spy } from 'sinon';

use(sinonChai);

describe('RoleStore', () => {
    let roleStore : RoleStore;
    
    beforeEach(() => {
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
    });
    
    it('should store default role', () => {
        expect(roleStore.getRole()).to.be.eql(new Role('guest'));
    });
    
    it('should set store', () => {
        roleStore.setRole('admin');
        
        expect(roleStore.getRole()).to.be.eql(new Role('admin'));
    });
    
    it('should notify on role update', () => {
        const subscriber = spy();
        
        roleStore.roleChange.subscribe(subscriber);
        
        roleStore.setRole('admin');
        
        expect(subscriber).to.have.been.calledOnce;
        expect(subscriber).to.have.been.calledWith(new Role('admin'));
    })
    
});
