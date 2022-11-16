import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Kbd,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Table,
    Tbody,
    Text,
    Textarea,
    Tooltip,
    VStack,
    Tr,
    Td,
    PopoverCloseButton
} from '@chakra-ui/react';
import { ChevronDown, ChevronUp, Close, Comment } from 'css.gg';
import { useKeyPress } from 'hooks/useKeyPress.hook';
import { observer } from 'mobx-react';

import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RootStoreContext } from 'stores/RootStore';
import { PencilIcon } from '@heroicons/react/20/solid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Comment.scss';

function CommentsComponent(props) {
    const store = useContext(RootStoreContext);

    const [comment, setComment] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editCommentIndex, setEditCommentIndex] = useState(null);
    const commentField = useRef(null);

    const submitComment = () => {
        if (editMode) {
            if (comment.trim() !== '') {
                store.history.editComment(comment.trim(), editCommentIndex);
                exitEditMode();
            }
        } else {
            if (comment.trim() !== '') {
                store.history.addComment(comment.trim());
                setComment('');
            }
        }
    };

    const deleteComment = index => {
        store.history.deleteCommnet(index);
    };

    const editComment = index => {
        setEditMode(true);
        setEditCommentIndex(index);
        setComment(
            store.core.studyHistory[store.core.studyHistoryItemIndex].comments[
                index
            ].comment
        );

        commentField.current.focus();
    };

    const exitEditMode = () => {
        setEditMode(false);
        setEditCommentIndex(null);
        setComment('');
        commentField.current.blur();
    };

    const submitCommentKey = useKeyPress('enter', 'shift');

    useEffect(() => {
        if (
            submitCommentKey &&
            comment.trim() !== '' &&
            !store.history.commentTrigger
        ) {
            if (editMode) {
                store.history.editComment(comment.trim(), editCommentIndex);
                setEditMode(false);
                setEditCommentIndex(null);
                setComment('');
                commentField.current.blur();
            } else {
                store.history.addComment(comment.trim());
                setComment('');
            }
        }
    }, [comment, editCommentIndex, editMode, store.history, submitCommentKey]);

    return (
        <VStack
            width="100%"
            spacing="40px"
            padding="14px"
            backgroundColor="whiteAlpha.100"
            borderRadius="10px"
            style={{ justifyContent: 'space-between' }}
        >
            {props.commentsVisible && (
                <VStack
                    heigh="auto"
                    width="100%"
                    overflowY={editMode ? 'hidden' : 'scroll'}
                    borderRadius="6px"
                >
                    {store.core.studyHistory.length > 0 &&
                        store.core.studyHistory[
                            store.core.studyHistoryItemIndex
                        ].comments.map((comment, index) => {
                            return (
                                <Box
                                    backgroundColor={
                                        index === editCommentIndex
                                            ? 'blue.400'
                                            : 'whiteAlpha.200'
                                    }
                                    opacity={
                                        !editMode
                                            ? 1
                                            : index === editCommentIndex
                                            ? 1
                                            : 0.3
                                    }
                                    borderRadius="8px"
                                    padding="20px"
                                    paddingRight="79px"
                                    width="100%"
                                    key={`history_comment_${index}`}
                                    position="relative"
                                    _last={{
                                        marginBottom: '10px'
                                    }}
                                    role="group"
                                >
                                    <ReactMarkdown
                                        className="comment"
                                        children={comment.comment}
                                        remarkPlugins={[remarkGfm]}
                                        disallowedElements={['img', 'a']}
                                        style={{ width: '100%' }}
                                        components={{
                                            code({
                                                node,
                                                inline,
                                                className,
                                                children,
                                                ...props
                                            }) {
                                                const match =
                                                    /language-(\w+)/.exec(
                                                        className || ''
                                                    );

                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        children={String(
                                                            children
                                                        ).replace(/\n$/, '')}
                                                        style={materialDark}
                                                        language={match[1]}
                                                        showLineNumbers={true}
                                                        PreTag="div"
                                                        useInlineStyles={true}
                                                        customStyle={{
                                                            background:
                                                                'transparent',
                                                            padding: 0,
                                                            borderRadius: '6px',
                                                            overflow: 'scroll'
                                                        }}
                                                        codeTagProps={{
                                                            style: {
                                                                background:
                                                                    '#00000077',
                                                                borderRadius:
                                                                    '6px'
                                                            }
                                                        }}
                                                        {...props}
                                                    />
                                                ) : (
                                                    <code
                                                        className={className}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    />

                                    <Text
                                        fontSize="11px"
                                        opacity="0.5"
                                        marginTop="6px"
                                    >
                                        {comment.time}
                                    </Text>

                                    <Flex
                                        display={editMode ? 'none' : 'initial'}
                                        height="100%"
                                        width="69px"
                                        position="absolute"
                                        right="10px"
                                        top="0"
                                        paddingTop="18px"
                                        alignItems="start"
                                    >
                                        <Tooltip label="Edit comment">
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                marginRight="5px"
                                                onClick={() =>
                                                    editComment(index)
                                                }
                                                icon={
                                                    <PencilIcon
                                                        style={{
                                                            width: '16px',
                                                            height: '16px'
                                                        }}
                                                    />
                                                }
                                                opacity="0"
                                                transition="0.2s all ease-in-out"
                                                _groupHover={{ opacity: '1' }}
                                            />
                                        </Tooltip>
                                        <Tooltip label="Delete comment">
                                            <IconButton
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    deleteComment(index)
                                                }
                                                icon={
                                                    <Close
                                                        style={{ '--ggs': 0.8 }}
                                                    />
                                                }
                                                opacity="0"
                                                transition="0.2s all ease-in-out"
                                                _groupHover={{ opacity: '1' }}
                                            />
                                        </Tooltip>
                                    </Flex>
                                </Box>
                            );
                        })}
                </VStack>
            )}
            <VStack
                width="100%"
                style={{ marginTop: props.commentsVisible ? 10 : 0 }}
            >
                {props.commentsVisible && (
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
                            paddingRight={editMode ? '150px' : '110px'}
                            border="none"
                            resize="none"
                            placeholder="Enter your observations here ..."
                            fontSize="sm"
                            backgroundColor="whiteAlpha.100"
                            value={comment}
                            onFocus={() =>
                                store.history.setCommentTrigger(false)
                            }
                            onBlur={() => store.history.setCommentTrigger(true)}
                            onChange={e => setComment(e.target.value)}
                        />
                        {editMode && (
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
                                    onClick={exitEditMode}
                                />
                            </Tooltip>
                        )}
                        <Button
                            size="sm"
                            position="absolute"
                            right="12px"
                            bottom="12px"
                            background="blue.400"
                            zIndex="2"
                            borderRadius="4px"
                            transition="0.2s all ease-in-out"
                            _hover={{ background: 'blue.500' }}
                            onClick={submitComment}
                            disabled={comment.trim() === ''}
                            _disabled={{ backgroundColor: 'gray' }}
                        >
                            {editMode ? 'Save edits' : 'Comment'}
                        </Button>
                    </Box>
                )}

                <HStack
                    borderRadius="10px"
                    width="100%"
                    justifyContent="space-between"
                    style={{ marginTop: props.commentsVisible ? 10 : 0 }}
                >
                    <Text fontWeight="bold" fontSize="xs" opacity="0.6">
                        Tip: press{' '}
                        <Kbd style={{ marginLeft: '10px' }}>shift</Kbd> +{' '}
                        <Kbd style={{ marginRight: '10px' }}>C</Kbd> anywhere in
                        the app to add a comment.
                    </Text>
                    <HStack spacing="1">
                        <Popover offset={[-200, 0]} closeOnBlur={true}>
                            <PopoverTrigger>
                                <Button size="sm" variant="ghost" opacity="0.6">
                                    ?
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                backgroundColor="#0f1010"
                                borderRadius="10px"
                                padding="20px"
                            >
                                <PopoverHeader padding="14px" border="none">
                                    <Heading size="sm">
                                        Markdown shortcuts
                                    </Heading>
                                    <PopoverCloseButton
                                        style={{ top: '14px', right: '14px' }}
                                    />
                                </PopoverHeader>
                                <PopoverBody>
                                    <Table>
                                        <Tbody>
                                            {[
                                                {
                                                    text: '# Heading XL',
                                                    value: (
                                                        <Text
                                                            fontWeight="bold"
                                                            fontSize="x-large"
                                                        >
                                                            Heading XL
                                                        </Text>
                                                    )
                                                },
                                                {
                                                    text: '## Heading L',
                                                    value: (
                                                        <Text
                                                            fontWeight="bold"
                                                            fontSize="large"
                                                        >
                                                            Heading L
                                                        </Text>
                                                    )
                                                },
                                                {
                                                    text: '### Heading M',
                                                    value: (
                                                        <Text
                                                            fontWeight="bold"
                                                            fontSize="medium"
                                                        >
                                                            Heading M
                                                        </Text>
                                                    )
                                                },
                                                {
                                                    text: '1 ordered list',
                                                    value: (
                                                        <ol
                                                            style={{
                                                                paddingLeft:
                                                                    '16px',
                                                                fontSize:
                                                                    'small'
                                                            }}
                                                        >
                                                            <li>
                                                                ordered list
                                                            </li>
                                                        </ol>
                                                    )
                                                },
                                                {
                                                    text: '* unordered list',
                                                    value: (
                                                        <ul
                                                            style={{
                                                                paddingLeft:
                                                                    '16px',
                                                                fontSize:
                                                                    'small'
                                                            }}
                                                        >
                                                            <li>
                                                                unordered list
                                                            </li>
                                                        </ul>
                                                    )
                                                },
                                                {
                                                    text: '> quote',
                                                    value: (
                                                        <blockquote
                                                            style={{
                                                                paddingLeft:
                                                                    '10px',
                                                                borderLeft:
                                                                    '2px solid #83c4f2',
                                                                fontSize:
                                                                    'small'
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
                                                                backgroundColor:
                                                                    '#00000077',
                                                                padding:
                                                                    '4px 6px',
                                                                borderRadius:
                                                                    '4px',
                                                                display:
                                                                    'inline',
                                                                fontSize:
                                                                    'small'
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
                                                                fontSize:
                                                                    'small'
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
                                                                fontSize:
                                                                    'small'
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
                                                                fontSize:
                                                                    'small'
                                                            }}
                                                        >
                                                            strikethrough
                                                        </s>
                                                    )
                                                }
                                            ].map((entry, index) => (
                                                <Tr
                                                    key={`markdown_help_${index}`}
                                                >
                                                    <Td
                                                        padding="0"
                                                        borderBottom="none"
                                                        style={{
                                                            paddingBottom:
                                                                '14px'
                                                        }}
                                                    >
                                                        <Text fontSize="sm">
                                                            {entry.text}
                                                        </Text>
                                                    </Td>
                                                    <Td
                                                        padding="0"
                                                        paddingLeft="10px"
                                                        borderBottom="none"
                                                        style={{
                                                            paddingBottom:
                                                                '14px'
                                                        }}
                                                    >
                                                        {entry.value}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                        <Tooltip
                            label={
                                props.commentsVisible
                                    ? 'Hide comments'
                                    : 'Show comments'
                            }
                        >
                            <IconButton
                                opacity="0.6"
                                size="sm"
                                variant="ghost"
                                color="white"
                                onClick={() =>
                                    props.setCommentsVisible(
                                        !props.commentsVisible
                                    )
                                }
                                icon={
                                    props.commentsVisible ? (
                                        <ChevronDown
                                            style={{ '--ggs': '0.7' }}
                                        />
                                    ) : (
                                        <ChevronUp style={{ '--ggs': '0.7' }} />
                                    )
                                }
                            />
                        </Tooltip>
                    </HStack>
                </HStack>
            </VStack>
        </VStack>
    );
}

CommentsComponent.propTypes = {
    commentsVisible: PropTypes.bool,
    setCommentsVisible: PropTypes.func
};

export default observer(CommentsComponent);
