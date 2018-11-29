import { Component, OnInit} from '@angular/core';
import { UserService} from '../../services/user.service';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {
  public loading: Boolean;
  constructor(
    private _userService: UserService
  ) {
    this.loading = true;
    _userService.getIdentity().subscribe(
      result => {
        if (result) {
          this.loading = true;
        }
      }
    );
  }

  ngOnInit() {
    console.log('PreLoader cargado...');
  }
}
