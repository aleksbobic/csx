import {
    Box,
    Flex,
    HStack,
    IconButton,
    Text,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { Chart, Close } from 'css.gg';
import { observer } from 'mobx-react';

import { PencilIcon, PhotoIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { RootStoreContext } from 'stores/RootStore';
import './Comment.scss';

function CommentComponent(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    const editComment = index => {
        store.comment.setEditMode(true);
        store.comment.setEditCommentIndex(index);

        store.comment.setEditedCommentContent({
            screenshot:
                store.core.studyHistory[store.core.studyHistoryItemIndex]
                    .comments[index].screenshot,
            chart: store.core.studyHistory[store.core.studyHistoryItemIndex]
                .comments[index].chart,
            comment:
                store.core.studyHistory[store.core.studyHistoryItemIndex]
                    .comments[index].comment,
            screenshot_width:
                store.core.studyHistory[store.core.studyHistoryItemIndex]
                    .comments[index].screenshot_width,
            screenshot_height:
                store.core.studyHistory[store.core.studyHistoryItemIndex]
                    .comments[index].screenshot_height,
            screenshot_x_offset:
                store.core.studyHistory[store.core.studyHistoryItemIndex]
                    .comments[index].screenshot_x_offset
        });
    };

    const renderMarkdownContent = () => (
        <ReactMarkdown
            className="comment"
            children={props.comment.comment}
            remarkPlugins={[remarkGfm]}
            disallowedElements={['img', 'a']}
            style={{ width: '100%' }}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');

                    return !inline && match ? (
                        <SyntaxHighlighter
                            children={String(children).replace(/\n$/, '')}
                            style={oneDark}
                            language={match[1]}
                            showLineNumbers={true}
                            PreTag="div"
                            className={classNames('code-container', {
                                light: colorMode === 'light',
                                dark: colorMode === 'dark'
                            })}
                            useInlineStyles={true}
                            customStyle={{
                                background: 'transparent',
                                padding: 0,
                                borderRadius: '6px',
                                overflow: 'scroll'
                            }}
                            codeTagProps={{
                                style: {
                                    background:
                                        colorMode === 'light'
                                            ? 'blackAlpha.200'
                                            : '#00000077',
                                    borderRadius: '6px',
                                    display: 'block'
                                }
                            }}
                            {...props}
                        />
                    ) : (
                        <code
                            className={colorMode === 'light' ? 'light' : 'dark'}
                            {...props}
                        >
                            {children}
                        </code>
                    );
                }
            }}
        />
    );

    const renderCommentButtons = () => (
        <Flex
            display={store.comment.editMode ? 'none' : 'initial'}
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
                    backgroundColor={colorMode === 'light' && 'blackAlpha.200'}
                    onClick={() => {
                        store.track.trackEvent(
                            'Comment Area - Comment List',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Edit ${props.commentIndex}`
                            })
                        );

                        editComment(props.commentIndex);
                    }}
                    icon={
                        <PencilIcon
                            style={{
                                width: '16px',
                                height: '16px',
                                opacity: colorMode === 'light' && 0.5
                            }}
                        />
                    }
                    opacity="0"
                    transition="0.2s all ease-in-out"
                    _groupHover={{
                        opacity: '1',
                        backgroundColor:
                            colorMode === 'light' && 'blackAlpha.200'
                    }}
                />
            </Tooltip>
            <Tooltip label="Delete comment">
                <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                        store.track.trackEvent(
                            'Comment Area - Comment List',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Delete ${props.commentIndex}`
                            })
                        );

                        store.comment.deleteCommnet(props.commentIndex);
                    }}
                    backgroundColor={colorMode === 'light' && 'blackAlpha.200'}
                    icon={
                        <Close
                            style={{
                                '--ggs': 0.8,
                                opacity: colorMode === 'light' && 0.5
                            }}
                        />
                    }
                    opacity="0"
                    transition="0.2s all ease-in-out"
                    _groupHover={{
                        opacity: '1',
                        backgroundColor:
                            colorMode === 'light' && 'blackAlpha.200'
                    }}
                />
            </Tooltip>
        </Flex>
    );

    return (
        <Box
            backgroundColor={
                props.commentIndex === store.comment.editCommentIndex
                    ? 'blue.400'
                    : colorMode === 'light'
                    ? 'blackAlpha.300'
                    : 'whiteAlpha.200'
            }
            opacity={
                !store.comment.editMode
                    ? 1
                    : props.commentIndex === store.comment.editCommentIndex
                    ? 1
                    : 0.3
            }
            borderRadius="8px"
            padding="20px"
            paddingRight="79px"
            width="100%"
            position="relative"
            _last={{
                marginBottom: '10px'
            }}
            role="group"
        >
            {renderMarkdownContent(props.comment)}

            <HStack width="100%">
                <Text fontSize="11px" opacity="0.5" marginTop="6px">
                    {props.comment.edited && 'Edited: '}
                    {props.comment.time}
                </Text>
                <HStack spacing="10px" paddingLeft="20px">
                    {props.comment.screenshot && (
                        <PhotoIcon
                            width="16px"
                            height="16px"
                            opacity="0.5"
                            style={{ marginBottom: '-5px' }}
                        />
                    )}
                    {props.comment.chart && (
                        <Chart
                            style={{
                                '--ggs': '0.7',
                                opacity: 0.5,
                                marginBottom: '2px'
                            }}
                        />
                    )}
                </HStack>
            </HStack>
            {renderCommentButtons(props.commentIndex)}
        </Box>
    );
}

CommentComponent.propTypes = {
    comment: PropTypes.object,
    commentIndex: PropTypes.number
};

export default observer(CommentComponent);
