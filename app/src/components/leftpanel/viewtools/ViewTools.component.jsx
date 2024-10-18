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

function ViewTools() {
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
