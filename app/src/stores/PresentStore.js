import { makeAutoObservable } from 'mobx';
import axios from 'axios';
import { safeRequest } from 'general.utils';
import { format } from 'date-fns';
import pptxgen from 'pptxgenjs';
import logo from 'images/logo.png';

export class PresentStore {
    slides = [];
    studyTitle = '';
    studyDescription = '';
    studyAuthor = '';
    getInchesFromPoints = valuePoints => valuePoints * 0.0138889;
    getPointsFromPixels = pixelValue => pixelValue * 0.75;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setSlides = slides => (this.slides = slides);

    addIntroSlide = (pptxSlide, slide) => {
        pptxSlide
            .addText(slide.title.toUpperCase(), {
                x: '10%',
                w: '80%',
                y: '20%',
                h: this.getInchesFromPoints(36),
                fontSize: 36,
                color: 'eee8d5',
                align: 'center',
                bold: true,
                fontFace: 'Arial'
            })
            .addText(slide.text, {
                x: '25%',
                w: '50%',
                y: '40%',
                h: this.getInchesFromPoints(16),
                fontSize: 12,
                color: '93a1a1',
                align: 'center',
                fontFace: 'Arial'
            })
            .addText(slide.time, {
                x: '20%',
                w: '30%',
                y: '80%',
                h: this.getInchesFromPoints(12),
                fontSize: 12,
                color: '93a1a1',
                align: 'left',
                bold: true,
                fontFace: 'Arial'
            })
            .addText(slide.author, {
                x: '50%',
                w: '30%',
                y: '80%',
                h: this.getInchesFromPoints(12),
                fontSize: 12,
                color: '93a1a1',
                align: 'right',
                bold: true,
                fontFace: 'Arial'
            });
    };

    addFinalSlide = (pptxSlide, slide) => {
        pptxSlide
            .addText(slide.title, {
                x: '10%',
                w: '80%',
                y: '36%',
                h: this.getInchesFromPoints(36),
                fontSize: 36,
                color: 'eee8d5',
                align: 'center',
                bold: true,
                fontFace: 'Arial'
            })
            .addText(slide.text, {
                x: '20%',
                w: '60%',
                y: '50%',
                h: this.getInchesFromPoints(16),
                fontSize: 16,
                color: '93a1a1',
                align: 'center',
                bold: true,
                fontFace: 'Arial'
            })
            .addText('csxp.me', {
                x: '20%',
                w: '60%',
                y: '75%',
                h: this.getInchesFromPoints(12),
                fontSize: 12,
                color: '93a1a1',
                align: 'center',
                bold: true,
                fontFace: 'Arial',
                hyperlink: { url: 'https://csxp.me/' }
            })
            .addImage({
                path: logo,
                w: this.getInchesFromPoints(36),
                h: this.getInchesFromPoints(36),
                y: '60%',
                x: '47.5%'
            });
    };

    addTextSlide = (pptxSlide, slide) => {
        if (slide.text === '') {
            pptxSlide.addText(slide.title, {
                x: '10%',
                w: '80%',
                y: '36%',
                h: this.getInchesFromPoints(36),
                fontSize: 36,
                color: 'eee8d5',
                align: 'center',
                bold: true,
                fontFace: 'Arial'
            });
        } else {
            pptxSlide
                .addText(slide.title, {
                    x: '10%',
                    w: '80%',
                    y: '36%',
                    h: this.getInchesFromPoints(36),
                    fontSize: 36,
                    color: 'eee8d5',
                    align: 'center',
                    bold: true,
                    fontFace: 'Arial'
                })
                .addText(slide.text, {
                    x: '20%',
                    w: '60%',
                    y: '50%',
                    h: this.getInchesFromPoints(24),
                    fontSize: 24,
                    color: '93a1a1',
                    align: 'center',
                    bold: true,
                    fontFace: 'Arial'
                });
        }
    };

