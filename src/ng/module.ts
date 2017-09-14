import { ModuleWithProviders, NgModule } from '@angular/core';
import { HierarchicalRoleBaseAccessControl } from '../hrbac';
import { RoleManager } from '../role-manager';
import { PermissionManager } from '../permission-manager';
import { Role } from '../types';
import { RoleStore, DEFAULT_ROLE } from './role-store';
import { HrbacGuard } from "./guard";
import { AllowedDirective, DeniedDirective } from "./directives";
import { AllowedPipe, DeniedPipe } from './pipes';

export function defaultRoleFactory() {
  return new Role('guest');
}

@NgModule({
  declarations: [
    AllowedDirective,
    DeniedDirective,
    AllowedPipe,
    DeniedPipe
  ],
  exports: [
    AllowedDirective,
    DeniedDirective,
    AllowedPipe,
    DeniedPipe
  ]
})
export class HrbacModule {
  static forRoot() : ModuleWithProviders {
    return {
      ngModule: HrbacModule,
      providers: [
        HierarchicalRoleBaseAccessControl,
        RoleManager,
        PermissionManager,
        RoleStore,
        { provide: DEFAULT_ROLE, deps: [], useFactory: defaultRoleFactory },
        HrbacGuard
      ]
    }
  }
  
}
