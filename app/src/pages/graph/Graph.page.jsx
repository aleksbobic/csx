import {
    Box,
    Button,
    Center,
    Checkbox,
    HStack,
    Heading,
    IconButton,
    Image,
    SlideFade,
    Switch,
    Text,
    VStack,
    useColorMode,
    useToast
} from '@chakra-ui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import ContextMenuComponent from 'components/feature/contextmenu/ContextMenu.component';
import GraphComponent from 'components/feature/graph/Graph.component';
import { SurveyInfoModal } from 'components/feature/surveyinfo/SurveyInfo.component';
import StatsModalComponent from 'components/interface/statsmodal/StatsModal.component';
import { Close, Spinner } from 'css.gg';
import { isEnvSet } from 'general.utils';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

import canvasMenuInteraction from 'images/left_click_canvas.png';
import panningInteraction from 'images/pan_and_move.png';
import scrollInteraction from 'images/scroll.png';

function GraphPage() {
    const dataModificationInfoToastRef = useRef();
    const dataModificationInfoToast = useToast();
    const [showViewAll, setViewAll] = useState(false);
    const interactionsToastRef = useRef();
    const interactionsToast = useToast();

    const store = useContext(RootStoreContext);
    const location = useLocation();
    const { colorMode } = useColorMode();
    const history = useHistory();
    const surveyToastRef = useRef();
    const surveyToast = useToast();

    useEffect(() => {
        if (
            store.graphInstance.isSelfCentric ||
            store.graphInstance.isFiltered
        ) {
            interactionsToast.closeAll();
            setViewAll(true);
        } else {
            setViewAll(false);
        }
    }, [
        store.graphInstance.isSelfCentric,
        store.graphInstance.isFiltered,
        interactionsToast,
        store.core.isOverview
    ]);

    const [showLoader, setShowLoader] = useState(store.core.dataIsLoading);

    useEffect(() => {
        setShowLoader(store.core.dataIsLoading);
    }, [store.core.dataIsLoading]);

    useBeforeunload(() => {
        store.core.deleteStudy();
    });

    const queryIsJSON = useCallback(() => {
        try {
            JSON.parse(
                store.core.studyHistory[store.core.studyHistoryItemIndex].query
            );

            return true;
        } catch (e) {
            return false;
        }
    }, [store.core.studyHistory, store.core.studyHistoryItemIndex]);

    const shouldReload = useCallback(() => {
        let queryHasChanged = false;
        if (
            store.core.studyHistory.length > 0 &&
            store.search.advancedSearchQuery
        ) {
            if (queryIsJSON()) {
                queryHasChanged =
                    JSON.stringify(store.search.advancedSearchQuery) !==
                    store.core.studyHistory[store.core.studyHistoryItemIndex]
                        .query;
            } else {
                queryHasChanged =
                    store.search.advancedSearchQuery.query.action !==
                        'search' ||
                    store.search.advancedSearchQuery.query.feature !==
                        store.search.default_search_features.join(', ') ||
                    store.search.advancedSearchQuery.query.keyphrase !==
                        store.core.studyHistory[
                            store.core.studyHistoryItemIndex
                        ].query;
            }
        }

        return queryHasChanged;
    }, [
        queryIsJSON,
        store.core.studyHistory,
        store.core.studyHistoryItemIndex,
        store.search.advancedSearchQuery,
        store.search.default_search_features
    ]);

    useEffect(() => {
        store.track.trackPageChange();

        const studyId = queryString.parse(location.search).study;

        store.graphInstance.toggleVisibleComponents(-1);

        if (studyId) {
            if (store.core.studyUuid === studyId) {
                if (
                    !store.core.dataIsLoading &&
                    (store.graph.graphData.nodes.length === 0 || shouldReload())
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
    }, [
        history,
        location.search,
        location.state,
        shouldReload,
        store.core,
        store.graph,
        store.graphInstance,
        store.track
    ]);

    useEffect(() => {
        if (store.search.searchIsEmpty || store.core.studyIsEmpty) {
            history.push('/');
        }
    }, [history, store.core.studyIsEmpty, store.search.searchIsEmpty]);

    useEffect(() => {
        store.workflow.setShouldRunWorkflow(false);
    }, [store.workflow]);

    const renderSurveyToast = useCallback(() => {
        surveyToastRef.current = surveyToast({
            render: () => (
                <SurveyInfoModal
                    onClose={() => {
                        surveyToast.close(surveyToastRef.current);
                        store.core.setSurveyHidden(true);
                    }}
                />
            ),
            position: 'bottom-left',
            status: 'error',
            duration: null,
            isClosable: true
        });
    }, [store.core, surveyToast]);

    useEffect(() => {
        if (
            isEnvSet('REACT_APP_SURVEY_LINK') &&
            store.core.studyHistory.length >
                store.core.surveyHistoryDepthTrigger &&
            !store.core.surveyHidden
        ) {
            renderSurveyToast();
        }
    }, [
        renderSurveyToast,
        store.core.studyHistory.length,
        store.core.surveyHidden,
        store.core.surveyHistoryDepthTrigger
    ]);

    const showInteractionsToast = useCallback(() => {
        if (interactionsToastRef.current) {
            interactionsToast.close(interactionsToastRef.current);
        }

        interactionsToastRef.current = interactionsToast({
            render: () => (
                <VStack
                    background="blackAlpha.900"
                    borderRadius="10px"
                    padding="20px"
                    marginBottom="15px"
                >
                    <Heading
                        size="sm"
                        color="white"
                        width="100%"
                        textAlign="center"
                    >
                        Interactions
                    </Heading>

                    <Text
                        fontSize="xs"
                        textAlign="center"
                        padding="0 20px 10px 20px"
                    >
                        This graph represents your search results. Here are some
                        of the ways you can interact with it and the elemnts in
                        it.
                    </Text>
                    <HStack spacing="20px">
                        <VStack width="33%">
                            <Heading size="xs" width="100%">
                                Zoom
                            </Heading>
                            <Text fontSize="xs">
                                Scroll with your mouse wheel to zoom in and out
                                the view.
                            </Text>
                            <Image
                                src={scrollInteraction}
                                height="50px"
                                alt="Mouse scroll interaction"
                            />
                        </VStack>
                        <VStack width="33%">
                            <Heading size="xs" width="100%">
                                Pan View & Move Node
                            </Heading>
                            <Text fontSize="xs">
                                Left click on the{' '}
                                <Text
                                    as="span"
                                    color="blue.500"
                                    fontWeight="bold"
                                >
                                    canvas
                                </Text>{' '}
                                or a{' '}
                                <Text
                                    as="span"
                                    color="blue.500"
                                    fontWeight="bold"
                                >
                                    node
                                </Text>{' '}
                                and drag your mouse to move it.
                            </Text>
                            <Image
                                src={panningInteraction}
                                height="50px"
                                alt="Mouse scroll interaction"
                            />
                        </VStack>
                        <VStack width="33%">
                            <Heading size="xs" width="100%">
                                Open menu
                            </Heading>
                            <Text fontSize="xs">
                                Right click on the{' '}
                                <Text
                                    as="span"
                                    color="blue.500"
                                    fontWeight="bold"
                                >
                                    canvas
                                </Text>{' '}
                                or a{' '}
                                <Text
                                    as="span"
                                    color="blue.500"
                                    fontWeight="bold"
                                >
                                    node
                                </Text>{' '}
                                to open their context menus.
                            </Text>

                            <Image
                                src={canvasMenuInteraction}
                                height="50px"
                                alt="Mouse scroll interaction"
                            />
                        </VStack>
                    </HStack>
                    <HStack spacing="20px">
                        <Button
                            size="xs"
                            backgroundColor="blue.600"
                            width="80px"
                            paddingLeft="4px"
                            _hover={{
                                backgroundColor: 'blue.500'
                            }}
                            leftIcon={
                                <Close
                                    style={{
                                        '--ggs': 0.7
                                    }}
                                />
                            }
                            onClick={() => {
                                interactionsToast.closeAll();
                                store.core.setInteractionModalClosed(true);
                            }}
                        >
                            Close
                        </Button>
                        <HStack spacing="10px" justifyContent="space-between">
                            <Checkbox
                                size="sm"
                                onChange={e => {
                                    store.core.setInteractionsModalDisplay(
                                        e.target.checked
                                    );
                                }}
                            >
                                Never show again
                            </Checkbox>
                        </HStack>
                    </HStack>
                </VStack>
            ),
            status: 'info',
            duration: null,
            isClosable: true,
            containerStyle: {
                minWidth: '200px'
            }
        });
    }, [interactionsToastRef, interactionsToast, store.core]);

    useEffect(() => {
        if (
            !store.core.neverShowInteractionModal &&
            store.core.isOverview &&
            !store.core.interactionModalClosed
        ) {
            showInteractionsToast();
        } else {
        }
    }, [
        showInteractionsToast,
        store.core.isOverview,
        store.core.interactionModalClosed,
        store.core.neverShowInteractionModal
    ]);

    useEffect(() => {
        if (store.core.isDetail) {
            interactionsToast.closeAll();
            store.core.setInteractionModalClosed(true);
        }
    }, [interactionsToast, store.core.isDetail, store.core]);

    const showDataModificationInfoToast = useCallback(
        message => {
            if (store.core.dataModificationMessage) {
                if (dataModificationInfoToastRef.current) {
                    dataModificationInfoToast.close(
                        dataModificationInfoToastRef.current
                    );
                }

                if (message) {
                    dataModificationInfoToastRef.current =
                        dataModificationInfoToast({
                            render: () => (
                                <HStack
                                    background="linear-gradient(45deg, #3182CE 0%, #2C5282 100%)"
                                    borderRadius="10px"
                                    padding="5px 10px 5px 5px"
                                    marginBottom="15px"
                                >
                                    <Box padding="5px" borderRadius="6px">
                                        <InformationCircleIcon
                                            style={{
                                                width: '30px',
                                                heght: '30px'
                                            }}
                                        />
                                    </Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        textAlign="left"
                                    >
                                        {message}
                                    </Text>
                                </HStack>
                            ),
                            status: 'info',
                            duration: 5000,
                            isClosable: true,
                            containerStyle: {
                                minWidth: '200px'
                            }
                        });
                }
            }
        },
        [dataModificationInfoToast, store.core]
    );

    useEffect(() => {
        if (store.core.dataModificationMessage) {
            interactionsToast.closeAll();
            showDataModificationInfoToast(store.core.dataModificationMessage);
        }
    }, [
        dataModificationInfoToast,
        showDataModificationInfoToast,
        store.core,
        store.core.dataModificationMessage,
        interactionsToast
    ]);

    return (
        <Box zIndex={1} height="100%" position="relative" id="graph">
            <StatsModalComponent />
            <ContextMenuComponent />

            {showViewAll && (
                <Box
                    bottom="20px"
                    left="50%"
                    zIndex="20"
                    transform="translateX(-50%)"
                    position="absolute"
                >
                    <SlideFade in={showViewAll} offsetY="10px">
                        <Button
                            backgroundColor="blue.600"
                            borderRadius="full"
                            position="relative"
                            size="sm"
                            _hover={{ backgroundColor: 'blue.500' }}
                            onClick={() => {
                                store.track.trackEvent(
                                    'Side Panel - Direct Connections',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Show all nodes'
                                    })
                                );
                                store.graphInstance.toggleVisibleComponents(-1);
                                store.graphInstance.setIsFiltered(false);
                                store.graphInstance.resetSelfCentric();
                            }}
                        >
                            View all
                        </Button>
                    </SlideFade>
                </Box>
            )}

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
