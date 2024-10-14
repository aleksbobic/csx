import {
  Box,
  Button,
  Center,
  HStack,
  SlideFade,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ContextMenuComponent from "components/feature/contextmenu/ContextMenu.component";
import GraphComponent from "components/feature/graph/Graph.component";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import InteractionsToast from "components/feature/interactionstoast/InteractionsToast.component";
import Joyride from "react-joyride";
import { RootStoreContext } from "stores/RootStore";
import { SurveyInfoModal } from "components/feature/surveyinfo/SurveyInfo.component";
import WidgetModal from "components/interface/widgetmodal/WidgetModal.component";
import { isEnvSet } from "@/general.utils";
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
  const { colorMode } = useColorMode();
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

  return (
    <Box zIndex={1} height="100%" position="relative" id="graph">
      <WidgetModal />
      <ContextMenuComponent />
      <Joyride
        steps={[
          {
            target: "#graph",
            placement: "center",
            floaterProps: { hideArrow: true },
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Analysis View
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Welcome to the analysis view 🔭! This is the main CSX area used
                for analysing search results. Click next to see what are the
                main components of the analysis view.
              </p>
            ),
          },
          {
            target: "#graph",
            placement: "right-end",
            floaterProps: { hideArrow: true },
            disableOverlay: true,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Graph View
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                The network that you see in front of you represents your search
                results. Each{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  node
                </span>{" "}
                represents a{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  column value
                </span>{" "}
                and each{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  edge
                </span>{" "}
                represents a{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  common value of a different column
                </span>
                . You can left click on a node to see more information about it.
                To see how you can change the network click next.
              </p>
            ),
          },
          {
            target: "#schemapnaletoggle",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Schema Panel
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Click the highlighted button
                    </span>{" "}
                    to open the schema panel.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Once the schema panel is open{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      click next
                    </span>
                    .
                  </li>
                </ul>
              </div>
            ),
          },
          {
            target: "#schema",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Schema Panel
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  This is the ✨ schema panel ✨. It shows how the search result
                  columns are connected to create the network.
                </p>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Click next
                    </span>{" "}
                    to read more about it.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            target: "#schema",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Schema Panel - Nodes
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    The larger{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      left node
                    </span>{" "}
                    represents the search result{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      column used for network nodes
                    </span>
                    .
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    The{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      bottom dropdown
                    </span>{" "}
                    enables you to add{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      properties
                    </span>{" "}
                    to nodes (for example an author can have an h-index
                    property).
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    The{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      right node
                    </span>{" "}
                    represents the search result{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      column used for network edges
                    </span>{" "}
                    (e.g. if two papers share the same keyword they will have an
                    edge between them showing that keyword).
                  </li>
                </ul>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Click next to change the schema.
                </p>
              </div>
            ),
          },
          {
            target: "#schema",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Schema Panel - Network Modeling
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Change the nodes to{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      authors
                    </span>{" "}
                    by changing the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      left nodes top dropdown
                    </span>
                    .
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Remove the existing edge node by pressing the x button on
                    the edge node (right smaller node).
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Add two new edge nodes by{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      pressing the 🔗 button
                    </span>{" "}
                    on the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      right border of the left large node
                    </span>{" "}
                    twice.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Select{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      author institutions
                    </span>{" "}
                    as the first edge and{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      title
                    </span>{" "}
                    as the second edge.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Click the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      apply changes
                    </span>{" "}
                    button and then click next.
                  </li>
                </ol>
              </div>
            ),
          },
          {
            target: "#graph",
            placement: "left",
            disableOverlay: true,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Exploring the Graph
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Congratulations you&apos;ve modeled your first network
                  <sup
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                    }}
                  >
                    *
                  </sup>
                  👏! Some notes about this network: The{" "}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                    }}
                  >
                    node size
                  </span>{" "}
                  represents the{" "}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                    }}
                  >
                    frequency
                  </span>{" "}
                  of a value in the search results. The node location does not
                  represent anything.{" "}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                    }}
                  >
                    Two nodes are connected if they appear on the same row as
                    the value on the edge
                  </span>{" "}
                  (e.g. two authors in our graph are connected if they
                  co-authored a paper or if they are affiliated with the same
                  author institution) Click next to continue.
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    paddingTop: "20px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>{" "}
                  If you don&apos;t see any nodes press the fit graph to view
                  button at the top left.
                </p>
              </div>
            ),
          },
          {
            target: "#viewsettingscomponent",
            placement: "right-end",
            disableOverlay: false,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                View Tools
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                This is a set of various tools used to change visible properties
                of the graph. These tools do not change the data or the shape of
                the network they are only used to either{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  modify the visual properties of the network
                </span>{" "}
                or to{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  filter the network
                </span>
                . Click next to continue.
              </p>
            ),
          },
          {
            target: "#NetworkModifcationTools",
            placement: "right-end",
            disableOverlay: false,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Network Modification Tools
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Click the highlighted tab
                    </span>{" "}
                    to open the network modification tools.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Once the panel is open{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      click next
                    </span>
                    .
                  </li>
                </ul>
              </div>
            ),
          },
          {
            target: "#ModifcationToolsComponent",
            placement: "right-end",
            disableOverlay: false,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Network Modification Tools
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                These tools are used to{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  modify the network data
                </span>{" "}
                by either{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  removing search results associated with particular nodes
                </span>{" "}
                or{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  adding new search results with the same values as the selected
                  nodes
                </span>
                . Click next to try and remove some of the nodes.
              </p>
            ),
          },
          {
            target: "#graph",
            placement: "left",
            disableOverlay: true,
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Network Modification Tools
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    {" "}
                    Right click on a node to open the node context menu
                    <sup
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      [*]
                    </sup>
                    . Then click select node to select it.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    {" "}
                    Do the same with another node.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Click remove selected from the network modification tools.
                  </li>
                </ol>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Congratulations 🥳 you just modified the network data! Click
                  next to explore a different type of network schema.
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    paddingTop: "20px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>{" "}
                  If you can&apos;t see the nodes try zooming out by scrolling
                  down.
                </p>
              </div>
            ),
          },
          {
            target: "#switchgraphviewbutton",
            placement: "left",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Detail Network
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Click this button to switch to the{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  detail network
                </span>
                . This network is used to display connections between{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  multiple columns
                </span>
                . Each node type is represented by a different search result
                column and each edge represent the coocurence of two values in
                the same row (e.g. an author node connected to country means
                that the author and the country appear on the same row in the
                search results).
              </p>
            ),
          },
          {
            target: "#schema",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Detail Network - Network Modeling
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Each node in this schema represents a column in the searh
                    results.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Two nodes can be conneted by connecting the bottom connetion
                    area of one to the top connection area of another in the
                    same way as you would connect nodes in the advanced search.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    You can turn off the visibility of some of the nodes by
                    clicking the eye icon on the node. If two visible columns
                    are conneted through a third invisible column, nodes of that
                    column will not be shown in the network but the values will
                    be used to calculate the network structure.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            target: "#schema",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Detail Network - Network Modeling
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Connect the title to the author column and the author column
                    to the author institutions column{" "}
                    <sup
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      [*]
                    </sup>
                    .
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Click on the connection in order to change it from M:N to
                    1:1. Then click the lightbulb icon on the authors node to
                    turn off the visiblity.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Apply changes and click next to see how to write comments.
                  </li>
                </ol>
                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    paddingTop: "20px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>{" "}
                  Since authors and author institutions are represented as lists
                  in each cell they can be conneted either using a 1:1 connetion
                  (e.g. first author in a cell is connected to the first
                  institution in the cell on the same row, second author to the
                  second institution etc.) or M:N in which case all authors and
                  institutions on the same row are interconnected.
                </p>
              </div>
            ),
          },
          {
            target: "#historypnaletoggle",
            placement: "left",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                History
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Click to see an interactive history of changes you made to the
                network shema and the search results.
              </p>
            ),
          },
          {
            target: "#HistoryFlow",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                History
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Each history item represents the state of the search results
                    at a particular time.{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      A new history item is created each time you apply changes
                      to the network schema or the search results.
                    </span>{" "}
                    The edge labels indicate the type of change that was made
                    (e.g. expand, remove, modify schema, change graph type).
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    You can navigate to a previous data state by clicking on one
                    of the history items that is not active (is not blue). If
                    you start making changes to the network schema or the search
                    results it will create a new branch in history.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Removing a history item by clicking the x button will also
                    delete its children in the tree.
                  </li>
                </ul>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Click next to see how you can write down observations about
                  your data.
                </p>
              </div>
            ),
          },
          {
            target: "#commentscomponent",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Comments
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ul
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Comments are associated with the currently active history
                    item. Moving to a different history item will either show
                    you an empty comment list or the comments that are already
                    assoiated with that history item.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Comments also support markdown syntax. To see all supported
                    markdown syntax click the ? button bellow the textarea.
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Writing a comment that starts with a # or multiple # will
                      also create a title for the current history item
                    </span>{" "}
                    and enable you to easly navigate between different states of
                    your data.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            target: "#commentscomponent",
            placement: "left-end",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Comments
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Write a markdown comment and add a screenshot of the graph
                    by clicking the 📷 icon next to the blue send button.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Now submit your comment by clicking the blue button or by
                    pressing shift + enter.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Click next to see how you can explore alternative data
                    representations.
                  </li>
                </ol>
              </div>
            ),
          },
          {
            target: "#resultspnaletoggle",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Results Panel
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                To explore your search results in a more familiar table or list
                format you can open the results panel.
              </p>
            ),
          },
          {
            target: "#detailspnaletoggle",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Widgets Panel
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                To explore your search results using traditional data
                visualisation techniques in the form of various charts open the
                widgest panel. From there you can add widgets to the dashboard.
                Additionally widgets can be added to comments too.
              </p>
            ),
          },
          {
            target: "#searchpnaletoggle",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Advanced Search Panel
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                To refine your search and potentially create a completly
                different search open the advaned search panel.
              </p>
            ),
          },
          {
            target: "#presentationmode",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Presentation Mode
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                To generate a presentation from your comments and in the
                chronologial order of your history items click the presentation
                mode button. You will notice that the presentation inlude an odd
                name and no introduction or author. Click the next button to see
                how to change that.
              </p>
            ),
          },
          {
            target: "#StudySettingsTab",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Studies
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Your entire exploration path including retrieval, analysis and
                comments is called a study. To see the study details and change
                them click on this tab and then click next.
              </p>
            ),
          },
          {
            target: "#studyinfocomponent",
            placement: "bottom",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Studies
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Here you can change the study name, description and author. This
                data will also be used to generate the presentation.
                Additionally you can also make the presentation public and share
                the public link with your colleagues. If you followed the entire
                tutorial you will notice that the study is already saved this is
                because you already wrote a comment and because CSX assumes you
                would like to access your investigation at a later stage. You
                can find all your studies on the home sreen. Congratulations you
                finished the tutorial! 🥳🎉👏
              </p>
            ),
          },
        ]}
        styles={{
          options: {
            backgroundColor: "#171A23",
            textColor: "white",
            primaryColor: "#43a2fb",
            arrowColor: "#171A23",
          },
        }}
        showProgress={true}
        continuous={true}
        spotlightClicks={true}
        callback={(data) => {
          if (data.action === "reset") {
            store.core.setFinishedGraphJoyride(true);
          }
        }}
        run={
          !store.core.finishedGraphJoyride &&
          store.search.currentDataset === "example"
        }
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
              _hover={{ backgroundColor: "blue.500" }}
              onClick={() => {
                store.track.trackEvent(
                  JSON.stringify({
                    area: "Graph area",
                  }),
                  JSON.stringify({
                    item_type: "Button",
                  }),
                  JSON.stringify({
                    event_type: "Click",
                    event_action: "Show all nodes",
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
          backgroundColor={colorMode === "light" ? "#efefef" : "#1A202C"}
          position="fixed"
          top="0"
          left="0"
          zIndex="2"
        >
          Loading ...
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

const ObservedGraphPage = observer(GraphPage);

export default ObservedGraphPage;
