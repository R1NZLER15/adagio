import { Component, OnInit } from '@angular/core';
import { UserService} from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [UserService]
})

export class HomeComponent implements OnInit {
  public title: String;
  constructor() {
    this.title = 'Inicio';
  }
  ngOnInit() {
    console.log('Inicio cargado...');
  }
}
