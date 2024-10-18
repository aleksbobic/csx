import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { CameraIcon, ViewfinderCircleIcon } from "@heroicons/react/24/outline";

import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

const CanvasTools = () => {
  const store = useContext(RootStoreContext);

  return (
    <Accordion
      width="100%"
      backgroundColor="whiteAlpha.200"
      borderRadius="10px"
      allowToggle={true}
      style={{ padding: "5px 10px" }}
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
            Canvas
          </Heading>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel padding="10px 0 0">
          <VStack>
            <VStack
              backgroundColor="whiteAlpha.50"
              width="100%"
              padding="10px 10px 15px"
              borderRadius="6px"
              marginBottom="5px"
            >
              <Tooltip
                label={`Panning speed is ${store.graphInstance.panSpeed}`}
              >
                <VStack
                  spacing="10px"
                  style={{
                    width: "100%",
                    marginBottom: "20px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  <Text
                    fontSize="sm"
                    width="100%"
                    marginLeft="-15px"
                    style={{ paddingBottom: "5px" }}
                  >
                    Panning speed
                  </Text>
                  <Slider
                    defaultValue={5}
                    min={1}
                    max={9}
                    colorScheme="blue"
                    value={store.graphInstance.panSpeed}
                    onChange={(value) => {
                      store.graphInstance.setPanSpeed(value);

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
                          event_action: "Change panning speed",
                          event_value: value,
                        }
                      );
                    }}
                  >
                    <SliderMark
                      value={1}
                      fontSize="xs"
                      marginTop="10px"
                      marginLeft="-8px"
                    >
                      Slow
                    </SliderMark>
                    <SliderMark
                      value={9}
                      fontSize="xs"
                      marginTop="10px"
                      marginLeft="-16px"
                    >
                      Fast
                    </SliderMark>

                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </VStack>
              </Tooltip>
            </VStack>
            <Button
              leftIcon={
                <ViewfinderCircleIcon
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                />
              }
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
                    event_action: "Fit graph to view",
                  }
                );

                store.graphInstance.zoomToFit();
              }}
              size="sm"
              width="100%"
            >
              Fit graph to view
            </Button>
            <Button
              style={{ marginBottom: "5px" }}
              leftIcon={
                <CameraIcon
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                />
              }
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
                    event_action: "Take screenshot",
                  }
                );
                store.graphInstance.takeScreenshot();
              }}
              size="sm"
              width="100%"
            >
              Take screenshot
            </Button>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const ObservedCanvasTools = observer(CanvasTools);
export default ObservedCanvasTools;
