import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Heading,
  VStack,
} from "@chakra-ui/react";
import {
  ScissorsIcon,
  Squares2X2Icon,
  StopIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function ModificationTools() {
  const store = useContext(RootStoreContext);

  const renderVisibilityOptions = () => {
    return (
      <>
        <Accordion
          width="100%"
          backgroundColor="whiteAlpha.200"
          padding="5px 10px 0"
          borderRadius="10px"
          allowToggle={true}
          defaultIndex={0}
        >
          <AccordionItem>
            <AccordionButton
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                textAlign: "left",
                borderRadius: "10px",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <Heading size="sm" width="100%">
                Remove
              </Heading>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel padding="10px 0 0">
              <VStack width="100%" spacing="10px" paddingBottom="10px">
                <Button
                  leftIcon={<TrashIcon width="16px" height="16px" />}
                  width="100%"
                  size="sm"
                  onClick={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Left panel",
                        sub_area: "Modification tools",
                      }),
                      JSON.stringify({
                        item_type: "Button",
                      }),
                      JSON.stringify({
                        event_type: "Click",
                        event_action: "Remove selected",
                      })
                    );

                    store.graph.removeSelection();
                  }}
                >
                  Remove selected
                </Button>
                <Button
                  leftIcon={<ScissorsIcon width="16px" height="16px" />}
                  width="100%"
                  size="sm"
                  onClick={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Left panel",
                        sub_area: "Modification tools",
                      }),
                      JSON.stringify({
                        item_type: "Button",
                      }),
                      JSON.stringify({
                        event_type: "Click",
                        event_action: "Remove invisible",
                      })
                    );
                    store.graph.trimNetwork();
                  }}
                >
                  Remove Invisible
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Accordion
          width="100%"
          backgroundColor="whiteAlpha.200"
          padding="5px 10px 0"
          borderRadius="10px"
          allowToggle={true}
          defaultIndex={0}
          style={{ marginTop: "15px" }}
        >
          <AccordionItem>
            <AccordionButton
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                textAlign: "left",
                borderRadius: "10px",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <Heading size="sm" width="100%">
                Expand
              </Heading>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel padding="10px 0 0">
              <VStack width="100%" spacing="10px" paddingBottom="10px">
                <Button
                  leftIcon={<Squares2X2Icon width="16px" height="16px" />}
                  width="100%"
                  size="sm"
                  onClick={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Left panel",
                        sub_area: "Modification tools",
                      }),
                      JSON.stringify({
                        item_type: "Button",
                      }),
                      JSON.stringify({
                        event_type: "Click",
                        event_action: "Broad expand",
                        event_value:
                          store.graph.currentGraphData.selectedNodes.map(
                            (node) => {
                              return {
                                id: node.feature,
                                label: node.label,
                              };
                            }
                          ),
                      })
                    );

                    store.graph.expandNetwork(
                      store.graph.currentGraphData.selectedNodes,
                      "or"
                    );
                  }}
                >
                  Broad Expand
                </Button>
                <Button
                  leftIcon={
                    <StopIcon width="12px" height="12px" strokeWidth="2px" />
                  }
                  width="100%"
                  size="sm"
                  onClick={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Left panel",
                        sub_area: "Modification tools",
                      }),
                      JSON.stringify({
                        item_type: "Button",
                      }),
                      JSON.stringify({
                        event_type: "Click",
                        event_action: "Narrow expand",
                        event_value:
                          store.graph.currentGraphData.selectedNodes.map(
                            (node) => {
                              return {
                                id: node.feature,
                                label: node.label,
                              };
                            }
                          ),
                      })
                    );

                    store.graph.expandNetwork(
                      store.graph.currentGraphData.selectedNodes,
                      "and"
                    );
                  }}
                >
                  Narrow expand
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </>
    );
  };

  return (
    <VStack
      align="center"
      direction="column"
      paddingLeft="0"
      paddingRight="0"
      id="ModifcationToolsComponent"
      width="100%"
    >
      <VStack spacing="2px" align="start" width="100%">
        {renderVisibilityOptions()}
      </VStack>
    </VStack>
  );
}

export default observer(ModificationTools);
