import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { HRBAC } from "./hrbac";
import { Resource, Role } from "./types";
import { StaticRoleManager } from "./role-manager";
import { StaticPermissionManager } from './permission-manager';

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
  let hrbac : HRBAC<StaticRoleManager, StaticPermissionManager>;
  beforeEach(() => {
    hrbac = new HRBAC(new StaticRoleManager(), new StaticPermissionManager());
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
      expect(await hrbac.isAllowed('guest', documentA, 'read')).to.be.true;
      expect(await hrbac.isDenied('guest', documentA, 'read')).to.be.false;
      expect(await hrbac.isAllowed('guest', documentA, 'update')).to.be.false;
      expect(await hrbac.isDenied('guest', documentA, 'update')).to.be.true;
    });

    it('admin', async () => {
      expect(await hrbac.isAllowed(admin, 'settings')).to.be.true;
      expect(await hrbac.isDenied(admin, 'settings')).to.be.false;
    });

    it('user', async () => {
      expect(await hrbac.isAllowed(user, documentA, 'read')).to.be.true;
      expect(await hrbac.isDenied(user, documentA, 'read')).to.be.false;
      expect(await hrbac.isAllowed(user, documentA, 'list')).to.be.true;
      expect(await hrbac.isDenied(user, documentA, 'list')).to.be.false;
      expect(await hrbac.isAllowed(user, documentA, 'update')).to.be.false;
      expect(await hrbac.isDenied(user, documentA, 'update')).to.be.true;

      expect(await hrbac.isAllowed(user, 'ffa')).to.be.true;
      expect(await hrbac.isAllowed(userV, 'ffa')).to.be.true;
      
      expect(await hrbac.isAllowed(user, profileU)).to.be.true;
      expect(await hrbac.isAllowed(user, profileV)).to.be.false;
      
      expect(await hrbac.isAllowed(user, documentA)).to.be.false;
    });

    it('editor', async () => {
      expect(await hrbac.isAllowed(editor, documentA, 'read')).to.be.true;
      expect(await hrbac.isDenied(editor, documentA, 'read')).to.be.false;
      expect(await hrbac.isAllowed(editor, documentA, 'list')).to.be.true;
      expect(await hrbac.isDenied(editor, documentA, 'list')).to.be.false;
      expect(await hrbac.isAllowed(editor, documentA, 'update')).to.be.true;
      expect(await hrbac.isDenied(editor, documentA, 'update')).to.be.false;
      expect(await hrbac.isAllowed(editor, documentA, 'create')).to.be.false;
      expect(await hrbac.isDenied(editor, documentA, 'create')).to.be.true;
      expect(await hrbac.isAllowed(editor, documentA, 'remove')).to.be.false;
      expect(await hrbac.isDenied(editor, documentA, 'remove')).to.be.true;
    });

    it('author', async () => {
      expect(await hrbac.isAllowed(authorA, documentA, 'read')).to.be.true;
      expect(await hrbac.isAllowed(authorA, documentA, 'list')).to.be.true;
      expect(await hrbac.isAllowed(authorA, documentA, 'update')).to.be.true;
      expect(await hrbac.isAllowed(authorA, documentA, 'create')).to.be.true;
      expect(await hrbac.isAllowed(authorA, documentA, 'remove')).to.be.false;

      expect(await hrbac.isAllowed(authorB, documentA, 'read')).to.be.true;
      expect(await hrbac.isAllowed(authorB, documentA, 'list')).to.be.true;
      expect(await hrbac.isAllowed(authorB, documentA, 'update')).to.be.false;
      expect(await hrbac.isAllowed(authorB, documentA, 'create')).to.be.true;
      expect(await hrbac.isAllowed(authorB, documentA, 'remove')).to.be.false;
    });
  })
});
