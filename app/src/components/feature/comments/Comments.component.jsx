import {
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Kbd,
    Text,
    Textarea,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close, Comment } from 'css.gg';
import { useKeyPress } from 'hooks/useKeyPress.hook';
import { observer } from 'mobx-react';

import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RootStoreContext } from 'stores/RootStore';
import { PencilIcon } from '@heroicons/react/20/solid';
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
                                    paddingRight="69px"
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
                                    />

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
                            paddingRight={editMode ? '130px' : '110px'}
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
                    <Tooltip
                        label={
                            props.commentsVisible
                                ? 'Hide comments'
                                : 'Show comments'
                        }
                    >
                        <IconButton
                            opacity={props.commentsVisible ? 1 : 0.6}
                            size="sm"
                            variant="ghost"
                            color={props.commentsVisible ? 'blue.400' : 'white'}
                            onClick={() =>
                                props.setCommentsVisible(!props.commentsVisible)
                            }
                            icon={<Comment style={{ '--ggs': '0.7' }} />}
                        />
                    </Tooltip>
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
