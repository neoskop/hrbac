import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { SyncHRBAC, Role } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { HrbacGuard } from './guard';
import { RouteResource } from './route-resource';

use(sinonChai);

describe('HrbacGuard', () => {
    let hrbac : SinonStubbedInstance<SyncHRBAC>;
    let roleStore : RoleStore;
    let guard : HrbacGuard;
    let route : any;
    let state : any;
    
    beforeEach(() => {
        hrbac = createStubInstance(SyncHRBAC);
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
        
        guard.canActivate(route, state).then((can) => {
            expect(can).not.to.exist;
        }, err => {
            expect(err).to.be.eql(new Error('resourceId in route.data required for HrbacGuard, {} given.'))
        })
    });
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);
    
        guard.canActivate(route, state).then((can) => {
            expect(can).not.to.exist;
        }, err => {
            expect(err).to.be.eql(new Error('Cannot resolve current role for test-resource'))
        })
    });
    
    it('should call hrbac isAllowed and return its value', async () => {
        const result = await guard.canActivate(route, state);
        
        expect(result).to.be.true;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            new RouteResource('test-resource', route, state),
            'test-privilege'
        );
        
    })
});

