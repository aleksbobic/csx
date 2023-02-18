import axios from 'axios';
import { format } from 'date-fns';
import { safeRequest } from 'general.utils';
import { makeAutoObservable } from 'mobx';

export class CommentStore {
    editMode = false;
    editCommentIndex = null;
    editedCommentContent = null;
    isCommentListVisible = true;
    commentTrigger = true;
    screenshot = null;
    chartToAttach = null;
    chart = null;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setEditMode = val => (this.editMode = val);
    setEditCommentIndex = val => (this.editCommentIndex = val);
    setEditedCommentContent = content => {
        this.editedCommentContent = content.comment;
        this.screenshot = {
            image: content.screenshot,
            width: content.screenshot_width,
            height: content.screenshot_height,
            xOffset: content.screenshot_x_offset
        };

        this.chart = content.chart;
    };

    setIsCommentListVisible = val => (this.isCommentListVisible = val);
    setCommentTrigger = val => (this.commentTrigger = val);

    attachScreenshot = (windowWidth, windowHeight) => {
        let imageWidth = windowWidth;

        if (this.store.core.isLeftSidePanelOpen) {
            imageWidth = imageWidth - 300;
        }

        if (this.store.core.isRightSidePanelOpen) {
            imageWidth = imageWidth - this.store.core.rightPanelWidth;
        }

        this.screenshot = {
            image: this.store.graphInstance.retireveScreenshot(),
            width: imageWidth,
            height: windowHeight,
            xOffset: this.store.core.isLeftSidePanelOpen ? 300 : 0
        };
    };

    removeScreenshot = () => (this.screenshot = null);

    attachChart = chartImage => {
        this.chart = chartImage;
    };

    setChartToAttach = id => {
        this.chartToAttach = id;
    };

    removeChart = () => {
        this.chart = null;
    };

    addComment = async comment => {
        const comment_time = format(new Date(), 'H:mm do MMM yyyy OOOO');

        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment: comment,
            comment_time: comment_time
        };

        if (this.screenshot) {
            params['screenshot'] = this.screenshot.image;
            params['screenshot_width'] = parseInt(this.screenshot.width);
            params['screenshot_height'] = parseInt(this.screenshot.height);
            params['screenshot_x_offset'] = parseInt(this.screenshot.xOffset);
            this.removeScreenshot();
        }

        if (this.chart) {
            params['chart'] = this.chart;
            this.removeChart();
        }

        const { error } = await safeRequest(
            axios.post('history/comment/', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        const newComment = {
            comment: comment,
            time: comment_time,
            chart: params.chart ? params.chart : null
        };

        if (params.screenshot) {
            newComment.screenshot = params.screenshot;
            newComment.screenshot_width = params.screenshot_width;
            newComment.screenshot_height = params.screenshot_height;
            newComment.screenshot_x_offset = params.screenshot_x_offset;
        } else {
            newComment.screenshot = null;
            newComment.screenshot_width = null;
            newComment.screenshot_height = null;
            newComment.screenshot_x_offset = null;
        }

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments.push(newComment);

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

        if (this.screenshot) {
            params['screenshot'] = this.screenshot.image;
            params['screenshot_width'] = parseInt(this.screenshot.width);
            params['screenshot_height'] = parseInt(this.screenshot.height);
            params['screenshot_x_offset'] = parseInt(this.screenshot.xOffset);
            this.removeScreenshot();
        }

        if (this.chart) {
            params['chart'] = this.chart;
            this.removeChart();
        }

        const { error } = await safeRequest(
            axios.post('history/comment/edit', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        if (params.screenshot) {
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot = params.screenshot;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_width = params.screenshot_width;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_height = params.screenshot_height;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_x_offset = params.screenshot_x_offset;
        } else {
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot = null;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_width = null;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_height = null;
            this.store.core.studyHistory[
                this.store.core.studyHistoryItemIndex
            ].comments[index].screenshot_x_offset = null;
        }

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments[index].chart = params.chart ? params.chart : null;

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
