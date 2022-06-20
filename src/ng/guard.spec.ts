import 'reflect-metadata';
import { HRBAC, Role } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { HrbacGuard } from './guard';
import { RouteResource } from './route-resource';
import { HrbacConfiguration } from './config';

describe('HrbacGuard', () => {
    let hrbac : jest.Mocked<HRBAC>;
    let roleStore : RoleStore;
    let guard : HrbacGuard;
    let route : any;
    let state : any;
    let denyHandler : jest.Mock;
    
    beforeEach(() => {
        hrbac = {
            isAllowed: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<HRBAC>;
        roleStore = new RoleStore({ defaultRole: 'guest' } as HrbacConfiguration);
        denyHandler = jest.fn();
        guard = new HrbacGuard(hrbac as unknown as HRBAC, roleStore, denyHandler);
        
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
        
        return expect(guard.canActivate(route, state)).rejects.toEqual(new Error('resourceId in route.data required for HrbacGuard, {} given.'));
    });
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);

        return expect(guard.canActivate(route, state)).rejects.toEqual(new Error('Cannot resolve current role for test-resource'));
    });

    it('should call hrbac isAllowed and return its value', async () => {
        const result = await guard.canActivate(route, state);

        expect(result).toBeTruthy();
        expect(denyHandler).not.toHaveBeenCalled();
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledWith(
            new Role('guest'),
            new RouteResource('test-resource', route, state),
            'test-privilege'
        );

    });
    
    it('should call deny handler on deny', async () => {
        hrbac.isAllowed.mockResolvedValue(false);
    
        const result = await guard.canActivate(route, state);
        
        expect(result).toBeFalsy();
        
        expect(denyHandler).toHaveBeenCalledTimes(1);
        expect(denyHandler.mock.calls[0].args[0]).toEqual({
            role: new Role('guest'),
            resource: new RouteResource(route.data.resourceId, route, state),
            privilege: route.data.privilege
        });
    });
});

