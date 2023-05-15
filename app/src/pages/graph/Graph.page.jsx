import {
    Box,
    Button,
    Center,
    HStack,
    SlideFade,
    Text,
    useColorMode,
    useToast
} from '@chakra-ui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import ContextMenuComponent from 'components/feature/contextmenu/ContextMenu.component';
import GraphComponent from 'components/feature/graph/Graph.component';
import { SurveyInfoModal } from 'components/feature/surveyinfo/SurveyInfo.component';
import WidgetModal from 'components/interface/widgetmodal/WidgetModal.component';
import InteractionsToast from 'components/feature/interactionstoast/InteractionsToast.component';
import { Spinner } from 'css.gg';
import { isEnvSet } from 'general.utils';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import Joyride from 'react-joyride';

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
                <InteractionsToast
                    onClose={() => {
                        interactionsToast.closeAll();
                        store.core.setInteractionModalClosed(true);
                    }}
                />
            ),
            status: 'info',
            duration: null,
            isClosable: true,
            containerStyle: {
                minWidth: '200px',
                maxWidth: '700px'
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
            <WidgetModal />
            <ContextMenuComponent />
            <Joyride
                steps={[
                    {
                        target: '#graph',
                        placement: 'center',
                        floaterProps: { hideArrow: true },
                        title: (
                            <span
                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                            >
                                Analysis View
                            </span>
                        ),
                        content: (
                            <p
                                style={{
                                    textAlign: 'left',
                                    fontSize: '14px'
                                }}
                            >
                                Welcome to the analysis view 🔭! This is the
                                main CSX area used for analysing search results.
                                Click next to see what are the main components
                                of the analysis view.
                            </p>
                        )
                    },
                    {
                        target: '#graph',
                        placement: 'right-end',
                        floaterProps: { hideArrow: true },
                        disableOverlay: true,
                        title: (
                            <span
                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                            >
                                Graph View
                            </span>
                        ),
                        content: (
                            <p
                                style={{
                                    textAlign: 'left',
                                    fontSize: '14px'
                                }}
                            >
                                The graph that you see in front of you
                                represents your search results.
                            </p>
                        )
                    }
                ]}
                styles={{
                    options: {
                        backgroundColor: '#171A23',
                        textColor: 'white',
                        primaryColor: '#43a2fb',
                        arrowColor: '#171A23'
                    }
                }}
                showProgress={true}
                continuous={true}
                spotlightClicks={true}
            />

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
                                    JSON.stringify({
                                        area: 'Graph area'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Button'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Show all nodes'
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
