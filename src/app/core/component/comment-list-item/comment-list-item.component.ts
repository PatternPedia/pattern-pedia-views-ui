import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RatingModelRequest, RatingManagementService } from '../../rating-management';
import { PAComment, Context } from '../../shared';
import { IssueManagementService, Issue } from '../../issue-management';
import { CandidateManagementService, Candidate } from '../../candidate-management';
import { AuthenticationService } from 'src/app/authentication/_services/authentication.service';
import { PrivilegeService } from 'src/app/authentication/_services/privilege.service';
import { FormControl } from '@angular/forms';
import { Content } from '@angular/compiler/src/render3/r3_ast';

@Component({
  selector: 'pp-comment-list-item',
  templateUrl: './comment-list-item.component.html',
  styleUrls: ['./comment-list-item.component.scss']
})
export class CommentListItemComponent implements OnInit {

  @Input() comment: PAComment;
  @Input() commentEntity: any;
  @Input() context: number;
  @Output() deleteComment: EventEmitter<PAComment> = new EventEmitter<PAComment>();

  disabled = true;
  isAuthor = false;
  oldComment: PAComment;

  commentCtrl = new FormControl();
  newComment = false;

  constructor(
    private issueManagementService: IssueManagementService,
    private canididateManagementService: CandidateManagementService,
    public p: PrivilegeService,
  ) { }

  ngOnInit(): void {
  }
  /** BUTTON */
  edit() {
    this.oldComment = Object.assign({}, this.comment);
    this.disabled = false;
  }

  cancel() {
    this.comment = this.oldComment;
    this.disabled = true;
  }

  addComment() {
    console.log('addComment');
    this.newComment = !this.newComment;
  }

  authorInfo() {
    console.log('User wrote this: ', this.comment.userId);
  }

  update() {
    switch (this.context) {
      case Context.ISSUE: {
        this.issueManagementService.updateComment(this.commentEntity, this.comment).subscribe(result => {
          if (result) this.comment = result;
          this.disabled = true;
        });
        break;
      }
      case Context.CANDIDATE: {
        this.canididateManagementService.updateComment(this.commentEntity, this.comment).subscribe(result => {
          if (result) this.comment = result;
          this.disabled = true;
        });
        break;
      }
      default: {
        console.log('Pattern comment');
        break;
      }
    }
  }

  delete() {
    this.deleteComment.emit(this.comment);
  }
}
