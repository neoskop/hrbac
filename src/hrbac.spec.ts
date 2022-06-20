import 'reflect-metadata';
import { HRBAC } from "./hrbac";
import { Resource, Role } from "./types";
import { StaticRoleManager } from "./role-manager";
import { StaticPermissionManager } from './permission-manager';
import { StaticResourceManager } from './resource-manager';

class DocumentResource extends Resource {
  constructor(public author : string) {
    super('document')
  }
}

class ProfileResource extends Resource {
  constructor(public owner : string) {
    super('profile')
  }
}

class UserRole extends Role {
  constructor(public id : string, role : string) {
    super(role);
  }
}

const authorA = new UserRole('a', 'author');
const authorB = new UserRole('b', 'author');
const editor = new UserRole('c', 'editor');
const admin = new UserRole('z', 'admin');
const user = new UserRole('u', 'user');
const userV = new UserRole('v', 'user');

const documentA = new DocumentResource('a');
const profileU = new ProfileResource('u');
const profileV = new ProfileResource('v');

describe('HRBAC', () => {
  let hrbac : HRBAC<StaticRoleManager, StaticResourceManager, StaticPermissionManager>;
  beforeEach(() => {
    hrbac = new HRBAC(new StaticRoleManager(), new StaticResourceManager(), new StaticPermissionManager());
    hrbac.getRoleManager().addParents('user', [ 'guest' ]);
    hrbac.getRoleManager().addParents('author', [ 'user' ]);
    hrbac.getRoleManager().addParents('author', [ 'creator' ]);
    hrbac.getRoleManager().addParents('editor', [ 'user', 'manager' ]);

    hrbac.getPermissionManager().deny();

    hrbac.getPermissionManager().allow('admin');

    hrbac.getPermissionManager().allow('guest', 'document', 'read');
    hrbac.getPermissionManager().allow('guest', 'document-comment', [ 'read', 'create' ]);

    hrbac.getPermissionManager().allow('user', 'document', [ 'list' ]);
    
    hrbac.getPermissionManager().allow('user', 'profile', null, (_rba: HRBAC, role: UserRole | null, resource : ProfileResource | null) => {
      return role!.id === resource!.owner;
    });
    hrbac.getPermissionManager().allow('user', 'ffa');

    hrbac.getPermissionManager().allow('author', 'document', 'create');
    hrbac.getPermissionManager().allow('author', 'document', 'update', (_rba : HRBAC, role : UserRole | null, resource : DocumentResource | null) => {
      return role!.id === resource!.author;
    });

    hrbac.getPermissionManager().allow('editor', 'document', 'update');

    hrbac.getPermissionManager().deny('banned');
  });

  describe('permissions', () => {
    it('guest', async () => {
      expect(await hrbac.isAllowed('guest', documentA, 'read')).toBeTruthy();
      expect(await hrbac.isDenied('guest', documentA, 'read')).toBeFalsy();
      expect(await hrbac.isAllowed('guest', documentA, 'update')).toBeFalsy();
      expect(await hrbac.isDenied('guest', documentA, 'update')).toBeTruthy();
    });

    it('admin', async () => {
      expect(await hrbac.isAllowed(admin, 'settings')).toBeTruthy();
      expect(await hrbac.isDenied(admin, 'settings')).toBeFalsy();
    });

    it('user', async () => {
      expect(await hrbac.isAllowed(user, documentA, 'read')).toBeTruthy();
      expect(await hrbac.isDenied(user, documentA, 'read')).toBeFalsy();
      expect(await hrbac.isAllowed(user, documentA, 'list')).toBeTruthy();
      expect(await hrbac.isDenied(user, documentA, 'list')).toBeFalsy();
      expect(await hrbac.isAllowed(user, documentA, 'update')).toBeFalsy();
      expect(await hrbac.isDenied(user, documentA, 'update')).toBeTruthy();

      expect(await hrbac.isAllowed(user, 'ffa')).toBeTruthy();
      expect(await hrbac.isAllowed(userV, 'ffa')).toBeTruthy();
      
      expect(await hrbac.isAllowed(user, profileU)).toBeTruthy();
      expect(await hrbac.isAllowed(user, profileV)).toBeFalsy();
      
      expect(await hrbac.isAllowed(user, documentA)).toBeFalsy();
    });

    it('editor', async () => {
      expect(await hrbac.isAllowed(editor, documentA, 'read')).toBeTruthy();
      expect(await hrbac.isDenied(editor, documentA, 'read')).toBeFalsy();
      expect(await hrbac.isAllowed(editor, documentA, 'list')).toBeTruthy();
      expect(await hrbac.isDenied(editor, documentA, 'list')).toBeFalsy();
      expect(await hrbac.isAllowed(editor, documentA, 'update')).toBeTruthy();
      expect(await hrbac.isDenied(editor, documentA, 'update')).toBeFalsy();
      expect(await hrbac.isAllowed(editor, documentA, 'create')).toBeFalsy();
      expect(await hrbac.isDenied(editor, documentA, 'create')).toBeTruthy();
      expect(await hrbac.isAllowed(editor, documentA, 'remove')).toBeFalsy();
      expect(await hrbac.isDenied(editor, documentA, 'remove')).toBeTruthy();
    });

    it('author', async () => {
      expect(await hrbac.isAllowed(authorA, documentA, 'read')).toBeTruthy();
      expect(await hrbac.isAllowed(authorA, documentA, 'list')).toBeTruthy();
      expect(await hrbac.isAllowed(authorA, documentA, 'update')).toBeTruthy();
      expect(await hrbac.isAllowed(authorA, documentA, 'create')).toBeTruthy();
      expect(await hrbac.isAllowed(authorA, documentA, 'remove')).toBeFalsy();

      expect(await hrbac.isAllowed(authorB, documentA, 'read')).toBeTruthy();
      expect(await hrbac.isAllowed(authorB, documentA, 'list')).toBeTruthy();
      expect(await hrbac.isAllowed(authorB, documentA, 'update')).toBeFalsy();
      expect(await hrbac.isAllowed(authorB, documentA, 'create')).toBeTruthy();
      expect(await hrbac.isAllowed(authorB, documentA, 'remove')).toBeFalsy();
    });
  });

  it('should support resource inheritance', async () => {
    hrbac = new HRBAC(new StaticRoleManager(), new StaticResourceManager(), new StaticPermissionManager());
    hrbac.getResourceManager().addParents('child', ['parent']);
    hrbac.getPermissionManager().deny();
    hrbac.getPermissionManager().allow('role', 'parent');

    expect(await hrbac.isAllowed('role', 'child')).toBeTruthy();

  })
});
