import {
    Box,
    Button,
    Checkbox,
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

import { useEffect } from 'react';
import { useContext, useRef, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function CommentTextArea(props) {
    const store = useContext(RootStoreContext);

    const [comment, setComment] = useState('');
    const { colorMode } = useColorMode();
    const commentField = useRef(null);

    useEffect(() => {
        if (store.comment.editMode) {
            setComment(store.comment.editedCommentContent);
            commentField.current.focus();
        }
    }, [store.comment.editMode, store.comment.editedCommentContent]);

    const exitEditMode = () => {
        store.comment.setEditMode(false);
        store.comment.setEditCommentIndex(null);
        setComment('');
        commentField.current.blur();
    };

    const submitComment = () => {
        if (comment.trim() !== '') {
            if (store.comment.editMode) {
                store.comment.editComment(
                    comment.trim(),
                    store.comment.editCommentIndex
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
                    store.comment.editCommentIndex
                );
                store.comment.setEditMode(false);
                store.comment.setEditCommentIndex(null);
                setComment('');
                commentField.current.blur();
            } else {
                store.comment.addComment(comment.trim());
                setComment('');
            }
        }
    }, [comment, props, store.comment, store.history, submitCommentKey]);

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

    const renderAvailableCharts = () => {
        const acceptedCharts = [
            'bar',
            'vertical bar',
            'grouped bar',
            'line',
            'doughnut'
        ];

        return store.stats
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
                    }}
                    _hover={{ textDecoration: 'none', opacity: 1 }}
                >
                    {chart.title}
                </MenuItem>
            ));
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
                            store.comment.editMode ? '150px' : '110px'
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
                    {store.comment.editMode && (
                        <Tooltip label="Exit edit mode">
                            <IconButton
                                size="sm"
                                position="absolute"
                                bottom="12px"
                                right="114px"
                                zIndex="2"
                                opacity="1"
                                transition="0.2s all ease-in-out"
                                icon={<Close style={{ '--ggs': '0.7' }} />}
                                _hover={{ opacity: 0.8 }}
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
                    <Menu size="sm" isLazy={true} placement="top-start">
                        <Tooltip
                            label={
                                store.comment.screenshot
                                    ? 'Remove chart from comment.'
                                    : 'Attach chart to comment.'
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
                                size="sm"
                                position="absolute"
                                right="90px"
                                bottom="12px"
                                opacity="0.5"
                                zIndex="2"
                                borderRadius="4px"
                                transition="0.2s all ease-in-out"
                                backgroundColor={
                                    store.comment.screenshot
                                        ? 'blue.500'
                                        : 'auto'
                                }
                                color="white"
                                _hover={{
                                    opacity: 1
                                }}
                            />
                        </Tooltip>
                        <MenuList
                            backgroundColor="black"
                            padding="5px"
                            borderRadius="10px"
                            zIndex="21"
                        >
                            {renderAvailableCharts()}
                        </MenuList>
                    </Menu>

                    <Tooltip
                        label={
                            store.comment.screenshot
                                ? 'Remove screenshot from comment.'
                                : 'Attach screenshot of current graph view to comment.'
                        }
                    >
                        <IconButton
                            size="sm"
                            position="absolute"
                            right="50px"
                            bottom="12px"
                            opacity="0.5"
                            zIndex="2"
                            borderRadius="4px"
                            transition="0.2s all ease-in-out"
                            onClick={() => {
                                if (store.comment.screenshot) {
                                    store.comment.removeScreenshot();
                                } else {
                                    store.comment.attachScreenshot(
                                        window.innerWidth,
                                        window.innerHeight
                                    );
                                }
                            }}
                            backgroundColor={
                                store.comment.screenshot ? 'blue.500' : 'auto'
                            }
                            color="white"
                            _hover={{
                                opacity: 1
                            }}
                            icon={
                                <CameraIcon
                                    width="12px"
                                    style={{
                                        display: 'inline'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                    <Tooltip
                        label={
                            store.comment.editMode ? 'Save edits' : 'Comment'
                        }
                    >
                        <IconButton
                            size="sm"
                            position="absolute"
                            right="12px"
                            bottom="12px"
                            backgroundColor="blue.400"
                            zIndex="2"
                            borderRadius="4px"
                            transition="0.2s all ease-in-out"
                            color={'white'}
                            _hover={{ backgroundColor: 'blue.500' }}
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
                                backgroundColor:
                                    colorMode === 'light'
                                        ? 'blackAlpha.400'
                                        : 'gray',
                                cursor: 'not-allowed',
                                opacity: 0.3
                            }}
                        />
                    </Tooltip>
                </Box>
            )}

            {renderCommentFooter()}
        </VStack>
    );
}

export default observer(CommentTextArea);
