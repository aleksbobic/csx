import {
    Box,
    Button,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Textarea,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { CameraIcon, PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { Chart, Close } from 'css.gg';
import { useKeyPress } from 'hooks/useKeyPress.hook';
import { observer } from 'mobx-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function CommentModal() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    const [comment, setComment] = useState('');

    const openCommentModalKey = useKeyPress('c', 'shift');
    const closeCommentModalKey = useKeyPress('escape');
    const submitCommentModalKey = useKeyPress('enter', 'shift');

    useEffect(() => {
        if (
            openCommentModalKey &&
            !store.core.showCommentModal &&
            store.comment.commentTrigger
        ) {
            store.track.trackEvent(
                'Graph Area - Comment Modal',
                'Key',
                JSON.stringify({
                    type: 'C + Shift',
                    value: 'Open comment modal'
                })
            );

            store.core.setShowCommentModal(true);
        }

        if (closeCommentModalKey && store.core.showCommentModal) {
            store.track.trackEvent(
                'Graph Area - Comment Modal',
                'Key',
                JSON.stringify({
                    type: 'Esc',
                    value: 'Close comment modal'
                })
            );
            setComment('');
            store.core.setShowCommentModal(false);
        }
    }, [
        closeCommentModalKey,
        openCommentModalKey,
        store.comment,
        store.comment.commentTrigger,
        store.core,
        store.track,
        submitCommentModalKey
    ]);

    const closeCommentModal = useCallback(() => {
        setComment('');
        store.core.setShowCommentModal(false);
    }, [store.core]);

    useEffect(() => {
        if (
            submitCommentModalKey &&
            comment !== '' &&
            store.comment.commentTrigger
        ) {
            store.track.trackEvent(
                'Graph Area - Comment Modal',
                'Key',
                JSON.stringify({
                    type: 'Enter + Shift',
                    value: `Submit comment: ${comment}`
                })
            );

            store.comment.addComment(comment);
            closeCommentModal();
        }
    }, [
        closeCommentModal,
        comment,
        store.comment,
        store.comment.commentTrigger,
        store.history,
        store.track,
        submitCommentModalKey
    ]);

    const submitComment = () => {
        if (comment !== '') {
            store.comment.addComment(comment);
            setComment('');
            closeCommentModal();
        }
    };

    const renderAvailableChartsMenu = () => {
        const acceptedCharts = [
            'bar',
            'vertical bar',
            'grouped bar',
            'line',
            'doughnut',
            'radar'
        ];

        const chartItems = store.stats
            .getChartListForDataset()
            .filter(
                chart =>
                    chart.network === store.core.currentGraph &&
                    acceptedCharts.includes(chart.type.toLowerCase())
            )
            .map(chart => {
                return {
                    title: chart.title ? chart.title : chart.type,
                    id: chart.id
                };
            })
            .map(chart => (
                <MenuItem
                    fontSize="xs"
                    as={Button}
                    opacity="0.6"
                    borderRadius="6px"
                    transition="0.2s all ease-in-out"
                    key={`available_chart_${chart.id}`}
                    onClick={() => {
                        store.comment.setChartToAttach(chart.id);

                        store.track.trackEvent(
                            'Graph Area - Comment Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Attach chart ${chart.id}`
                            })
                        );
                    }}
                    _hover={{ textDecoration: 'none', opacity: 1 }}
                >
                    {chart.title}
                </MenuItem>
            ));

        if (chartItems.length === 0) {
            return (
                <IconButton
                    icon={
                        <Chart
                            style={{
                                '--ggs': 0.7,
                                marginLeft: '5px',
                                marginBottom: '5px'
                            }}
                        />
                    }
                    isDisabled={true}
                    size="sm"
                    opacity={1}
                    zIndex="2"
                    borderRadius="4px"
                    transition="0.2s all ease-in-out"
                    backgroundColor={store.comment.chart ? 'blue.500' : 'auto'}
                    color="white"
                    _hover={{
                        opacity: 0.5,
                        cursor: 'default'
                    }}
                    _disabled={{
                        opacity: 0.5,
                        cursor: 'default'
                    }}
                    _active={{
                        opacity: 0.5
                    }}
                />
            );
        }
        return (
            <Menu size="sm" isLazy={true} placement="top-start">
                <Tooltip
                    label={
                        store.comment.chart ? '' : 'Attach chart to comment.'
                    }
                >
                    <MenuButton
                        as={IconButton}
                        icon={
                            <Chart
                                style={{
                                    '--ggs': 0.7,
                                    marginLeft: '5px',
                                    marginBottom: '5px'
                                }}
                            />
                        }
                        isDisabled={store.comment.chart}
                        size="sm"
                        opacity={1}
                        onClick={() => {
                            if (
                                !store.core.isRightSidePanelOpen ||
                                store.core.rightPanelType !== 'details'
                            ) {
                                store.core.setRightPanelTypeToOpen('details');
                            }

                            store.track.trackEvent(
                                'Comment Area - Comment Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Open chart attach menu'
                                })
                            );
                        }}
                        zIndex="2"
                        borderRadius="4px"
                        transition="0.2s all ease-in-out"
                        backgroundColor={
                            store.comment.chart ? 'blue.500' : 'auto'
                        }
                        color="white"
                        _hover={{
                            opacity: 1,
                            cursor: store.comment.chart ? 'default' : 'pointer',
                            backgroundColor: 'blue.500'
                        }}
                        _disabled={{
                            opacity: 1,
                            cursor: 'default'
                        }}
                        _active={{
                            opacity: store.comment.chart ? 1 : 0.5
                        }}
                    />
                </Tooltip>

                <MenuList
                    backgroundColor="black"
                    padding="5px"
                    borderRadius="10px"
                    zIndex="21"
                >
                    {chartItems}
                </MenuList>
            </Menu>
        );
    };

    const renderIconButtons = () => (
        <HStack position="absolute" right="16px" bottom="16px">
            <Box width="32px" height="32px" position="relative">
                {store.comment.chart && (
                    <Tooltip label="Remove chart from comment.">
                        <IconButton
                            borderRadius="full"
                            size="xs"
                            backgroundColor="white"
                            color="black"
                            width="16px"
                            height="16px"
                            padding="0"
                            minHeight="16px"
                            minWidth="16px"
                            zIndex="5"
                            position="absolute"
                            top="-8px"
                            left="-8px"
                            _hover={{
                                opacity: 1
                            }}
                            onClick={() => {
                                store.comment.removeChart();
                                store.track.trackEvent(
                                    'Graph Area - Comment Modal',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Remove chart'
                                    })
                                );
                            }}
                            icon={
                                <Close
                                    style={{
                                        '--ggs': 0.5,
                                        marginLeft: '-2px'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                )}

                {renderAvailableChartsMenu()}
            </Box>
            <Box width="32px" height="32px" position="relative">
                {store.comment.screenshot && store.comment.screenshot.image && (
                    <Tooltip label="Remove screenshot from comment.">
                        <IconButton
                            borderRadius="full"
                            size="xs"
                            backgroundColor="white"
                            color="black"
                            width="16px"
                            height="16px"
                            padding="0"
                            minHeight="16px"
                            minWidth="16px"
                            zIndex="5"
                            position="absolute"
                            top="-8px"
                            left="-8px"
                            _hover={{
                                opacity: 1
                            }}
                            onClick={() => {
                                store.comment.removeScreenshot();
                                store.track.trackEvent(
                                    'Graph Area - Comment Modal',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Remove graph screenshot'
                                    })
                                );
                            }}
                            icon={
                                <Close
                                    style={{
                                        '--ggs': 0.5,
                                        marginLeft: '-2px'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                )}
                <Tooltip
                    label={
                        store.comment.screenshot &&
                        store.comment.screenshot.image
                            ? ''
                            : 'Attach screenshot of current graph view to comment.'
                    }
                >
                    <IconButton
                        size="sm"
                        opacity={1}
                        zIndex="2"
                        borderRadius="4px"
                        transition="0.2s all ease-in-out"
                        isDisabled={
                            store.comment.screenshot &&
                            store.comment.screenshot.image
                        }
                        onClick={() => {
                            store.comment.attachScreenshot(
                                window.innerWidth,
                                window.innerHeight
                            );

                            store.track.trackEvent(
                                'Graph Area - Comment Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Attach graph screenshot'
                                })
                            );
                        }}
                        backgroundColor={
                            store.comment.screenshot &&
                            store.comment.screenshot.image
                                ? 'blue.500'
                                : 'auto'
                        }
                        color="white"
                        icon={
                            <CameraIcon
                                width="12px"
                                style={{
                                    display: 'inline'
                                }}
                            />
                        }
                        _hover={{
                            opacity: 1,
                            cursor:
                                store.comment.screenshot &&
                                store.comment.screenshot.image
                                    ? 'default'
                                    : 'pointer',
                            backgroundColor: 'blue.500'
                        }}
                        _disabled={{
                            opacity: 1,
                            cursor: 'default'
                        }}
                        _active={{
                            opacity:
                                store.comment.screenshot &&
                                store.comment.screenshot.image
                                    ? 1
                                    : 0.5
                        }}
                    />
                </Tooltip>
            </Box>

            <Tooltip label="Comment">
                <IconButton
                    size="sm"
                    zIndex="2"
                    borderRadius="4px"
                    transition="0.2s all ease-in-out"
                    backgroundColor="blue.500"
                    color={'white'}
                    _hover={{
                        backgroundColor: comment.trim() !== '' && 'blue.500',
                        cursor: comment.trim() === '' ? 'default' : 'pointer'
                    }}
                    icon={
                        <PaperAirplaneIcon
                            width="12px"
                            style={{
                                display: 'inline'
                            }}
                        />
                    }
                    onClick={() => {
                        store.track.trackEvent(
                            'Graph Area - Comment Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Submit comment: ${comment}`
                            })
                        );
                        submitComment();
                    }}
                    isDisabled={comment.trim() === ''}
                    _disabled={{
                        cursor: 'default',
                        opacity: 0.5
                    }}
                />
            </Tooltip>
        </HStack>
    );

    return store.core.showCommentModal ? (
        <Box
            width="500px"
            height="120px"
            position="fixed"
            bottom="80px"
            left="50%"
            transform="translate(-50%, 0)"
            zIndex="20"
            backgroundColor={
                colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'
            }
            borderRadius="12px"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'blackAlpha.400' : 'gray.900'}
        >
            <Textarea
                width="100%"
                height="100%"
                borderRadius="12px"
                padding="20px"
                paddingRight="136px"
                border="none"
                resize="none"
                placeholder="Enter your observations here ..."
                fontSize="sm"
                autoFocus={true}
                value={comment}
                onChange={e => setComment(e.target.value)}
            />

            {renderIconButtons()}
            <IconButton
                size="xs"
                icon={<Close style={{ '--ggs': 0.7 }} />}
                position="absolute"
                right="12px"
                top="12px"
                variant="ghost"
                zIndex="2"
                onClick={() => {
                    store.track.trackEvent(
                        'Graph Area - Comment Modal',
                        'Button',
                        JSON.stringify({
                            type: 'Click',
                            value: 'Close comment modal'
                        })
                    );
                    closeCommentModal();
                }}
            />
        </Box>
    ) : (
        <></>
    );
}

export default observer(CommentModal);
