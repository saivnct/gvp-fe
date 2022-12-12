import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {AuthenticationService} from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authenticationService: AuthenticationService,
              protected router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
    const currentUser = this.authenticationService.currentUserValue;

    console.log("canActivate")
    console.log(currentUser)
    if (currentUser && currentUser.token) {
      const userInfoRole = currentUser.userInfo?.role ?? 0
      //NOT GUEST AND NORMAL
      if (userInfoRole > 1) {
        return true;
      }
      return this.router.parseUrl("/login");
    } else {
      return this.router.parseUrl("/login");
    }
  }
}
