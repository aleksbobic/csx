import {
  Button,
  Center,
  Container,
  HStack,
  Image,
  Link,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { RootStoreContext } from "stores/RootStore";
import logodark from "images/logodark.png";
import logolight from "images/logolight.png";
import { observer } from "mobx-react";
import { useContext } from "react";

function Footer() {
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("black", "white");
  const store = useContext(RootStoreContext);

  return (
    <Container maxW="container.xl" justifyContent="space-evenly" display="flex">
      <Center
        paddingTop="100px"
        paddingBottom="50px"
        maxWidth="300px"
        flexDir="column"
        alignItems="start"
      >
        <HStack justifyContent="center" marginBottom="20px">
          <Image
            src={logodark}
            alt="Collaboration spotting X logo"
            height="20px"
            display={colorMode === "light" ? "none" : "block"}
          />
          <Image
            src={logolight}
            alt="Collaboration spotting X logo"
            height="20px"
            display={colorMode === "light" ? "block" : "none"}
          />{" "}
          <Text fontWeight="bold" color={textColor}>
            Collaboration Spotting X
          </Text>
        </HStack>
        <Text
          marginBottom="20px"
          textAlign="left"
          fontSize="xs"
          color={textColor}
        >
          Developed at <b>CERN</b>, Geneva, Switzerland by{" "}
          <b>Aleksandar Bobić</b> led by <b>Dr. Jean-Marie Le Goff</b> and{" "}
          <b>prof. Christian Gütl</b>.
        </Text>

        <Text
          fontStyle="italic"
          fontSize="xs"
          textAlign="left"
          marginBottom="20px"
          color={textColor}
        >
          This project was inspired by the{" "}
          <Link
            fontWeight="bold"
            textDecoration="underline"
            display="inline"
            opacity="0.75"
            target="_blank"
            href="https://collaborationspotting.web.cern.ch/"
            _hover={{ opacity: 1 }}
          >
            Collaboration Spotting project
          </Link>
          . We would like to thank the{" "}
          <Link
            fontWeight="bold"
            textDecoration="underline"
            display="inline"
            opacity="0.75"
            target="_blank"
            href="https://ercim-news.ercim.eu/en111/r-i/collaboration-spotting-a-visual-analytics-platform-to-assist-knowledge-discovery"
            _hover={{ opacity: 1 }}
          >
            Collaboration Spotting team
          </Link>{" "}
          for their contributions.
        </Text>
      </Center>
      <Center maxWidth="300px">
        <VStack alignItems="start">
          <Link
            fontWeight="bold"
            fontSize="sm"
            textDecoration="underline"
            display="inline"
            opacity="0.75"
            target="_blank"
            color={textColor}
            href="https://github.com/aleksbobic/csx"
            _hover={{ opacity: 1 }}
          >
            Github
          </Link>
          <Link
            fontWeight="bold"
            textDecoration="underline"
            fontSize="sm"
            display="inline"
            opacity="0.75"
            target="_blank"
            href="https://csxp.me"
            color={textColor}
            _hover={{ opacity: 1 }}
          >
            Webpage
          </Link>
          <Button
            variant="unstyled"
            size="sm"
            padding="0"
            margin="0"
            fontSize="sm"
            textDecoration="underline"
            opacity="0.75"
            fontWeight="bold"
            _hover={{ opacity: 1 }}
            height="21px"
            color={textColor}
            onClick={() => {
              store.track.trackEvent(
                {
                  area: "Home page",
                  sub_area: "Footer",
                },
                {
                  item_type: "Button",
                },
                {
                  event_type: "Click",
                  event_action: "Open tracking information panel",
                }
              );
              store.core.setStudyIsEmpty(false);
              store.search.setSearchIsEmpty(false);
              store.core.setShowCookieInfo(true);
            }}
          >
            Cookies & local storage
          </Button>
          <Button
            size="sm"
            variant="outline"
            marginTop="10px"
            leftIcon={
              <ArrowUturnLeftIcon
                style={{
                  width: "12px",
                  height: "12px",
                  marginTop: "-3px",
                }}
              />
            }
            onClick={() => {
              store.core.resetJoyride();

              store.track.trackEvent(
                {
                  area: "Home page",
                  sub_area: "Footer",
                },
                {
                  item_type: "Button",
                },
                {
                  event_type: "Click",
                  event_action: "Reset tutorial",
                }
              );
            }}
          >
            Reset tutorial
          </Button>
        </VStack>
      </Center>
    </Container>
  );
}

const ObservedFooter = observer(Footer);
export default ObservedFooter;
