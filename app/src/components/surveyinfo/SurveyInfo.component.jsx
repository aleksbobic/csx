import {
  Box,
  Button,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { getEnv, isEnvSet } from "utils/general.utils";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { useContext } from "react";

export function SurveyInfoModal(props) {
  const store = useContext(RootStoreContext);
  const modalBackground = useColorModeValue("white", "#202533");
  const modalBorder = useColorModeValue("green.500", "green.500");

  const getSurveyLink = () => {
    if (isEnvSet("VITE_SURVEY_LINK_USER_ID")) {
      return `${getEnv("VITE_SURVEY_LINK")}&${getEnv(
        "VITE_SURVEY_LINK_USER_ID"
      )}=${store.core.userUuid}`;
    }

    return getEnv("VITE_SURVEY_LINK");
  };

  const closeSurvey = (actionText) => {
    store.track.trackEvent(
      JSON.stringify({
        area: "Graph area",
        sub_area: "Survey modal",
      }),
      JSON.stringify({
        item_type: "Button",
      }),
      JSON.stringify({
        event_type: "Click",
        event_action: "Close survey modal",
      })
    );
    props.onClose();
  };

  const renderSurveyMessageText = () =>
    isEnvSet("VITE_SURVEY_MESSAGE") ? (
      <Text fontSize="sm">{isEnvSet("VITE_SURVEY_MESSAGE")}</Text>
    ) : (
      <Text fontSize="sm">
        Hey it seems like you&#39;re enjoying using CSX! How about you fill out
        a short feedback form and enable me to make it even better?
      </Text>
    );

  return (
    <Box
      backgroundColor={modalBackground}
      borderRadius="10px"
      padding="20px"
      marginBottom="20px"
      border="2px solid"
      borderColor={modalBorder}
      style={{ marginLeft: "20px" }}
    >
      <VStack width="400px" position="relative" alignItems="flex-start">
        <HStack justifyContent="space-between" width="100%">
          <Heading size="sm" color="green.500">
            Feedback
          </Heading>
        </HStack>
        {renderSurveyMessageText()}
        <HStack justifyContent="start" width="100%">
          <Link
            fontWeight="bold"
            textDecoration="none"
            fontSize="sm"
            padding="5px 10px"
            borderRadius="5px"
            variant="solid"
            display="inline"
            color="white"
            backgroundColor="green.500"
            transform="all 0.2s ease-in"
            target="_blank"
            onClick={() => closeSurvey("Navigate to survey")}
            href={getSurveyLink()}
            _hover={{
              textDecoration: "none",
              backgroundColor: "green.600",
              color: "white",
            }}
          >
            Open the Survey! 🥳
          </Link>
          <Button
            onClick={() => closeSurvey("Close survey modal")}
            size="xs"
            opacity="0.5"
            variant="ghost"
            _hover={{ opacity: 1 }}
          >
            No thanks.
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

SurveyInfoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
