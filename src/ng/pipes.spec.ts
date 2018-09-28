import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { HRBAC, Role } from '@neoskop/hrbac';
import { RoleStore } from "./role-store";
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { AllowedPipe, DeniedPipe } from './pipes';

use(sinonChai);

async function wait() {
    return new Promise<void>(resolve => setTimeout(() => resolve(), 1));
}

describe('AllowedPipe', () => {
    let hrbac : SinonStubbedInstance<HRBAC>;
    let roleStore : RoleStore;
    let pipe : AllowedPipe;
    let cdr : any;
    
    beforeEach(async () => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(Promise.resolve(true));
        roleStore = new RoleStore({ defaultRole: 'guest' });
        cdr = {
            markForCheck: spy()
        }
        pipe = new AllowedPipe(hrbac as any, roleStore, cdr);
        await pipe.ngOnInit();
        cdr.markForCheck.resetHistory();
    });
    
    afterEach(() => {
        pipe.ngOnDestroy();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', async () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).to.be.null;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
        
        await wait();
    
        const result2 = pipe.transform('test-resource', 'test-privilege');
    
        expect(cdr.markForCheck).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(result2).to.be.true;
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', async () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).to.be.null;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            'test-role',
            'test-resource',
            'test-privilege'
        );
        
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege', 'test-role');
    
        expect(cdr.markForCheck).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(result2).to.be.true;
    });
    
    it('should mark pipe for check after role store change', () => {
        roleStore.setRole(null);
        
        expect(cdr.markForCheck).to.have.been.calledOnce;
    });
});

describe('DeniedPipe', () => {
    let hrbac : SinonStubbedInstance<HRBAC>;
    let roleStore : RoleStore;
    let pipe : DeniedPipe;
    let cdr : any;
    
    beforeEach(async () => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(Promise.resolve(true));
        roleStore = new RoleStore({ defaultRole: 'guest' });
        cdr = {
            markForCheck: spy()
        }
        pipe = new DeniedPipe(hrbac as any, roleStore, cdr);
        await pipe.ngOnInit();
        cdr.markForCheck.resetHistory();
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', async () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).to.be.null;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
    
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege');
        
        expect(cdr.markForCheck).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(result2).to.be.false;
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', async () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).to.be.null;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            'test-role',
            'test-resource',
            'test-privilege'
        );
    
        await wait();
        
        const result2 = pipe.transform('test-resource', 'test-privilege', 'test-role');
    
        expect(cdr.markForCheck).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(result2).to.be.false;
    });
    
    it('should mark pipe for check after role store change', () => {
        roleStore.setRole(null);
        
        expect(cdr.markForCheck).to.have.been.calledOnce;
    });
});

