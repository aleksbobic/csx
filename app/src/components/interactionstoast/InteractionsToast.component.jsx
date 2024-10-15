import {
  Button,
  Checkbox,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import contextMenuInteraction from "images/right_click.png";
import nodeInformationInteraction from "images/hover_node.png";
import { observer } from "mobx-react";
import panningInteraction from "images/pan.png";
import scrollInteraction from "images/scroll.png";
import { useContext } from "react";

function InteractionsToast(props) {
  const store = useContext(RootStoreContext);

  return (
    <VStack
      background="blackAlpha.900"
      borderRadius="10px"
      padding="20px"
      marginBottom="15px"
    >
      <Heading size="sm" color="white" width="100%" textAlign="center">
        Interactions
      </Heading>

      <Text fontSize="xs" textAlign="center" padding="0 20px 10px 20px">
        This graph represents your search results. Here are some of the ways you
        can interact with it and the elemnts in it.
      </Text>
      <HStack spacing="20px">
        <VStack width="25%">
          <Heading size="xs" width="100%">
            Zoom
          </Heading>
          <Text fontSize="xs">
            Scroll with your mouse wheel to zoom in and out the view.
          </Text>
          <Image
            src={scrollInteraction}
            height="50px"
            alt="Mouse scroll interaction"
          />
        </VStack>
        <VStack width="25%">
          <Heading size="xs" width="100%">
            Pan & Move
          </Heading>
          <Text fontSize="xs">
            Left click on the{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              canvas
            </Text>{" "}
            or a{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              node
            </Text>{" "}
            and drag your mouse to move it.
          </Text>
          <Image
            src={panningInteraction}
            height="50px"
            alt="Mouse scroll interaction"
          />
        </VStack>
        <VStack width="25%">
          <Heading size="xs" width="100%">
            Open Menu
          </Heading>
          <Text fontSize="xs">
            Right click on the{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              canvas
            </Text>{" "}
            or a{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              node
            </Text>{" "}
            to open their context menus.
          </Text>

          <Image
            src={contextMenuInteraction}
            height="50px"
            alt="Mouse scroll interaction"
          />
        </VStack>
        <VStack width="25%">
          <Heading size="xs" width="100%">
            Node & Edge Info
          </Heading>
          <Text fontSize="xs">
            Hover over a{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              node
            </Text>{" "}
            or{" "}
            <Text as="span" color="blue.500" fontWeight="bold">
              edge
            </Text>{" "}
            to view information stored on it.
          </Text>

          <Image
            src={nodeInformationInteraction}
            height="50px"
            alt="Mouse scroll interaction"
          />
        </VStack>
      </HStack>
      <HStack spacing="20px">
        <Button
          size="xs"
          backgroundColor="blue.600"
          width="80px"
          paddingLeft="4px"
          _hover={{
            backgroundColor: "blue.500",
          }}
          leftIcon={
            <XMarkIcon
              style={{
                width: "14px",
                height: "14px",
              }}
            />
          }
          onClick={() => {
            store.track.trackEvent(
              JSON.stringify({
                area: "Graph area",
                sub_area: "Interactions toast",
              }),
              JSON.stringify({
                item_type: "Button",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Close interactions toast",
              })
            );
            props.onClose();
          }}
        >
          Close
        </Button>
        <HStack spacing="10px" justifyContent="space-between">
          <Checkbox
            size="sm"
            onChange={(e) => {
              store.core.setInteractionsModalDisplay(e.target.checked);

              store.track.trackEvent(
                JSON.stringify({
                  area: "Graph area",
                  sub_area: "Interactions toast",
                }),
                JSON.stringify({
                  item_type: "Checkbox",
                }),
                JSON.stringify({
                  event_type: "Check",
                  event_action: e.target.checked
                    ? "Never show again"
                    : "Show again",
                })
              );
            }}
          >
            Never show again
          </Checkbox>
        </HStack>
      </HStack>
    </VStack>
  );
}

InteractionsToast.propTypes = {
  onClose: PropTypes.func,
};

export default observer(InteractionsToast);
