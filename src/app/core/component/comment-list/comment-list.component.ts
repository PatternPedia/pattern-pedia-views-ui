import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IssueComment, Rating } from 'src/app/issue-management/issue-management.service';

export interface IssueCommentRatingEvent {
  issueComment: IssueComment,
  issueCommentRating: Rating,
}

@Component({
  selector: 'pp-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {

  @Input() data: IssueComment[];
  @Output() createComment: EventEmitter<IssueComment> = new EventEmitter<IssueComment>();
  @Output() commentRating: EventEmitter<IssueCommentRatingEvent> = new EventEmitter<IssueCommentRatingEvent>();
  
  comment: string;

  constructor() { }

  ngOnInit(): void {
    // this.data = [{}, {}];
  }

  cancelComment() {
    // console.log('cancel');
    this.comment = '';
  }

  addComment() {
    // console.log(this.comment)
    const commentIssue = {} as IssueComment;
    commentIssue.text = this.comment
    this.createComment.emit(commentIssue);
    this.comment = '';
  }

  updateCommentRating(rating: Rating, comment: IssueComment) {
    console.log('User Upvoted Comment', rating, comment);
    const issueCommentRatingEvent = {} as IssueCommentRatingEvent;
    issueCommentRatingEvent.issueComment = comment;
    issueCommentRatingEvent.issueCommentRating = rating;
    this.commentRating.emit(issueCommentRatingEvent);
    // this.commentRating.emit(rating);
  }

}