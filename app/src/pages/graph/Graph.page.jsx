import { Box, Center, useColorMode, useToast } from '@chakra-ui/react';
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
    }, [
        history,
        location.search,
        store.core,
        store.graph,
        store.graphInstance,
        store.track,
        store.workflow.shouldRunWorkflow
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
