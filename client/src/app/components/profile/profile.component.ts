import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Publication } from '../../models/publication';
import { Follow } from '../../models/follower_followed';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';
import { PublicationService } from 'src/app/services/publication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [UserService, FollowService, PublicationService]
})
export class ProfileComponent implements OnInit {
  public title: String;
  public user: User;
  public status: String;
  public identity;
  public token;
  public stats;
  public statsFollowed;
  public statsFollowing;
  public statsPublications;
  public statsReceivedLikes;
  public userCover;
  public url;
  public page;
  public total;
  public pages;
  public itemsPerPage;
  public publications: Publication[];
  public followed;
  public following;
  public followUserOver;
  public noMore = false;
  public userId;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _followService: FollowService
  ) {
    this.title = 'Perfil';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.page = 1;
    this.followed = false;
    this.following = false;
  }
  ngOnInit() {
    console.log('profile.component cargado correctamente!!');
    this.loadPage();
    this.getUserPublications(this.userId, this.page);
  }

  loadPage() {
    this._route.params.subscribe(params => {
      const id = params['id'];

      this.getUser(id);
      this.getCounters(id);
      this.userId = id;
    });
  }
  getUser(id) {
    this._userService.getUser(id).subscribe(
      response => {
        if (response.user) {
          this.user = response.user;
          this.userCover = response.user.cover;
          console.log(response);
          if (response.following && response.following._id) {
            this.following = true;
          } else {
            this.following = false;
          }

          if (response.followed && response.followed._id) {
            this.followed = true;
          } else {
            this.followed = false;
          }

        } else {
          this.status = 'error';
        }
      },
      error => {
        console.log(<any>error);
        this._router.navigate(['/profile', this.identity._id]);
      }
    );
  }
  getCounters(id) {
    this._userService.getCounters(id).subscribe(
      response => {
        this.stats = response;
        this.statsFollowed = this.stats.followed;
        this.statsFollowing = this.stats.following;
        this.statsPublications = this.stats.publications;
        this.statsReceivedLikes = this.stats.received_likes;
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  followUser(followed) {
    const follow = new Follow('', this.identity._id, followed);

    this._followService.addFollow(this.token, follow).subscribe(
      response => {
        this.following = true;
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  unfollowUser(followed) {
    this._followService.deleteFollow(this.token, followed).subscribe(
      response => {
        this.following = false;
      },
      error => {
        console.log(<any>error);
      }
    );
  }
  mouseEnter(user_id) {
    this.followUserOver = user_id;
  }

  mouseLeave() {
    this.followUserOver = 0;
  }
  getUserPublications(user_id, page, adding = false) {
    this._publicationService.getUserPublications(this.token, user_id, page).subscribe(
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
    this.getUserPublications(this.userId, this.page, true);
  }
}
