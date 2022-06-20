import 'reflect-metadata';
import { HRBAC, Role } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { AllowedPipe, DeniedPipe } from './pipes';

async function wait() {
    return new Promise<void>(resolve => setTimeout(() => resolve(), 1));
}

describe('AllowedPipe', () => {
    let hrbac : jest.Mocked<HRBAC>;
    let roleStore : RoleStore;
    let pipe : AllowedPipe;
    let cdr : any;
    
    beforeEach(async () => {
        hrbac = {
            isAllowed: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<HRBAC>;
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
        cdr = {
            markForCheck: jest.fn()
        }
        pipe = new AllowedPipe(hrbac as any, roleStore, cdr);
        cdr.markForCheck.resetHistory();
    });
    
    afterEach(() => {
        pipe.ngOnDestroy();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', async () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).toBeNull();
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledWith(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
        
        await wait();
    
        const result2 = pipe.transform('test-resource', 'test-privilege');
    
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(result2).toBeTruthy();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', async () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).toBeNull();
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledWith(
            'test-role',
            'test-resource',
            'test-privilege'
        );
        
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege', 'test-role');
    
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(result2).toBeTruthy();
    });
    
    it('should mark pipe for check after role store change', () => {
        roleStore.setRole(null);
        
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
    });
});

describe('DeniedPipe', () => {
    let hrbac : jest.Mocked<HRBAC>;
    let roleStore : RoleStore;
    let pipe : DeniedPipe;
    let cdr : any;
    
    beforeEach(async () => {
        hrbac = {
            isAllowed: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<HRBAC>;
        roleStore = new RoleStore({ defaultRole: 'guest' } as any);
        cdr = {
            markForCheck: jest.fn()
        }
        pipe = new DeniedPipe(hrbac as any, roleStore, cdr);
        cdr.markForCheck.resetHistory();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', async () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).toBeNull();
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledWith(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
    
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege');
        
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(result2).toBeFalsy();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', async () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).toBeNull();
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledWith(
            'test-role',
            'test-resource',
            'test-privilege'
        );
    
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege', 'test-role');
    
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
        expect(hrbac.isAllowed).toHaveBeenCalledTimes(1);
        expect(result2).toBeFalsy();
    });
    
    it('should mark pipe for check after role store change', () => {
        roleStore.setRole(null);
        
        expect(cdr.markForCheck).toHaveBeenCalledTimes(1);
    });
});

