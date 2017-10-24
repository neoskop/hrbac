import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { HRBAC, Role } from '..';
import { RoleStore } from "./role-store";
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { HrbacGuard } from './guard';
import { RouteResource } from './route-resource';

use(sinonChai);

describe('HrbacGuard', () => {
    let hrbac : SinonStubbedInstance<HRBAC>;
    let roleStore : RoleStore;
    let guard : HrbacGuard;
    let route : any;
    let state : any;
    
    beforeEach(() => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(true);
        roleStore = new RoleStore('guest');
        guard = new HrbacGuard(hrbac as any, roleStore);
        
        route = {
            data: {
                resourceId: 'test-resource',
                privilege: 'test-privilege'
            }
        };
        state = {};
    });
    
    it('should throw if no resource is provided', () => {
        route.data = {};
        
        expect(() => {
            guard.canActivate(route, state);
        }).to.throw(Error, 'resourceId in route.data required for HrbacGuard, {} given.')
    });
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);
        
        expect(() => {
            guard.canActivate(route, state);
        }).to.throw(Error, 'Cannot resolve current role for test-resource')
    });
    
    it('should call hrbac isAllowed and return its value', () => {
        const result = guard.canActivate(route, state);
        
        expect(result).to.be.true;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            new RouteResource('test-resource', route, state),
            'test-privilege'
        );
        
    })
});

