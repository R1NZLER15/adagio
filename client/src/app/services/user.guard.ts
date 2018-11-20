import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _userService: UserService
  ) {}

  canActivate() {
    const identity = this._userService.getIdentity();
    if (identity && (identity.role === 'guest' || identity.role === 'student' || identity.role === 'administrator')) {
      return true;
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }
  checkAuth() {
    const identity = this._userService.getIdentity();
    if (identity && (identity.role === 'guest' || identity.role === 'student' || identity.role === 'administrator')) {
      return true;
    } else {
      return false;
    }
  }
}
