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
import { observer } from 'mobx-react';

import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RootStoreContext } from 'stores/RootStore';
import './Comment.scss';

function CommentsComponent(props) {
    const store = useContext(RootStoreContext);

    const [comment, setComment] = useState('');

    const submitComment = () => {
        if (comment !== '') {
            store.history.addComment(comment);
            setComment('');
        }
    };

    const deleteComment = index => {
        store.history.deleteCommnet(index);
    };

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
                    overflowY="scroll"
                    borderRadius="6px"
                >
                    {store.core.studyHistory.length > 0 &&
                        store.core.studyHistory[
                            store.core.studyHistoryItemIndex
                        ].comments.map((comment, index) => {
                            return (
                                <Box
                                    backgroundColor="whiteAlpha.200"
                                    borderRadius="8px"
                                    padding="20px"
                                    paddingRight="50px"
                                    width="100%"
                                    key={`history_comment_${index}`}
                                    position="relative"
                                    _last={{ marginBottom: '10px' }}
                                >
                                    <ReactMarkdown
                                        className="comment"
                                        children={comment.comment}
                                        remarkPlugins={[remarkGfm]}
                                        disallowedElements={['img']}
                                    />

                                    <Flex
                                        height="100%"
                                        width="24px"
                                        position="absolute"
                                        right="10px"
                                        top="0"
                                        alignItems="center"
                                    >
                                        <Tooltip label="Delete comment">
                                            <IconButton
                                                size="xs"
                                                variant="ghost"
                                                onClick={() =>
                                                    deleteComment(index)
                                                }
                                                icon={
                                                    <Close
                                                        style={{ '--ggs': 0.6 }}
                                                    />
                                                }
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
                            borderRadius="8px"
                            padding="10px"
                            border="none"
                            resize="none"
                            placeholder="Enter your observations here ..."
                            fontSize="sm"
                            backgroundColor="whiteAlpha.100"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <Button
                            size="xs"
                            position="absolute"
                            right="12px"
                            bottom="12px"
                            background="blue.400"
                            zIndex="2"
                            opacity="0.7"
                            borderRadius="4px"
                            transition="0.2s all ease-in-out"
                            _hover={{ opacity: 1 }}
                            onClick={submitComment}
                        >
                            Comment
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
