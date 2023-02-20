import { makeAutoObservable } from 'mobx';
import axios from 'axios';
import { safeRequest } from 'general.utils';
import { format } from 'date-fns';

export class PresentStore {
    slides = [];

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    getDirectChildren = (id, history) =>
        history.reduce((children, item) => {
            if (item.parent === id) {
                children.push(item);
            }
            return children;
        }, []);

    getNumberOfChildren = (id, history) =>
        this.getDirectChildren(id, history).length;

    getParentIDs = (id, history) => {
        const focusItem = history.find(entry => entry.id === id);

        if (focusItem.parent !== 'None') {
            return [
                focusItem.id,
                ...this.getParentIDs(focusItem.parent, history)
            ];
        } else {
            return [focusItem.id];
        }
    };

    generateSlides = async (studyID, activeItem) => {
        const studyDetails = await this.getStudyDetails(studyID);

        if (activeItem) {
            const includedIDs = this.getParentIDs(
                studyDetails.history[activeItem].id,
                studyDetails.history
            );

            studyDetails.history = studyDetails.history.filter(entry =>
                includedIDs.includes(entry.id)
            );
        }

        let tempSlides = [
            {
                type: 'intro',
                title: studyDetails?.name,
                text: studyDetails?.description,
                author: studyDetails?.author,
                time: format(new Date(), 'do MMM yyyy')
            }
        ];

        const entryIDsWithIncrement = [
            {
                id: studyDetails.history[0].id,
                section: '1',
                numberOfParentsChildren: 0
            }
        ];

        const sectionToOrder = new Map();
        sectionToOrder.set('1', 1);

        studyDetails.history.forEach(item => {
            const children = this.getDirectChildren(
                item.id,
                studyDetails.history
            );

            const parent = entryIDsWithIncrement.find(
                entryWithID => entryWithID.id === item.id
            );

            if (parent) {
                const parentSection = parent.section;

                if (children.length === 1) {
                    entryIDsWithIncrement.push({
                        id: children[0].id,
                        section: parentSection,
                        numberOfParentsChildren: this.getNumberOfChildren(
                            children[0].parent,
                            studyDetails.history
                        )
                    });
                } else if (children.length > 1) {
                    children.forEach((child, index) => {
                        entryIDsWithIncrement.push({
                            id: child.id,
                            section: `${parentSection}.${index + 1}`,
                            numberOfParentsChildren: this.getNumberOfChildren(
                                child.parent,
                                studyDetails.history
                            )
                        });
                        sectionToOrder.set(
                            `${parentSection}.${index + 1}`,
                            sectionToOrder.size + 1
                        );
                    });
                }
            }
        });

        const sections = [];

        sectionToOrder.forEach((value, key) => {
            sections.push({
                section: key,
                slides: entryIDsWithIncrement
                    .filter(entry => entry.section === key)
                    .map(entry => {
                        return studyDetails.history.find(
                            historyItem => historyItem.id === entry.id
                        );
                    })
            });
        });

        sections.forEach(section => {
            const sectionSlides = [];

            section.slides.forEach(entry => {
                if (entry.comments.length > 0) {
                    entry.comments.forEach(comment => {
                        if (comment.chart && comment.screenshot) {
                            sectionSlides.push({
                                type: 'markdownscreenshotandchart',
                                content: comment.comment,
                                screenshot: comment.screenshot,
                                screenshotHeight: comment.screenshot_height,
                                screenshotWidth: comment.screenshot_width,
                                screenshotXOffset:
                                    (100 * comment.screenshot_x_offset) /
                                    comment.screenshot_width,
                                chart: comment.chart
                            });
                        } else if (comment.chart) {
                            sectionSlides.push({
                                type: 'markdownchart',
                                content: comment.comment,
                                chart: comment.chart
                            });
                        } else if (comment.screenshot) {
                            sectionSlides.push({
                                type: 'markdownscreenshot',
                                content: comment.comment,
                                screenshot: comment.screenshot,
                                screenshotHeight: comment.screenshot_height,
                                screenshotWidth: comment.screenshot_width,
                                screenshotXOffset:
                                    (100 * comment.screenshot_x_offset) /
                                    comment.screenshot_width
                            });
                        } else {
                            sectionSlides.push({
                                type: 'markdown',
                                content: comment.comment
                            });
                        }
                    });
                }
            });

            if (sectionSlides.length > 0) {
                if (!activeItem) {
                    tempSlides.push({
                        type: 'text',
                        title: `Section ${section.section}`,
                        text: ''
                    });
                }
                tempSlides = tempSlides.concat(sectionSlides);
            }
        });

        tempSlides.push({
            type: 'final',
            title: 'Thanks! Any questions?',
            text: 'Made with Collaboration Spotting X'
        });

        this.slides = tempSlides;
    };

    getStudyDetails = async studyID => {
        const params = {
            study_uuid: studyID,
            user_uuid: this.store.core.userUuid
        };

        const { response, error } = await safeRequest(
            axios.get('study/history', { params })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        return response.data;
    };
}