    addMarkdownHeading = (
        pptxSlide,
        text,
        size,
        fontSize,
        offset,
        textXOffset,
        textWidthBasedOnOffset
    ) => {
        pptxSlide.addText(text, {
            x: textXOffset ? textXOffset : '5%',
            w: textWidthBasedOnOffset ? textWidthBasedOnOffset : '90%',
            y: offset,
            h: size,
            fontSize: fontSize,
            color: 'eee8d5',
            align: 'left',
            fontFace: 'Arial',
            bold: true
        });
    };

    addMarkdownText = (
        pptxSlide,
        text,
        size,
        fontSize,
        offset,
        textXOffset,
        textWidthBasedOnOffset
    ) => {
        pptxSlide.addText(text, {
            x: textXOffset ? textXOffset : '5%',
            w: textWidthBasedOnOffset ? textWidthBasedOnOffset : '90%',
            y: offset,
            h: size,
            fontSize: fontSize,
            color: '93a1a1',
            align: 'left',
            fontFace: 'Arial'
        });
    };

    addMarkdownQuote = (
        pptxSlide,
        text,
        size,
        fontSize,
        offset,
        textXOffset,
        textWidthBasedOnOffset
    ) => {
        pptxSlide.addText(text, {
            x: textXOffset ? textXOffset : '5%',
            w: textWidthBasedOnOffset ? textWidthBasedOnOffset : '90%',
            y: offset,
            h: size,
            fontSize: fontSize,
            color: '93a1a1',
            align: 'center',
            fontFace: 'Arial',
            shape: 'rect',
            italic: true,
            fill: { color: '262b37' }
        });
    };

    addMarkdownUnorderedListItem = (
        pptxSlide,
        text,
        size,
        fontSize,
        offset,
        textXOffset,
        textWidthBasedOnOffset
    ) => {
        pptxSlide.addText(text, {
            x: textXOffset ? textXOffset : '5%',
            w: textWidthBasedOnOffset ? textWidthBasedOnOffset : '90%',
            y: offset,
            h: size,
            bullet: true,
            fontSize: fontSize,
            color: '93a1a1',
            align: 'left',
            fontFace: 'Arial'
        });
    };

    addMarkdownOrderedListItem = (
        pptxSlide,
        text,
        size,
        fontSize,
        offset,
        textXOffset,
        textWidthBasedOnOffset
    ) => {
        pptxSlide.addText(text, {
            x: textXOffset ? textXOffset : '5%',
            w: textWidthBasedOnOffset ? textWidthBasedOnOffset : '90%',
            y: offset,
            h: size,
            bullet: { type: 'number' },
            fontSize: fontSize,
            color: '93a1a1',
            align: 'left',
            fontFace: 'Arial'
        });
    };

    getTextWidth(text, font) {
        // if given, use cached canvas for better performance
        // else, create new canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
    }

    handleUnorderedList = (
        slidesWithOffsets,
        unorderedListStack,
        nextOffset,
        textWidthBasedOnOffset
    ) => {
        const numberOfLines =
            Math.ceil(
                this.getInchesFromPoints(
                    this.getPointsFromPixels(
                        this.getTextWidth(
                            unorderedListStack.join('\n'),
                            `${this.getPointsFromPixels(13)}pt arial`
                        ) +
                            unorderedListStack.length * 80
                    )
                ) / textWidthBasedOnOffset
            ) + 1;

        slidesWithOffsets.push({
            offset: nextOffset,
            type: 'unorderedlist',
            height: this.getInchesFromPoints(
                this.getPointsFromPixels(13 * numberOfLines)
            ),
            fontSize: this.getPointsFromPixels(13),
            content: unorderedListStack.join('\n')
        });

        const newNextOffset =
            this.getInchesFromPoints(
                this.getPointsFromPixels(13 * numberOfLines)
            ) +
            slidesWithOffsets[slidesWithOffsets.length - 1].height +
            slidesWithOffsets[slidesWithOffsets.length - 1].offset;

        return newNextOffset;
    };

