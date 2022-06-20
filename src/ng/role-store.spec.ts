import 'reflect-metadata';
import { RoleStore } from "./role-store";
import { Role } from '@neoskop/hrbac';

describe('RoleStore', () => {
    let roleStore : RoleStore;
    
    beforeEach(() => {
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
    });
    
    it('should store default role', () => {
        expect(roleStore.getRole()).toEqual(new Role('guest'));
    });
    
    it('should set store', () => {
        roleStore.setRole('admin');
        
        expect(roleStore.getRole()).toEqual(new Role('admin'));
    });
    
    it('should notify on role update', () => {
        const subscriber = jest.fn();
        
        roleStore.roleChange.subscribe(subscriber);
        
        roleStore.setRole('admin');
        
        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber).toHaveBeenCalledWith(new Role('admin'));
    })
    
});
