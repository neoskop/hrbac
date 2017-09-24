import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { HRBAC } from '../hrbac';
import { RouteResource } from './route-resource';
import { RoleStore } from './role-store';

@Injectable()
export class HrbacGuard implements CanActivate {
  
  constructor(protected hrbac : HRBAC, protected roleStore : RoleStore) {
  
  }
  
  canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Promise<boolean> | boolean {
    const resourceId : string|undefined = route.data['resourceId'];
    const privilege : string|null = route.data['privilege'] || null;
    
    if(!resourceId) {
      throw new Error(`resourceId in route.data required for HrbacGuard, ${JSON.stringify(route.data)} given.`)
    }
    
    const role = this.roleStore.getRole();
    
    if(!role) {
      throw new Error(`Cannot resolve current role for ${resourceId}`);
    }
    
    const resource = new RouteResource(resourceId, route, state);
    
    return this.hrbac.isAllowed(role!, resource, privilege);
  }
}
