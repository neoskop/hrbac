import 'reflect-metadata';
import { StaticResourceManager } from './resource-manager';

describe('ResourceManager', () => {
    let resourceManager : StaticResourceManager;
    beforeEach(() => {
        resourceManager = new StaticResourceManager();
    });
    
    it('should add parents via addParents', async () => {
        resourceManager.addParents('a', [ 'b', 'c' ]);
        
        expect(await resourceManager.getParents('a')).toEqual([ 'b', 'c' ]);
    
        resourceManager.addParents('a', [ 'b', 'd', 'e' ]);
    
        expect(await resourceManager.getParents('a')).toEqual([ 'b', 'c', 'd', 'e' ]);
    });
    
    it('should set parents via setParents', async () => {
        resourceManager.setParents('a', [ 'b', 'c' ]);
        
        expect(await resourceManager.getParents('a')).toEqual([ 'b', 'c' ]);
    
        resourceManager.setParents('a', [ 'b', 'd', 'e' ]);
    
        expect(await resourceManager.getParents('a')).toEqual([ 'b', 'd', 'e' ]);
    });
    
    it('should return recursively all parents', async () => {
        resourceManager.setParents('a', [ 'b', 'c' ]);
        resourceManager.setParents('b', [ 'd' ]);
        
        expect(await resourceManager.getRecursiveParentsOf('a')).toEqual([ 'a', 'b', 'd', 'c' ]);
    });
    
    it('should export resources', async () => {
        resourceManager.setParents('a', [ 'b', 'c' ]);
        resourceManager.setParents('b', [ 'd' ]);
        
        const exp = resourceManager.export();
        
        expect(exp).toEqual({
            a: [ 'b', 'c' ],
            b: [ 'd' ]
        });
    });
    
    it('should import resources', () => {
        resourceManager.setParents('a', [ 'b', 'c' ]);
        resourceManager.setParents('b', [ 'd' ]);
    
        const exp = resourceManager.export();
    
        const rm = new StaticResourceManager();
        
        rm.import(exp);
        
        expect(rm).toEqual(resourceManager);
    });
  
    it('should consider circular resource dependencies', async () => {
        resourceManager.setParents('b', [ 'a', 'c' ]);
        resourceManager.setParents('a', [ 'b' ]);
        
        expect(await resourceManager.getRecursiveParentsOf('b')).toEqual([ 'b', 'a', 'c' ]);
    })
});
