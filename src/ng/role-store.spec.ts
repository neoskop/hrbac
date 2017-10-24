import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { RoleStore } from "./role-store";
import { Role } from '..';
import { spy } from 'sinon';

use(sinonChai);

describe('RoleStore', () => {
    let roleStore : RoleStore;
    
    beforeEach(() => {
        roleStore = new RoleStore('guest');
    });
    
    it('should store default role if provided', () => {
        expect(roleStore.getRole()).to.be.eql(new Role('guest'));
        
        roleStore = new RoleStore();
        
        expect(roleStore.getRole()).to.be.null;
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