    handleOrderedList = (
        slidesWithOffsets,
        orderedListStack,
        nextOffset,
        textWidthBasedOnOffset
    ) => {
        const numberOfLines =
            Math.ceil(
                this.getInchesFromPoints(
                    this.getPointsFromPixels(
                        this.getTextWidth(
                            orderedListStack.join('\n'),
                            `${this.getPointsFromPixels(13)}pt arial`
                        ) +
                            orderedListStack.length * 80
                    )
                ) / textWidthBasedOnOffset
            ) + 1;

        slidesWithOffsets.push({
            offset: nextOffset,
            type: 'orderedlist',
            height: this.getInchesFromPoints(
                this.getPointsFromPixels(13 * numberOfLines)
            ),
            fontSize: this.getPointsFromPixels(13),
            content: orderedListStack.join('\n')
        });

        const newNextOffset =
            this.getInchesFromPoints(
                this.getPointsFromPixels(13 * numberOfLines)
            ) +
            slidesWithOffsets[slidesWithOffsets.length - 1].height +
            slidesWithOffsets[slidesWithOffsets.length - 1].offset;

        return newNextOffset;
    };

    addMarkdownSlide = (pptxSlide, slide, index) => {
        // Default slide size: 10 x 5.625 inches

        let xOffset;
        let textXOffset = null;
        let textWidthBasedOnOffset = 9;

        if ((index || slide.align) && slide.screenshot) {
            if (slide.align) {
                if (slide.align === 'left') {
                    xOffset = '0%';
                    textXOffset = `${
                        3.5 * (slide.screenshotWidth / slide.screenshotHeight)
                    }`;
                    textWidthBasedOnOffset = `${
                        10 -
                        3.5 * (slide.screenshotWidth / slide.screenshotHeight) -
                        0.2
                    }`;
                } else {
                    xOffset = `${
                        10 -
                        3.5 * (slide.screenshotWidth / slide.screenshotHeight) -
                        0.2
                    }`;
                    textXOffset = '0.2';
                    textWidthBasedOnOffset = xOffset;
                }
            } else {
                xOffset =
                    index % 2
                        ? '0%'
                        : `${
                              10 -
                              3.5 *
                                  (slide.screenshotWidth /
                                      slide.screenshotHeight)
                          }`;

                textXOffset =
                    index % 2
                        ? `${
                              3.5 *
                              (slide.screenshotWidth / slide.screenshotHeight)
                          }`
                        : '0.2';
                textWidthBasedOnOffset =
                    index % 2
                        ? `${
                              10 -
                              3.5 *
                                  (slide.screenshotWidth /
                                      slide.screenshotHeight) -
                              0.2
                          }`
                        : `${
                              10 -
                              3.5 *
                                  (slide.screenshotWidth /
                                      slide.screenshotHeight) -
                              0.2
                          }`;
            }

            pptxSlide.addImage({
                data: slide.screenshot,
                x: xOffset,
                w: `${3.5 * (slide.screenshotWidth / slide.screenshotHeight)}`,
                h: '3.5',
                y: '1.0625'
            });
        }

        if ((index || slide.align) && slide.chart) {
            if (slide.align) {
                if (slide.align === 'left') {
                    xOffset = '0%';
                    textXOffset = `${10 - 4.35}`;
                    textWidthBasedOnOffset = `${4.35 - 0.2}`;
                } else {
                    xOffset = '4.35';
                    textXOffset = '0.2';
                    textWidthBasedOnOffset = `${4.35 - 0.2}`;
                }
            } else {
                xOffset = index % 2 ? '0%' : '4.35';
                textXOffset = index % 2 ? `${10 - 4.35}` : '0.2';
                textWidthBasedOnOffset = `${4.35 - 0.2}`;
            }

            pptxSlide.addImage({
                data: slide.chart,
                x: xOffset,
                w: '5.565',
                h: '3.95',
                y: '1.0625'
            });
        }

        // let nextOffset = this.getInchesFromPoints(this.getPointsFromPixels(40));
        let nextOffset = 0;

        const slidesWithOffsets = [];
        const headingPixelSizes = [32, 24, 18, 16, 16, 16];

        const contentChunks = slide.content.split(/\r?\n/);

        let orderedListStack = [];
        let unorderedListStack = [];

        let numberOfLines;

        contentChunks.forEach((row, index) => {
            if (/^#{1,6} /.test(row)) {
                if (orderedListStack.length > 0) {
                    nextOffset = this.handleOrderedList(
                        slidesWithOffsets,
                        orderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    orderedListStack = [];
                }

                if (unorderedListStack.length > 0) {
                    nextOffset = this.handleUnorderedList(
                        slidesWithOffsets,
                        unorderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    unorderedListStack = [];
                }

                numberOfLines = Math.ceil(
                    this.getInchesFromPoints(
                        this.getPointsFromPixels(
                            this.getTextWidth(
                                row.slice(row.indexOf(' ') + 1),
                                `${this.getPointsFromPixels(
                                    headingPixelSizes[
                                        row.split(' ')[0].length - 1
                                    ] + 5
                                )}pt arial`
                            )
                        )
                    ) / textWidthBasedOnOffset
                );

                slidesWithOffsets.push({
                    offset: nextOffset,
                    type: 'heading',
                    height: this.getInchesFromPoints(
                        this.getPointsFromPixels(
                            headingPixelSizes[row.split(' ')[0].length - 1] *
                                numberOfLines
                        )
                    ),
                    fontSize: this.getPointsFromPixels(
                        headingPixelSizes[row.split(' ')[0].length - 1]
                    ),
                    content: row.slice(row.indexOf(' ') + 1)
                });

                nextOffset =
                    this.getInchesFromPoints(
                        this.getPointsFromPixels(
                            headingPixelSizes[row.split(' ')[0].length - 1] *
                                numberOfLines
                        )
                    ) +
                    slidesWithOffsets[slidesWithOffsets.length - 1].height +
                    slidesWithOffsets[slidesWithOffsets.length - 1].offset;
            } else if (/^\*{1} /.test(row)) {
                if (orderedListStack.length > 0) {
                    nextOffset = this.handleOrderedList(
                        slidesWithOffsets,
                        orderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    orderedListStack = [];
                }

                unorderedListStack.push(row.slice(row.indexOf(' ') + 1));
            } else if (/^[0-9]+\. /.test(row)) {
                if (unorderedListStack.length > 0) {
                    nextOffset = this.handleUnorderedList(
                        slidesWithOffsets,
                        unorderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    unorderedListStack = [];
                }

                orderedListStack.push(row.slice(row.indexOf(' ') + 1));
            } else if (/^> /.test(row)) {
                if (orderedListStack.length > 0) {
                    nextOffset = this.handleOrderedList(
                        slidesWithOffsets,
                        orderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    orderedListStack = [];
                }

                if (unorderedListStack.length > 0) {
                    nextOffset = this.handleUnorderedList(
                        slidesWithOffsets,
                        unorderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    unorderedListStack = [];
                }

                numberOfLines =
                    Math.ceil(
                        this.getInchesFromPoints(
                            this.getPointsFromPixels(
                                this.getTextWidth(
                                    row.slice(row.indexOf(' ') + 1),
                                    `${this.getPointsFromPixels(13)}pt arial`
                                )
                            )
                        ) / textWidthBasedOnOffset
                    ) + 1;

                slidesWithOffsets.push({
                    offset: nextOffset,
                    type: 'quote',
                    height: this.getInchesFromPoints(
                        this.getPointsFromPixels(13 * numberOfLines + 30)
                    ),
                    fontSize: this.getPointsFromPixels(13),
                    content: row.slice(row.indexOf(' ') + 1)
                });

                nextOffset =
                    this.getInchesFromPoints(
                        this.getPointsFromPixels(13 * numberOfLines)
                    ) +
                    slidesWithOffsets[slidesWithOffsets.length - 1].height +
                    slidesWithOffsets[slidesWithOffsets.length - 1].offset;
            } else if (row !== '') {
                if (orderedListStack.length > 0) {
                    nextOffset = this.handleOrderedList(
                        slidesWithOffsets,
                        orderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    orderedListStack = [];
                }

                if (unorderedListStack.length > 0) {
                    nextOffset = this.handleUnorderedList(
                        slidesWithOffsets,
                        unorderedListStack,
                        nextOffset,
                        textWidthBasedOnOffset
                    );
                    unorderedListStack = [];
                }

                numberOfLines =
                    Math.ceil(
                        this.getInchesFromPoints(
                            this.getPointsFromPixels(
                                this.getTextWidth(
                                    row,
                                    `${this.getPointsFromPixels(13)}pt arial`
                                )
                            )
                        ) / textWidthBasedOnOffset
                    ) + 1;

                slidesWithOffsets.push({
                    offset: nextOffset,
                    type: 'text',
                    height: this.getInchesFromPoints(
                        this.getPointsFromPixels(13) * numberOfLines
                    ),
                    fontSize: this.getPointsFromPixels(13),
                    content: row
                });

                nextOffset =
                    this.getInchesFromPoints(
                        this.getPointsFromPixels(13) * numberOfLines
                    ) +
                    slidesWithOffsets[slidesWithOffsets.length - 1].height +
                    slidesWithOffsets[slidesWithOffsets.length - 1].offset;
            }
        });

        if (orderedListStack.length > 0) {
            nextOffset = this.handleOrderedList(
                slidesWithOffsets,
                orderedListStack,
                nextOffset,
                textWidthBasedOnOffset
            );
            orderedListStack = [];
        }

        if (unorderedListStack.length > 0) {
            nextOffset = this.handleUnorderedList(
                slidesWithOffsets,
                unorderedListStack,
                nextOffset,
                textWidthBasedOnOffset
            );
            unorderedListStack = [];
        }

        let height =
            slidesWithOffsets[slidesWithOffsets.length - 1].offset +
            slidesWithOffsets[slidesWithOffsets.length - 1].height;

        let initialYOffset = 0;

        if (height < 5.625) {
            initialYOffset = (5.625 - height) / 2;
        }

        slidesWithOffsets.forEach(entry => {
            switch (entry.type) {
                case 'heading':
                    this.addMarkdownHeading(
                        pptxSlide,
                        entry.content,
                        entry.height,
                        entry.fontSize,
                        entry.offset + initialYOffset,
                        textXOffset,
                        textWidthBasedOnOffset
                    );
                    break;
                case 'unorderedlist':
                    this.addMarkdownUnorderedListItem(
                        pptxSlide,
                        entry.content,
                        entry.height,
                        entry.fontSize,
                        entry.offset + initialYOffset,
                        textXOffset,
                        textWidthBasedOnOffset
                    );
                    break;
                case 'orderedlist':
                    this.addMarkdownOrderedListItem(
                        pptxSlide,
                        entry.content,
                        entry.height,
                        entry.fontSize,
                        entry.offset + initialYOffset,
                        textXOffset,
                        textWidthBasedOnOffset
                    );
                    break;
                case 'quote':
                    this.addMarkdownQuote(
                        pptxSlide,
                        entry.content,
                        entry.height,
                        entry.fontSize,
                        entry.offset + initialYOffset,
                        textXOffset,
                        textWidthBasedOnOffset
                    );
                    break;
                default:
                    this.addMarkdownText(
                        pptxSlide,
                        entry.content,
                        entry.height,
                        entry.fontSize,
                        entry.offset + initialYOffset,
                        textXOffset,
                        textWidthBasedOnOffset
                    );
                    break;
            }
        });
    };

    generatePPT = () => {
        let pptx = new pptxgen();

        pptx.author = this.studyAuthor;
        pptx.company = 'Made with Collaboration Spotting X';
        pptx.subject = this.studyDescription;
        pptx.title = this.studyTitle;

        this.slides.forEach((slide, index) => {
            let pptxSlide = pptx.addSlide();
            pptxSlide.background = { color: '#1B202B' };

            switch (slide.type) {
                case 'intro':
                    this.addIntroSlide(pptxSlide, slide);
                    break;
                case 'final':
                    this.addFinalSlide(pptxSlide, slide);
                    break;
                case 'text':
                    this.addTextSlide(pptxSlide, slide);
                    break;
                case 'markdown':
                    this.addMarkdownSlide(pptxSlide, slide);
                    break;
                default:
                    this.addMarkdownSlide(pptxSlide, slide, index);
                    break;
            }
        });

        pptx.writeFile({
            fileName: `${this.slides[0].title
                .replaceAll(' ', '_')
                .toLowerCase()}.pptx`
        });
    };

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

    sortSections = sections => {
        const orderedSections = [{ ...sections[0], children: 0 }];

        sections.forEach(entry => {
            if (entry.section !== '1') {
                const originalParentLocation = entry.section.lastIndexOf('.');
                const parent = entry.section.slice(0, originalParentLocation);
                const parentLocation = orderedSections.findIndex(
                    entry => entry.section === parent
                );
                orderedSections.splice(
                    parentLocation +
                        1 +
                        orderedSections[parentLocation].children,
                    0,
                    {
                        ...entry,
                        children: 0
                    }
                );
                orderedSections[parentLocation].children += 1;
            }
        });

        return orderedSections;
    };

    generateSlides = async (studyID, publicStudyID, activeItem) => {
        let studyDetails;

        if (studyID) {
            studyDetails = await this.getStudyDetails(studyID);
        } else {
            studyDetails = await this.getPublicStudyDetails(publicStudyID);
        }

        if (studyDetails.empty) {
            this.store.core.setStudyIsEmpty(true);
            return;
        }

        this.studyTitle = studyDetails.name;
        this.studyAuthor = studyDetails.author;
        this.studyDescription = studyDetails.description;

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

        let sections = [];

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

        sections = this.sortSections(sections);

        sections.forEach(section => {
            const sectionSlides = [];

            section.slides.forEach(entry => {
                if (entry.comments.length > 0) {
                    entry.comments.forEach(comment => {
                        if (comment.chart && comment.screenshot) {
                            const align =
                                sectionSlides.length % 2 ? 'left' : 'right';
                            sectionSlides.push({
                                type: 'markdownmedia',
                                content: comment.comment,
                                screenshot: comment.screenshot,
                                screenshotHeight: comment.screenshot_height,
                                screenshotWidth: comment.screenshot_width,
                                transition: 'slide-in',
                                align: align
                            });
                            sectionSlides.push({
                                type: 'markdownmedia',
                                content: comment.comment,
                                chart: comment.chart,
                                transition: 'fade-in slide-out',
                                align: align
                            });
                        } else if (comment.chart) {
                            sectionSlides.push({
                                type: 'markdownmedia',
                                content: comment.comment,
                                chart: comment.chart
                            });
                        } else if (comment.screenshot) {
                            sectionSlides.push({
                                type: 'markdownmedia',
                                content: comment.comment,
                                screenshot: comment.screenshot,
                                screenshotHeight: comment.screenshot_height,
                                screenshotWidth: comment.screenshot_width
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

        this.setSlides(tempSlides);
    };

    getStudyDetails = async studyID => {
        const { response, error } = await safeRequest(
            axios.get(`studies/${studyID}/history/`, {
                headers: { user_id: this.store.core.userUuid }
            })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        return response.data;
    };

    getPublicStudyDetails = async studyID => {
        const { response, error } = await safeRequest(
            axios.get(`studies/public/${studyID}/history`)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        return response.data;
    };
}
