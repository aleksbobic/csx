import { makeAutoObservable } from 'mobx';
import axios from 'axios';
import { format } from 'date-fns';
import { safeRequest } from 'general.utils';

export class CommentStore {
    editMode = false;
    editCommentIndex = null;
    editedCommentContent = null;
    isCommentListVisible = true;
    commentTrigger = true;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setEditMode = val => (this.editMode = val);
    setEditCommentIndex = val => (this.editCommentIndex = val);
    setEditedCommentContent = val => (this.editedCommentContent = val);
    setIsCommentListVisible = val => (this.isCommentListVisible = val);
    setCommentTrigger = val => (this.commentTrigger = val);

    addComment = async comment => {
        const comment_time = format(new Date(), 'H:mm do MMM yyyy OOOO');

        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment: comment,
            comment_time: comment_time
        };

        const { error } = await safeRequest(
            axios.post('history/comment/', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments.push({ comment: comment, time: comment_time });

        this.store.history.generateHistoryNodes();

        if (!this.store.core.studyIsSaved) {
            this.store.core.saveStudy();
        }
    };

    deleteCommnet = async index => {
        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment_index: index
        };

        const { error } = await safeRequest(
            axios.post('history/comment/delete', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments.splice(index, 1);

        this.store.history.generateHistoryNodes();
    };

    editComment = async (comment, index) => {
        const comment_time = format(new Date(), 'H:mm do MMM yyyy OOOO');

        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment_index: index,
            comment: comment,
            comment_time: comment_time
        };

        const { error } = await safeRequest(
            axios.post('history/comment/edit', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments[index].comment = comment;

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments[index].time = comment_time;

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments[index]['edited'] = true;

        this.store.history.generateHistoryNodes();
    };
}
