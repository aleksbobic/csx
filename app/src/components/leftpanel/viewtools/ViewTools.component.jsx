import {
  ArrowUturnLeftIcon,
  BoltIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  HStack,
  Heading,
  IconButton,
  Tooltip,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";

import CanvasTools from "components/leftpanel/viewtools/canvastools/CanvasTools.component";
import EdgeTools from "components/leftpanel/viewtools/edgetools/EdgeTools.component";
import FilterTools from "components/leftpanel/viewtools/filtertools/FilterTools.component";
import NodeTools from "components/leftpanel/viewtools/nodetools/NodeTools.component";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import MapTools from "./maptools/MapTools.component"; // new18: import MapTools component

function ViewTools({
  isMapPath, // Determine if /map path is active
  nodeOpacityValue, // new18 - node opacity value
  handleNodeOpacityChange, // new18 - handle node opacity change
  linkWidthValue, // new18 - link width value
  handleLinkWidthChange, // new18 - handle link width change
  linkOpacityValue, // new18 - link opacity value
  handleLinkOpacityChange, // new18 - handle link opacity change
  linkCurvatureValue, // new18 - link curvature value
  handleLinkCurvatureChange, // new18 - handle link curvature change
  isBundlingEnabled, // new18 - is bundling enabled
  handleToggleBundling, // new18 - handle toggle bundling
  isClusteringEnabled, // new18 - is clustering enabled
  handleToggleClustering, // new18 - handle toggle clustering
  clusterRadius, // new18 - cluster radius
  handleClusterRadiusChange, // new18 - handle cluster radius change
  isVisible, // new18 - is legend visible
  toggleLegend, // new18 - toggle legend
  hideNoLocationNodes, // NEW20: hide nodes without location
  handleToggleHideNoLocationNodes, // NEW20: handle hide nodes without location
}) {
  const store = useContext(RootStoreContext);
  const [forceRunning, setForceRunning] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!store.graphInstance.forceEngine) {
      setForceRunning(false);
    }
  }, [store.graphInstance.forceEngine]);

  const renderLayoutOptions = () => {
    return (
      <VStack width="100%">
        <HStack width="100%">
          <Tooltip label="Simulate graph layout (will make nodes move around and make it easier to see patterns)">
            <Button
              id="applyforcebutton"
              size="sm"
              leftIcon={<BoltIcon style={{ width: "14px", height: "14px" }} />}
              backgroundColor={
                forceRunning
                  ? "blue.400"
                  : colorMode === "light"
                    ? "blackAlpha.200"
                    : "whiteAlpha.200"
              }
              onClick={() => {
                if (forceRunning) {
                  store.graphInstance.stopForce();
                  setForceRunning(false);

                  store.track.trackEvent(
                    {
                      area: "Left panel",
                      sub_area: "VIew tools",
                    },
                    {
                      item_type: "Button",
                    },
                    {
                      event_type: "Click",
                      event_action: "Run force",
                    }
                  );
                } else {
                  store.graphInstance.applyForce();
                  setForceRunning(true);

                  store.track.trackEvent(
                    {
                      area: "Left panel",
                      sub_area: "VIew tools",
                    },
                    {
                      item_type: "Button",
                    },
                    {
                      event_type: "Click",
                      event_action: "Stop force",
                    }
                  );
                }
              }}
              width="100%"
            >
              {forceRunning ? "Stop force" : "Run Force"}
            </Button>
          </Tooltip>
          <Tooltip
            label={
              store.graphInstance.forceShouldIgnoreSelected
                ? "Turn off layout simulation for selected nodes."
                : "Turn on layout simulation for selected nodes."
            }
          >
            <IconButton
              id="resetLayoutButton"
              size="sm"
              icon={<PlayIcon style={{ width: "14px", height: "14px" }} />}
              onClick={() => {
                store.track.trackEvent(
                  {
                    area: "Left panel",
                    sub_area: "VIew tools",
                  },
                  {
                    item_type: "Button",
                  },
                  {
                    event_type: "Click",
                    event_action: store.graphInstance.forceShouldIgnoreSelected
                      ? "Turn off layout simulation for selected nodes."
                      : "Turn on layout simulation for selected nodes.",
                  }
                );
                store.graphInstance.ignoreSelected(
                  !store.graphInstance.forceShouldIgnoreSelected
                );
              }}
              _hover={{
                backgroundColor: "blue.500",
                opacity: 0.76,
              }}
              backgroundColor={
                store.graphInstance.forceShouldIgnoreSelected
                  ? "blue.500"
                  : "auto"
              }
              disabled={store.graphInstance.forceEngine}
            />
          </Tooltip>
          <Tooltip label="Reset node positions">
            <IconButton
              id="resetLayoutButton"
              size="sm"
              icon={
                <ArrowUturnLeftIcon style={{ width: "14px", height: "14px" }} />
              }
              onClick={() => {
                store.graph.resetNodesPositions();

                store.track.trackEvent(
                  {
                    area: "Left panel",
                    sub_area: "VIew tools",
                  },
                  {
                    item_type: "Button",
                  },
                  {
                    event_type: "Click",
                    event_action: "Reset layout",
                  }
                );
              }}
              disabled={store.graphInstance.forceEngine}
            />
          </Tooltip>
        </HStack>
      </VStack>
    );
  };

  return (
    <VStack
      align="center"
      direction="column"
      paddingLeft="0"
      paddingRight="0"
      id="viewsettingscomponent"
      width="100%"
    >
      <VStack spacing="2px" align="start" width="100%">
        <CanvasTools />
        <EdgeTools />
        <NodeTools />
        <FilterTools />
        {/* new18: adding MapTools component to ViewTools */}
        {isMapPath && (
          <MapTools
            nodeOpacityValue={nodeOpacityValue}
            handleNodeOpacityChange={handleNodeOpacityChange}
            linkWidthValue={linkWidthValue}
            handleLinkWidthChange={handleLinkWidthChange}
            linkOpacityValue={linkOpacityValue}
            handleLinkOpacityChange={handleLinkOpacityChange}
            linkCurvatureValue={linkCurvatureValue}
            handleLinkCurvatureChange={handleLinkCurvatureChange}
            isBundlingEnabled={isBundlingEnabled}
            handleToggleBundling={handleToggleBundling}
            isClusteringEnabled={isClusteringEnabled}
            handleToggleClustering={handleToggleClustering}
            clusterRadius={clusterRadius}
            handleClusterRadiusChange={handleClusterRadiusChange}
            isVisible={isVisible}
            toggleLegend={toggleLegend}
            hideNoLocationNodes={hideNoLocationNodes} // NEW20: hide nodes without location
            handleToggleHideNoLocationNodes={handleToggleHideNoLocationNodes} // NEW20: handle hide nodes without location
          />
        )}
      </VStack>
      <VStack
        width="100%"
        backgroundColor="whiteAlpha.200"
        padding="10px"
        borderRadius="10px"
        style={{ marginTop: "15px" }}
      >
        <Heading size="sm" style={{ marginBottom: "10px" }} width="100%">
          Layout
        </Heading>
        {renderLayoutOptions()}
      </VStack>
    </VStack>
  );
}

const ObservedViewTools = observer(ViewTools);
export default ObservedViewTools;
