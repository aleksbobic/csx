import { Box, Center, Text, useColorMode, useToast } from '@chakra-ui/react';
import ContextMenuComponent from 'components/feature/contextmenu/ContextMenu.component';
import GraphComponent from 'components/feature/graph/Graph.component';
import StatsModalComponent from 'components/interface/statsmodal/StatsModal.component';
import { Spinner } from 'css.gg';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useContext, useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { isEnvSet } from 'general.utils';
import { useCallback } from 'react';
import { useRef } from 'react';
import { SurveyInfoModal } from 'components/feature/surveyinfo/SurveyInfo.component';

function GraphPage() {
    const dataModificationInfoToastRef = useRef();
    const dataModificationInfoToast = useToast();
    const store = useContext(RootStoreContext);
    const location = useLocation();
    const { colorMode } = useColorMode();
    const history = useHistory();
    const surveyToastRef = useRef();
    const surveyToast = useToast();

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
                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    backgroundColor="blackAlpha.900"
                                    textAlign="center"
                                    borderRadius="full"
                                    padding="10px 20px"
                                    marginBottom="10px"
                                >
                                    {message}
                                </Text>
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
            showDataModificationInfoToast(store.core.dataModificationMessage);
        }
    }, [
        dataModificationInfoToast,
        showDataModificationInfoToast,
        store.core,
        store.core.dataModificationMessage
    ]);

    return (
        <Box zIndex={1} height="100%" position="relative" id="graph">
            <StatsModalComponent />
            <ContextMenuComponent />

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
