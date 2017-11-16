import { Resource } from '@neoskop/hrbac';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export class RouteResource extends Resource {
  constructor(resourceId : string, public route : ActivatedRouteSnapshot, public state : RouterStateSnapshot) {
    super(resourceId);
  }
}
