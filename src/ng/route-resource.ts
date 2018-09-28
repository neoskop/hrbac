import { Resource } from '@neoskop/hrbac';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export class RouteResource extends Resource {
  constructor(resourceId : string, public readonly route : ActivatedRouteSnapshot, public readonly state : RouterStateSnapshot) {
    super(resourceId);
  }
}
