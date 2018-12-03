import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import { Follow } from '../../models/follower_followed';
import { FollowService } from '../../services/follow.service';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss'],
  providers: [UserService, PublicationService, FollowService]
})
export class PublicationsComponent implements OnInit {
  public title: String;
  public identity;
  public token;
  public url: String;
  public publication: Publication;
  public status: String;
  public page;
  public total;
  public pages;
  public itemsPerPage;
  public publications: Publication[];
  @Input() user: String;
  public noMore = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _followService: FollowService
  ) {
    this.title = 'Publicaciones';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.publication = new Publication (
      '', '', '', '', 0, '', '', '', this.identity._id
    );
    this.url = GLOBAL.url;
    this.page = 1;
  }

  ngOnInit() {
    console.log('Cargando publicaciones...');
    this.getFollowedPublications(this.page);
  }

  onSubmit(form) {
    this._publicationService.savePublication(this.token, this.publication).subscribe(
      response => {
        if (response) {
          this.status = 'success';
          form.reset();
          const arrayA = this.publications;
          const arrayB = response.publication;
          arrayA.unshift(arrayB);
          this.publications = arrayA;
          $('html, body');
        } else {
          this.status = 'error';
          console.log('ERROR');
        }
      },
      error => {
        this.status = 'error';
        console.log(<any>error);
      }
    );
  }

  viewNew() {
    this._publicationService.getFollowedPublications(this.token, this.page).subscribe(
      response => {

      }
    );
  }

  getFollowedPublications(page, adding = false) {
    this._publicationService.getFollowedPublications(this.token, page).subscribe(
      response => {
        if (response.publications) {
          this.total = response.total_items;
          this.pages = response.pages;
          this.itemsPerPage = response.items_per_page;

          if (!adding) {
            this.publications = response.publications;
          } else {
            const arrayA = this.publications;
            const arrayB = response.publications;
            this.publications = arrayA.concat(arrayB);
            $('html, body');
            console.log(this.publications);
          }
          if (page > this.pages) {
          }
        } else {
          this.status = 'error';
        }
      },
      error => {
        const errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }
  viewMore() {
    this.page += 1;
    if (this.page === this.pages) {
      this.noMore = true;
    }
    this.getFollowedPublications(this.page, true);
  }

  /*likeInteract(publication_id) {
    this._publicationService.likePublication().subscribe(
      response => {
      }
    )
  }*/
}
