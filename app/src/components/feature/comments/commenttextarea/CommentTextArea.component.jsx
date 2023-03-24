import {
    Box,
    Button,
    Heading,
    HStack,
    IconButton,
    Kbd,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Popover,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Tooltip,
    Tr,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { CameraIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Chart, ChevronDown, ChevronUp, Close } from 'css.gg';
import { useKeyPress } from 'hooks/useKeyPress.hook';
import { observer } from 'mobx-react';
import { useCallback } from 'react';

import { useContext, useEffect, useRef, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function CommentTextArea(props) {
    const store = useContext(RootStoreContext);

    const [comment, setComment] = useState('');
    const { colorMode } = useColorMode();
    const commentField = useRef(null);

    const exitEditMode = useCallback(() => {
        store.comment.setEditMode(false);
        store.comment.setEditCommentId(null);
        store.comment.removeScreenshot();
        store.comment.removeChart();
        setComment('');
        commentField.current.blur();
    }, [store.comment]);

    useEffect(() => {
        if (store.core.showCommentModal && store.comment.editMode) {
            exitEditMode();
        } else if (store.comment.editMode) {
            setComment(store.comment.editedCommentContent);
            commentField.current.focus();
        }
    }, [
        exitEditMode,
        store.comment.editMode,
        store.comment.editedCommentContent,
        store.core.showCommentModal
    ]);

    const submitComment = () => {
        if (comment.trim() !== '') {
            if (store.comment.editMode) {
                store.comment.editComment(
                    comment.trim(),
                    store.comment.editCommentId
                );
                exitEditMode();
            } else {
                store.comment.addComment(comment.trim());
                setComment('');
            }
        }
    };

    const submitCommentKey = useKeyPress('enter', 'shift');

    useEffect(() => {
        if (
            submitCommentKey &&
            comment.trim() !== '' &&
            !store.comment.commentTrigger
        ) {
            store.track.trackEvent(
                'Comment Area - Textarea',
                'Key',
                JSON.stringify({
                    type: 'Enter + Shift',
                    value: `Submit comment: ${comment.trim()}`
                })
            );

            if (store.comment.editMode) {
                store.comment.editComment(
                    comment.trim(),
                    store.comment.editCommentId
                );
                store.comment.setEditMode(false);
                store.comment.setEditCommentId(null);
                setComment('');
                commentField.current.blur();
            } else {
                store.comment.addComment(comment.trim());
                setComment('');
            }
        }
    }, [
        comment,
        props,
        store.comment,
        store.history,
        store.track,
        submitCommentKey
    ]);

    const renderMarkdownCheatSheet = () => {
        const content = [
            {
                text: '# Heading XL',
                value: (
                    <Text fontWeight="bold" fontSize="x-large">
                        Heading XL
                    </Text>
                )
            },
            {
                text: '## Heading L',
                value: (
                    <Text fontWeight="bold" fontSize="large">
                        Heading L
                    </Text>
                )
            },
            {
                text: '### Heading M',
                value: (
                    <Text fontWeight="bold" fontSize="medium">
                        Heading M
                    </Text>
                )
            },
            {
                text: '1 ordered list',
                value: (
                    <ol
                        style={{
                            paddingLeft: '16px',
                            fontSize: 'small'
                        }}
                    >
                        <li>ordered list</li>
                    </ol>
                )
            },
            {
                text: '* unordered list',
                value: (
                    <ul
                        style={{
                            paddingLeft: '16px',
                            fontSize: 'small'
                        }}
                    >
                        <li>unordered list</li>
                    </ul>
                )
            },
            {
                text: '> quote',
                value: (
                    <blockquote
                        style={{
                            paddingLeft: '10px',
                            borderLeft: '2px solid #83c4f2',
                            fontSize: 'small'
                        }}
                    >
                        quote
                    </blockquote>
                )
            },
            {
                text: '`inline code`',
                value: (
                    <code
                        style={{
                            backgroundColor: '#00000077',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            display: 'inline',
                            fontSize: 'small'
                        }}
                    >
                        {' '}
                        inline code
                    </code>
                )
            },
            {
                text: '**bold**',
                value: (
                    <b
                        style={{
                            fontSize: 'small'
                        }}
                    >
                        bold
                    </b>
                )
            },
            {
                text: '*italic*',
                value: (
                    <i
                        style={{
                            fontSize: 'small'
                        }}
                    >
                        italic
                    </i>
                )
            },
            {
                text: '~strikethrough~',
                value: (
                    <s
                        style={{
                            fontSize: 'small'
                        }}
                    >
                        strikethrough
                    </s>
                )
            }
        ];

        return (
            <Table>
                <Tbody>
                    {content.map((entry, index) => (
                        <Tr key={`markdown_help_${index}`}>
                            <Td
                                padding="0"
                                borderBottom="none"
                                style={{
                                    paddingBottom: '14px'
                                }}
                            >
                                <Text fontSize="sm">{entry.text}</Text>
                            </Td>
                            <Td
                                padding="0"
                                paddingLeft="10px"
                                borderBottom="none"
                                style={{
                                    paddingBottom: '14px'
                                }}
                            >
                                {entry.value}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        );
    };

    const renderCommentFooter = () => (
        <HStack
            borderRadius="10px"
            width="100%"
            justifyContent="space-between"
            style={{ marginTop: store.comment.isCommentListVisible ? 10 : 0 }}
        >
            <Text fontWeight="bold" fontSize="xs" opacity="0.6">
                Tip: press <Kbd style={{ marginLeft: '10px' }}>shift</Kbd> +{' '}
                <Kbd style={{ marginRight: '10px' }}>C</Kbd> anywhere in the app
                to add a comment.
            </Text>
            <HStack spacing="1">
                <Box>
                    <Popover offset={[-200, 0]} closeOnBlur={true}>
                        <PopoverTrigger>
                            <Button
                                size="sm"
                                variant="ghost"
                                opacity="0.6"
                                onClick={() => {
                                    store.track.trackEvent(
                                        'Comment Area - Footer',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Markdown info'
                                        })
                                    );
                                }}
                            >
                                ?
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            backgroundColor="#0f1010"
                            borderRadius="10px"
                            padding="20px"
                        >
                            <PopoverHeader padding="14px" border="none">
                                <Heading size="sm">Markdown shortcuts</Heading>
                                <PopoverCloseButton
                                    style={{ top: '14px', right: '14px' }}
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Comment Area - Markdown Info',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Close'
                                            })
                                        );
                                    }}
                                />
                            </PopoverHeader>
                            <PopoverBody>
                                {renderMarkdownCheatSheet()}
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Box>
                <Tooltip
                    label={
                        store.comment.isCommentListVisible
                            ? 'Hide comments'
                            : 'Show comments'
                    }
                >
                    <IconButton
                        opacity="0.6"
                        size="sm"
                        variant="ghost"
                        color="white"
                        onClick={() => {
                            store.track.trackEvent(
                                'Comment Area - Footer',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: store.comment.isCommentListVisible
                                        ? 'Hide comments'
                                        : 'Show comments'
                                })
                            );

                            store.comment.setIsCommentListVisible(
                                !store.comment.isCommentListVisible
                            );
                        }}
                        icon={
                            store.comment.isCommentListVisible ? (
                                <ChevronDown style={{ '--ggs': '0.7' }} />
                            ) : (
                                <ChevronUp style={{ '--ggs': '0.7' }} />
                            )
                        }
                    />
                </Tooltip>
            </HStack>
        </HStack>
    );

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
                            'Comment Area - Textarea',
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
                        zIndex="2"
                        borderRadius="4px"
                        onKeyDown={e => {
                            if (
                                e.key === 'Enter' &&
                                (!store.core.isRightSidePanelOpen ||
                                    store.core.rightPanelType !== 'details')
                            ) {
                                store.core.setRightPanelTypeToOpen('details');
                            }

                            store.track.trackEvent(
                                'Comment Area - Textarea',
                                'Key',
                                JSON.stringify({
                                    type: 'Enter',
                                    value: 'Open chart attach menu'
                                })
                            );
                        }}
                        onClick={() => {
                            if (
                                !store.core.isRightSidePanelOpen ||
                                store.core.rightPanelType !== 'details'
                            ) {
                                store.core.setRightPanelTypeToOpen('details');
                            }

                            store.track.trackEvent(
                                'Comment Area - Textarea',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Open chart attach menu'
                                })
                            );
                        }}
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
    return (
        <VStack
            width="100%"
            style={{ marginTop: store.comment.isCommentListVisible ? 10 : 0 }}
        >
            {store.comment.isCommentListVisible && (
                <Box
                    backgroundColor="transparent"
                    borderRadius="8px"
                    width="100%"
                    position="relative"
                    padding="2px"
                >
                    <Textarea
                        width="100%"
                        height="100%"
                        ref={commentField}
                        borderRadius="8px"
                        padding="10px"
                        paddingRight={
                            store.comment.editMode ? '170px' : '136px'
                        }
                        border="none"
                        resize="none"
                        placeholder="Enter your observations here ..."
                        fontSize="sm"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        value={comment}
                        onFocus={() => store.comment.setCommentTrigger(false)}
                        onBlur={() => store.comment.setCommentTrigger(true)}
                        onChange={e => setComment(e.target.value)}
                    />
                    <HStack position="absolute" right="12px" bottom="12px">
                        {store.comment.editMode && (
                            <Tooltip label="Exit edit mode">
                                <IconButton
                                    size="sm"
                                    zIndex="2"
                                    opacity={1}
                                    borderRadius="4px"
                                    transition="0.2s all ease-in-out"
                                    icon={<Close style={{ '--ggs': '0.7' }} />}
                                    _hover={{ backgroundColor: 'blue.500' }}
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Comment Area - Textarea',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Exit edit mode'
                                            })
                                        );

                                        exitEditMode();
                                    }}
                                />
                            </Tooltip>
                        )}
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
                                                'Comment Area - Textarea',
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
                            {store.comment.screenshot &&
                                store.comment.screenshot.image && (
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
                                                    'Comment Area - Textarea',
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
                                            'Comment Area - Textarea',
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
                        <Tooltip
                            label={
                                store.comment.editMode
                                    ? 'Save edits'
                                    : 'Comment'
                            }
                        >
                            <IconButton
                                size="sm"
                                zIndex="2"
                                borderRadius="4px"
                                transition="0.2s all ease-in-out"
                                backgroundColor="blue.500"
                                color={'white'}
                                _hover={{
                                    backgroundColor:
                                        comment.trim() !== '' && 'blue.500',
                                    cursor:
                                        comment.trim() === ''
                                            ? 'default'
                                            : 'pointer'
                                }}
                                icon={
                                    store.comment.editMode ? (
                                        <PencilSquareIcon
                                            width="12px"
                                            style={{
                                                display: 'inline'
                                            }}
                                        />
                                    ) : (
                                        <PaperAirplaneIcon
                                            width="12px"
                                            style={{
                                                display: 'inline'
                                            }}
                                        />
                                    )
                                }
                                onClick={() => {
                                    store.track.trackEvent(
                                        'Comment Area - Textarea',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: `Submit comment: ${comment.trim()}`
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
                </Box>
            )}

            {renderCommentFooter()}
        </VStack>
    );
}

export default observer(CommentTextArea);
