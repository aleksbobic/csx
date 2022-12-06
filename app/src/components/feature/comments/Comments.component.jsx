import { useColorMode, VStack } from '@chakra-ui/react';
import { observer } from 'mobx-react';

import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import Comment from './comment/Comment.component';
import CommentTextArea from './commenttextarea/CommentTextArea.component';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function CommentsComponent(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    return (
        <VStack
            width="100%"
            spacing="40px"
            padding="14px"
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.200' : 'whiteAlpha.100'
            }
            borderRadius="10px"
            style={{ justifyContent: 'space-between' }}
        >
            {store.comment.isCommentListVisible && (
                <OverlayScrollbarsComponent
                    style={{
                        width: '100%',
                        height: '100%',
                        paddingLeft: '10px',
                        paddingRight: '10px'
                    }}
                    options={{
                        scrollbars: {
                            theme: 'os-theme-dark',
                            autoHide: 'scroll',
                            autoHideDelay: 600,
                            clickScroll: true
                        }
                    }}
                >
                    <VStack
                        heigh="auto"
                        width="100%"
                        overflowY={store.comment.editMode ? 'hidden' : 'scroll'}
                        borderRadius="6px"
                    >
                        {store.core.studyHistory.length > 0 &&
                            store.core.studyHistory[
                                store.core.studyHistoryItemIndex
                            ].comments.map((comment, index) => {
                                return (
                                    <Comment
                                        comment={comment}
                                        commentIndex={index}
                                        key={`history_comment_${index}`}
                                    />
                                );
                            })}
                    </VStack>
                </OverlayScrollbarsComponent>
            )}
            <CommentTextArea />
        </VStack>
    );
}

export default observer(CommentsComponent);
