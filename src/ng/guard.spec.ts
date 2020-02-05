import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HRBAC, Role } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { createStubInstance, SinonSpy, SinonStubbedInstance, spy } from 'sinon';
import { HrbacGuard } from './guard';
import { RouteResource } from './route-resource';

use(sinonChai);
use(chaiAsPromised);

describe('HrbacGuard', () => {
    let hrbac : SinonStubbedInstance<HRBAC>;
    let roleStore : RoleStore;
    let guard : HrbacGuard;
    let route : any;
    let state : any;
    let denyHandler : SinonSpy;
    
    beforeEach(() => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(Promise.resolve(true));
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
        denyHandler = spy();
        guard = new HrbacGuard(hrbac as any, roleStore, denyHandler);
        
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
        
        return expect(guard.canActivate(route, state)).to.eventually.rejectedWith(Error, 'resourceId in route.data required for HrbacGuard, {} given.');
    });
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);

        return expect(guard.canActivate(route, state)).to.eventually.rejectedWith(Error, 'Cannot resolve current role for test-resource');
    });

    it('should call hrbac isAllowed and return its value', async () => {
        const result = await guard.canActivate(route, state);

        expect(result).to.be.true;
        expect(denyHandler).to.not.have.been.called;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            new RouteResource('test-resource', route, state),
            'test-privilege'
        );

    });
    
    it('should call deny handler on deny', async () => {
        hrbac.isAllowed.returns(Promise.resolve(false));
    
        const result = await guard.canActivate(route, state);
        
        expect(result).to.be.false;
        
        expect(denyHandler).to.have.been.calledOnce;
        expect(denyHandler.getCall(0).args[0]).to.be.eql({
            role: new Role('guest'),
            resource: new RouteResource(route.data.resourceId, route, state),
            privilege: route.data.privilege
        });
    });
});

