import { Resource } from '../types';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export class RouteResource extends Resource {
  constructor(resourceId : string, public route : ActivatedRouteSnapshot, public state : RouterStateSnapshot) {
    super(resourceId);
  }
}
