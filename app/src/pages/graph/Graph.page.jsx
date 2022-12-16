import {
    Box,
    Button,
    Center,
    Code,
    Heading,
    HStack,
    IconButton,
    Text,
    Textarea,
    useColorMode,
    useToast,
    VStack
} from '@chakra-ui/react';
import ContextMenuComponent from 'components/feature/contextmenu/ContextMenu.component';
import GraphComponent from 'components/feature/graph/Graph.component';
import StatsModalComponent from 'components/interface/statsmodal/StatsModal.component';
import { Close, Spinner } from 'css.gg';
import { useKeyPress } from 'hooks/useKeyPress.hook';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useState } from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function GraphPage() {
    const store = useContext(RootStoreContext);
    const toast = useToast();
    const location = useLocation();
    const { colorMode } = useColorMode();
    const toastRef = useRef();
    const history = useHistory();

    const [comment, setComment] = useState('');
    const [showLoader, setShowLoader] = useState(store.core.dataIsLoading);

    useEffect(() => {
        setShowLoader(store.core.dataIsLoading);
    }, [store.core.dataIsLoading]);

    useBeforeunload(() => {
        store.core.deleteStudy();
    });

    useEffect(() => {
        store.track.trackPageChange();

        const studyId = queryString.parse(location.search).study;

        store.graphInstance.toggleVisibleComponents(-1);

        if (studyId) {
            if (store.core.studyUuid === studyId) {
                if (
                    store.graph.graphData.nodes.length === 0 ||
                    store.workflow.shouldRunWorkflow
                ) {
                    store.graph.modifyStudy(store.core.currentGraph);
                }
            } else {
                store.core.deleteStudy();
                store.core.setStudyUuid(studyId);
                store.graph.getStudy(studyId);
            }
        } else {
            history.push('/');
        }
    }, []);

    useEffect(() => {
        if (store.search.searchIsEmpty) {
            history.push('/');
        }
    }, [history, store.search.searchIsEmpty]);

    const renderToast = useCallback(() => {
        toastRef.current = toast({
            render: () => {
                return (
                    <Box
                        backgroundColor="red.500"
                        borderRadius="10px"
                        padding="10px"
                        key="id"
                    >
                        <VStack
                            width="400px"
                            position="relative"
                            alignItems="flex-start"
                        >
                            <HStack justifyContent="space-between" width="100%">
                                <Heading size="md">Server error 😢</Heading>
                                <IconButton
                                    variant="ghost"
                                    size="md"
                                    icon={<Close />}
                                    onClick={() => {
                                        toast.close(toastRef.current);
                                    }}
                                />
                            </HStack>
                            <Text>
                                There seems to be some issues with our server.
                                Sorry for that, we&#39;ll fix it as soon as
                                possible. If you see one of our devs please
                                share the following code with them:
                            </Text>
                            <Code
                                colorScheme="black"
                                maxHeight="100px"
                                overflow="scroll"
                                width="100%"
                                padding="5px"
                                borderRadius="10px"
                            >
                                {store.core.errorMessage.toString()}
                                {store.core.errorDetails}
                            </Code>
                        </VStack>
                    </Box>
                );
            },
            status: 'error',
            duration: 100000,
            isClosable: true,
            onCloseComplete: function () {
                store.core.errorMessage = false;
            }
        });
    }, [store.core, toast]);

    useEffect(() => {
        store.workflow.setShouldRunWorkflow(false);

        if (store.core.errorMessage) {
            renderToast();
        }
    }, [store.core.errorMessage, renderToast, store.workflow]);

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
                'Graph page',
                'Keyboard shortcut',
                'Open comment modal shortcut'
            );
            store.core.setShowCommentModal(true);
        }

        if (closeCommentModalKey && store.core.showCommentModal) {
            store.track.trackEvent(
                'Graph page',
                'Keyboard shortcut',
                'Close comment modal shortcut'
            );
            setComment('');
            store.core.setShowCommentModal(false);
        }
    }, [
        closeCommentModalKey,
        openCommentModalKey,
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
                'Graph page',
                'Keyboard shortcut',
                'Submit comment'
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

    const renderCommentModal = () => (
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
                paddingRight="40px"
                border="none"
                resize="none"
                placeholder="Enter your observations here ..."
                fontSize="sm"
                autoFocus={true}
                value={comment}
                onChange={e => setComment(e.target.value)}
            />
            <Button
                size="xs"
                position="absolute"
                right="16px"
                bottom="16px"
                zIndex="2"
                onClick={() => {
                    store.track.trackEvent(
                        'Graph page',
                        'Button click',
                        'Submit comment from comment modal'
                    );
                    submitComment();
                }}
            >
                Comment
            </Button>
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
                        'Graph page',
                        'Button click',
                        'Close comment modal'
                    );
                    closeCommentModal();
                }}
            />
        </Box>
    );

    return (
        <Box zIndex={1} height="100%" position="relative" id="graph">
            <StatsModalComponent />
            <ContextMenuComponent />
            {store.core.showCommentModal && renderCommentModal()}

            {showLoader && (
                <Center
                    width="100%"
                    height="100%"
                    backgroundColor={
                        colorMode === 'light' ? '#efefef' : '#1A202C'
                    }
                    position="fixed"
                    top="0"
                    left="0"
                    zIndex="2"
                >
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                        zIndex="20"
                    />
                </Center>
            )}

            <GraphComponent
                graphData={
                    store.core.isDetail
                        ? store.graph.detailGraphData
                        : store.graph.graphData
                }
            />
        </Box>
    );
}

export default observer(GraphPage);
