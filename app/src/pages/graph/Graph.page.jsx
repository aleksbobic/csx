import {
  Box,
  Button,
  HStack,
  SlideFade,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ContextMenuComponent from "components/contextmenu/ContextMenu.component";
import GraphComponent from "components/graph/Graph.component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import InteractionsToast from "components/interactionstoast/InteractionsToast.component";
import Loader from "components/loader/Loader.component";
import { RootStoreContext } from "stores/RootStore";
import { SurveyInfoModal } from "components/surveyinfo/SurveyInfo.component";
import UiGuide from "components/uiguide/UIGuide";
import UiGuideGraphSteps from "config/uiguide.graph";
import WidgetModal from "layouts/widgetmodal/WidgetModal.component";
import { isEnvSet } from "utils/general.utils";
import { observer } from "mobx-react";
import queryString from "query-string";
import { useBeforeunload } from "react-beforeunload";

function GraphPage() {
  const dataModificationInfoToastRef = useRef();
  const dataModificationInfoToast = useToast();
  const [showViewAll, setViewAll] = useState(false);
  const interactionsToastRef = useRef();
  const interactionsToast = useToast();

  const store = useContext(RootStoreContext);
  const location = useLocation();

  const navigate = useNavigate();
  const surveyToastRef = useRef();
  const surveyToast = useToast();

  useEffect(() => {
    if (store.graphInstance.isSelfCentric || store.graphInstance.isFiltered) {
      interactionsToast.closeAll();
      setViewAll(true);
    } else {
      setViewAll(false);
    }
  }, [
    store.graphInstance.isSelfCentric,
    store.graphInstance.isFiltered,
    interactionsToast,
    store.core.isOverview,
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
    } catch {
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
          store.core.studyHistory[store.core.studyHistoryItemIndex].query;
      } else {
        queryHasChanged =
          store.search.advancedSearchQuery.query.action !== "search" ||
          store.search.advancedSearchQuery.query.feature !==
            store.search.default_search_features.join(", ") ||
          store.search.advancedSearchQuery.query.keyphrase !==
            store.core.studyHistory[store.core.studyHistoryItemIndex].query;
      }
    }

    return queryHasChanged;
  }, [
    queryIsJSON,
    store.core.studyHistory,
    store.core.studyHistoryItemIndex,
    store.search.advancedSearchQuery,
    store.search.default_search_features,
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
      navigate("/");
    }
  }, [
    navigate,
    location.search,
    location.state,
    shouldReload,
    store.core,
    store.graph,
    store.graphInstance,
    store.track,
  ]);

  useEffect(() => {
    if (store.search.searchIsEmpty || store.core.studyIsEmpty) {
      navigate("/");
    }
  }, [navigate, store.core.studyIsEmpty, store.search.searchIsEmpty]);

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
      position: "bottom-left",
      status: "error",
      duration: null,
      isClosable: true,
    });
  }, [store.core, surveyToast]);

  useEffect(() => {
    if (
      isEnvSet("VITE_SURVEY_LINK") &&
      store.core.studyHistory.length > store.core.surveyHistoryDepthTrigger &&
      !store.core.surveyHidden
    ) {
      renderSurveyToast();
    }
  }, [
    renderSurveyToast,
    store.core.studyHistory.length,
    store.core.surveyHidden,
    store.core.surveyHistoryDepthTrigger,
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
      status: "info",
      duration: null,
      isClosable: true,
      containerStyle: {
        minWidth: "200px",
        maxWidth: "700px",
      },
    });
  }, [interactionsToastRef, interactionsToast, store.core]);

  useEffect(() => {
    if (
      !store.core.neverShowInteractionModal &&
      store.core.isOverview &&
      !store.core.interactionModalClosed
    ) {
      showInteractionsToast();
    }
  }, [
    showInteractionsToast,
    store.core.isOverview,
    store.core.interactionModalClosed,
    store.core.neverShowInteractionModal,
  ]);

  useEffect(() => {
    if (store.core.isDetail) {
      interactionsToast.closeAll();
      store.core.setInteractionModalClosed(true);
    }
  }, [interactionsToast, store.core.isDetail, store.core]);

  const showDataModificationInfoToast = useCallback(
    (message) => {
      if (store.core.dataModificationMessage) {
        if (dataModificationInfoToastRef.current) {
          dataModificationInfoToast.close(dataModificationInfoToastRef.current);
        }

        if (message) {
          dataModificationInfoToastRef.current = dataModificationInfoToast({
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
                      width: "30px",
                      heght: "30px",
                    }}
                  />
                </Box>
                <Text fontSize="sm" fontWeight="medium" textAlign="left">
                  {message}
                </Text>
              </HStack>
            ),
            status: "info",
            duration: 5000,
            isClosable: true,
            containerStyle: {
              minWidth: "200px",
            },
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
    interactionsToast,
  ]);

  const renderViewAll = () => (
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
          _hover={{ backgroundColor: "blue.500" }}
          onClick={() => {
            store.track.trackEvent(
              {
                area: "Graph area",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                event_action: "Show all nodes",
              }
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
  );

  return (
    <Box zIndex={1} height="100%" position="relative" id="graph">
      <WidgetModal />
      <ContextMenuComponent />
      <UiGuide
        steps={UiGuideGraphSteps}
        onFinish={(data) => {
          if (data.action === "reset") {
            store.core.setFinishedGraphJoyride(true);
          }
        }}
        run={
          !store.core.finishedGraphJoyride &&
          store.search.currentDataset === "example"
        }
      />

      {showViewAll && renderViewAll()}

      {showLoader && <Loader />}

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

const ObservedGraphPage = observer(GraphPage);

export default ObservedGraphPage;
