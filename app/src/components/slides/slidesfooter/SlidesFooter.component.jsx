import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { HStack, IconButton, Text } from "@chakra-ui/react";
import { PropTypes, observer } from "mobx-react";

import { RootStoreContext } from "stores/RootStore";
import queryString from "query-string";
import { useContext } from "react";

function SlidesFooter({ revealInstance, currentSlide }) {
  const store = useContext(RootStoreContext);

  return (
    <HStack
      width="100%"
      height="35px"
      position="absolute"
      left="0px"
      bottom="20px"
      zIndex="3"
      padding="0 20px"
      justifyContent="space-between"
    >
      <Text fontSize="md" fontWeight="bold">
        {currentSlide + 1} / {store.present.slides.length}
      </Text>
      <HStack>
        <IconButton
          opacity="0.5"
          variant="ghost"
          _hover={{ opacity: 1 }}
          onClick={() => {
            store.present.generatePPT();

            store.track.trackEvent(
              {
                area: "Presentation page",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                event_action: "Generate presentation file for study",
                event_value: queryString.parse(location.search).study,
              }
            );
          }}
          icon={<ArrowDownTrayIcon width="20px" height="20px" />}
        />
        <IconButton
          opacity="0.5"
          variant="ghost"
          _hover={{ opacity: 1 }}
          onClick={() => {
            revealInstance.next();

            store.track.trackEvent(
              {
                area: "Presentation page",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                event_action: "Next slide",
              }
            );
          }}
          icon={<ChevronDownIcon width="20px" height="20px" />}
        />
        <IconButton
          opacity="0.5"
          variant="ghost"
          _hover={{ opacity: 1 }}
          onClick={() => {
            revealInstance.prev();

            store.track.trackEvent(
              {
                area: "Presentation page",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                event_action: "Previous slide",
              }
            );
          }}
          icon={<ChevronUpIcon width="20px" height="20px" />}
        />
      </HStack>
    </HStack>
  );
}

SlidesFooter.propTypes = {
  revealInstance: PropTypes.revealInstance,
  currentSlide: PropTypes.number,
};

const ObservedSlidesFooter = observer(SlidesFooter);
export default ObservedSlidesFooter;
