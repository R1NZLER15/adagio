import { Component, Injectable } from '@angular/core';
import { UserGuard } from './services/user.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@Injectable()
export class AppComponent {
  public title: String;
  public identified: Boolean;
  constructor(
    private _userGuard: UserGuard
  ) {
    this.title = 'Adagio';
    const hasAccess = _userGuard.checkAuth();
    if (hasAccess === true) {
      this.identified = true;
    } else {
      this.identified = false;
    }
    console.log(this.identified);
  }
}
