import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Heading,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  Tooltip,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function EdgeTools() {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();

  const updateEdgeColorScheme = (value) => {
    store.graphInstance.setEdgeColorScheme(value);
    store.graph.updateLinkColor(colorMode);
    store.graph.updateNodeColor(colorMode);
  };

  const renderEdgeColorSchemeOptionElements = () => {
    const colorSchemas = [
      {
        value: "auto",
        label: "Automatic",
        tooltip: "Edges are colored based on the selected node color schema.",
      },
      {
        value: "weight",
        label: "Edge weight",
        tooltip: "Color edges based on their weight",
      },
    ];

    if (store.core.isOverview) {
      colorSchemas.push({
        value: "feature types",
        label: "Edge types",
        tooltip: "Color edges based on the number of feature types on them.",
      });
    }

    return colorSchemas.map((entry) => (
      <option value={entry.value} key={`edge_color_schema${entry.value}`}>
        {entry.label}
      </option>
    ));
  };

  const renderEdgeColorOptions = () => {
    return (
      <HStack justifyContent="space-between" width="100%" padding="5px">
        <Text fontSize="sm">Edge color: </Text>
        <Tooltip label="Select property used for edge colors.">
          <Select
            size="sm"
            value={store.graphInstance.edgeColorScheme[store.core.currentGraph]}
            onChange={(e) => {
              updateEdgeColorScheme(e.target.value);

              store.track.trackEvent(
                {
                  area: "Left panel",
                  sub_area: "VIew tools",
                },
                {
                  item_type: "Select element",
                },
                {
                  event_type: "Change selection",
                  event_action: "Change edge color",
                  event_value: e.target.value,
                }
              );
            }}
            variant="filled"
            borderRadius="6px"
            width="100px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {renderEdgeColorSchemeOptionElements()}
          </Select>
        </Tooltip>
      </HStack>
    );
  };

  return (
    <Accordion
      width="100%"
      backgroundColor="whiteAlpha.200"
      padding="5px 10px"
      borderRadius="10px"
      allowToggle={true}
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
            Edges
          </Heading>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel padding="10px 0 0">
          <VStack
            backgroundColor="whiteAlpha.50"
            width="100%"
            padding="10px 10px 15px"
            borderRadius="6px"
            style={{ marginBottom: "10px" }}
          >
            <Tooltip
              label={
                store.graphInstance.automaticEdgeOpacity
                  ? "Set custom edge opacity"
                  : "Use automatic edge opacity"
              }
            >
              <HStack
                spacing="1"
                width="100%"
                style={{ paddingBottom: "10px" }}
                justifyContent="space-between"
              >
                <Text fontSize="sm">Automatic opacity</Text>
                <Switch
                  id="edges"
                  size="sm"
                  marginRight="10px"
                  isChecked={store.graphInstance.automaticEdgeOpacity}
                  value={store.graphInstance.automaticEdgeOpacity}
                  onChange={() => {
                    store.graphInstance.toggleAutomaticEdgeOpacity();

                    store.track.trackEvent(
                      {
                        area: "Left panel",
                        sub_area: "VIew tools",
                      },
                      {
                        item_type: "Switch",
                      },
                      {
                        event_type: "Toggle",
                        event_action: `Use ${
                          store.graphInstance.automaticEdgeOpacity
                            ? "automatic"
                            : "custom"
                        } edge opacity`,
                      }
                    );
                  }}
                />
              </HStack>
            </Tooltip>
            <Tooltip
              label={`Edge opacity is ${
                store.graphInstance.customEdgeOpacity * 10
              }%`}
              isDisabled={store.graphInstance.automaticEdgeOpacity}
            >
              <VStack
                opacity={store.graphInstance.automaticEdgeOpacity ? "0.2" : "1"}
                spacing="1"
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  paddingLeft: "10px",
                  paddingRight: "20px",
                }}
              >
                <Slider
                  defaultValue={5}
                  disabled={store.graphInstance.automaticEdgeOpacity}
                  min={0}
                  max={10}
                  colorScheme={
                    store.graphInstance.automaticEdgeOpacity ? "gray" : "blue"
                  }
                  value={store.graphInstance.customEdgeOpacity}
                  onChange={(value) => {
                    store.graphInstance.setCustomEdgeOpacity(value);

                    store.track.trackEvent(
                      {
                        area: "Left panel",
                        sub_area: "VIew tools",
                      },
                      {
                        item_type: "Slider",
                      },
                      {
                        event_type: "Slide",
                        event_action: "Change edge opacity",
                        event_value: value,
                      }
                    );
                  }}
                >
                  <SliderMark
                    value={1}
                    fontSize="xs"
                    marginTop="10px"
                    marginLeft="-24px"
                  >
                    Invisible
                  </SliderMark>
                  <SliderMark
                    value={9}
                    fontSize="xs"
                    marginTop="10px"
                    marginLeft="-12px"
                  >
                    Visible
                  </SliderMark>

                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </VStack>
            </Tooltip>
          </VStack>
          <VStack
            backgroundColor="whiteAlpha.50"
            width="100%"
            padding="10px 10px 15px"
            borderRadius="6px"
            style={{ marginBottom: "10px" }}
            spacing="20px"
          >
            <Text fontSize="sm" width="100%">
              Edge curvature
            </Text>
            <Tooltip
              label={`Edge curvature is ${parseInt(
                store.graphInstance.customEdgeCurvature * 10
              )}`}
            >
              <VStack
                spacing="1"
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  paddingLeft: "10px",
                  paddingRight: "20px",
                }}
              >
                <Slider
                  defaultValue={0}
                  min={0}
                  max={10}
                  value={store.graphInstance.customEdgeCurvature * 10}
                  onChange={(value) => {
                    store.graphInstance.setCustomEdgeCurvature(value * 0.1);

                    store.track.trackEvent(
                      {
                        area: "Left panel",
                        sub_area: "VIew tools",
                      },
                      {
                        item_type: "Slider",
                      },
                      {
                        event_type: "Slide",
                        event_action: "Change edge curvature",
                        event_value: value,
                      }
                    );
                  }}
                >
                  <SliderMark
                    value={0}
                    fontSize="xs"
                    marginTop="10px"
                    marginLeft="-4px"
                  >
                    Straight
                  </SliderMark>
                  <SliderMark
                    value={10}
                    fontSize="xs"
                    marginTop="10px"
                    marginLeft="-32px"
                  >
                    Curved
                  </SliderMark>

                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </VStack>
            </Tooltip>
          </VStack>

          {store.core.isDetail && (
            <Tooltip
              label={
                store.graphInstance.edgeDirectionVisiblity
                  ? "Use undirected edges"
                  : "Use directed edges"
              }
            >
              <HStack
                spacing="1"
                width="100%"
                justifyContent="space-between"
                padding="5px"
              >
                <Text fontSize="sm">Directed edges</Text>
                <Switch
                  id="curvedEdges"
                  size="sm"
                  marginRight="10px"
                  isChecked={store.graphInstance.edgeDirectionVisiblity}
                  value={store.graphInstance.edgeDirectionVisiblity}
                  onChange={() => {
                    store.graphInstance.toggleEdgeDirectionVisiblity();

                    store.track.trackEvent(
                      {
                        area: "Left panel",
                        sub_area: "VIew tools",
                      },
                      {
                        item_type: "Switch",
                      },
                      {
                        event_type: "Toggle",
                        event_action: store.graphInstance.edgeDirectionVisiblity
                          ? "Use directed edges"
                          : "Use undirected edges",
                      }
                    );
                  }}
                />
              </HStack>
            </Tooltip>
          )}
          {renderEdgeColorOptions()}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const ObservedEdgeTools = observer(EdgeTools);
export default ObservedEdgeTools;
