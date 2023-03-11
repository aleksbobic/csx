import { useColorMode, VStack } from '@chakra-ui/react';
import { observer } from 'mobx-react';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import CustomScroll from '../customscroll/CustomScroll.component';
import Comment from './comment/Comment.component';
import CommentTextArea from './commenttextarea/CommentTextArea.component';

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
                <CustomScroll
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                >
                    <VStack heigh="auto" width="100%" borderRadius="6px">
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
                </CustomScroll>
            )}
            <CommentTextArea />
        </VStack>
    );
}

export default observer(CommentsComponent);
