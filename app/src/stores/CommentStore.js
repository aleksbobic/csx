import { makeAutoObservable } from 'mobx';

export class CommentStore {
    editMode = false;
    editCommentIndex = null;
    editedCommentContent = null;
    isCommentListVisible = true;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setEditMode = value => (this.editMode = value);
    setEditCommentIndex = value => (this.editCommentIndex = value);
    setEditedCommentContent = value => (this.editedCommentContent = value);
    setIsCommentListVisible = value => (this.isCommentListVisible = value);
}
