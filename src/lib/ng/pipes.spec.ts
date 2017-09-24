import 'mocha';
import 'reflect-metadata';
import { expect, use } from 'chai'
import * as sinonChai from 'sinon-chai';
import { HRBAC } from '../hrbac';
import { RoleStore } from "./role-store";
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { Role } from "../types";
import { AllowedPipe, DeniedPipe } from './pipes';

use(sinonChai);

describe('AllowedPipe', () => {
    let hrbac : SinonStubbedInstance<HRBAC>;
    let roleStore : RoleStore;
    let pipe : AllowedPipe;
    let cdr : any;
    
    beforeEach(() => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(true);
        roleStore = new RoleStore('guest');
        cdr = {
            markForCheck: spy()
        }
        pipe = new AllowedPipe(hrbac as any, roleStore, cdr);
    });
    
    afterEach(() => {
        pipe.ngOnDestroy();
    })
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);
        
        expect(() => {
            pipe.transform('test-resource');
        }).to.throw(Error, 'Cannot resolve current role')
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).to.be.true;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).to.be.true;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            'test-role',
            'test-resource',
            'test-privilege'
        );
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
    
    beforeEach(() => {
        hrbac = createStubInstance(HRBAC);
        hrbac.isAllowed.returns(true);
        roleStore = new RoleStore('guest');
        cdr = {
            markForCheck: spy()
        }
        pipe = new DeniedPipe(hrbac as any, roleStore, cdr);
    });
    
    it('should throw error when role cannot be resolved', () => {
        roleStore.setRole(null);
        
        expect(() => {
            pipe.transform('test-resource');
        }).to.throw(Error, 'Cannot resolve current role')
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with role from role store', () => {
        const result = pipe.transform('test-resource', 'test-privilege');
        
        expect(result).to.be.false;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            new Role('guest'),
            'test-resource',
            'test-privilege'
        );
    });
    
    it('should call hrbac isAllowed and return comparison to trueValue with provided role', () => {
        const result = pipe.transform('test-resource', 'test-privilege', 'test-role');
        
        expect(result).to.be.false;
        expect(hrbac.isAllowed).to.have.been.calledOnce;
        expect(hrbac.isAllowed).to.have.been.calledWithExactly(
            'test-role',
            'test-resource',
            'test-privilege'
        );
    });
    
    it('should mark pipe for check after role store change', () => {
        roleStore.setRole(null);
        
        expect(cdr.markForCheck).to.have.been.calledOnce;
    });
});

