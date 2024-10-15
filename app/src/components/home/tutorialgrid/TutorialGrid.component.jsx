import "overlayscrollbars/overlayscrollbars.css";

import {
  AspectRatio,
  Box,
  Heading,
  Link,
  SimpleGrid,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { AcademicCapIcon } from "@heroicons/react/20/solid";
import CustomScroll from "components/customscroll/CustomScroll.component";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function TutorialGrid(props) {
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("black", "white");
  const store = useContext(RootStoreContext);

  const tutorialList = [
    {
      title: "Introduction",
      url: "https://youtu.be/io-_aeOemwA",
      description: "Introduces the basic concepts of Collaboration Spotting X.",
    },
    {
      title: "Overview Graph",
      url: "https://youtu.be/io-_aeOemwA",
      description:
        "Introduces the overview or co occurrence graph and how it can be used to explore a dataset.",
    },
    {
      title: "Detail Graph",
      url: "https://youtu.be/-Dj19hOWTTU",
      description: "Introduces the basic concepts of Collaboration Spotting X.",
    },
    {
      title: "Direct Connections",
      url: "https://youtu.be/1gAXxWAasVs",
      description: "Introduces the basic concepts of Collaboration Spotting X.",
    },
    {
      title: "History & Comments",
      url: "https://youtu.be/Zuzxy2619Rk",
      description: "Introduces the basic concepts of Collaboration Spotting X.",
    },
    {
      title: "Advanced Search",
      url: "https://youtu.be/YZiKM0YyD08",
      description: "Introduces the basic concepts of Collaboration Spotting X.",
    },
    {
      title: "Studies & Presentations",
      url: "https://youtu.be/M7NGHK86SBM",
      description:
        "Demonstrated how to analyse a dataset and create a presentation.",
    },
  ];

  return (
    <VStack
      marginTop="40px"
      padding="20px 10px"
      backgroundColor={
        colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
      }
      borderRadius="12px"
    >
      <Heading
        colSpan={2}
        size="sm"
        opacity="0.76"
        width="100%"
        color={textColor}
      >
        <AcademicCapIcon
          width="18px"
          height="18px"
          style={{
            display: "inline",
            marginBottom: "-2px",
            marginRight: "10px",
          }}
        />
        Tutorials
      </Heading>

      <CustomScroll style={{ paddingLeft: "10px", paddingRight: "10px" }}>
        <SimpleGrid
          width="100%"
          columns={[1, 2, 3]}
          spacing="10px"
          padding="10px 0"
          borderRadius="12px"
          maxHeight="250px"
        >
          {tutorialList.map((tutorial, index) => (
            <AspectRatio ratio={1} key={`tutorial_${index}`}>
              <Box padding="3px" role="group">
                <Box
                  width="100%"
                  height="100%"
                  background="linear-gradient(129deg, rgba(102,74,182,1) 0%, rgba(153,115,188,1) 55%, rgba(172,109,182,1) 100%)"
                  position="absolute"
                  borderRadius="10px"
                  zIndex="0"
                  opacity="0"
                  transition="all ease-in-out 0.3s"
                  _groupHover={{ opacity: 1 }}
                ></Box>
                <Link
                  target="_blank"
                  href={tutorial.url}
                  borderRadius="8px"
                  padding="0"
                  zIndex="2"
                  height="100%"
                  onClick={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Home page",
                        sub_area: "Tutorial grid",
                      }),
                      JSON.stringify({
                        item_type: "Link",
                      }),
                      JSON.stringify({
                        event_type: "Click",
                        event_action: "Open tutorial",
                        event_value: tutorial.title,
                      })
                    );
                  }}
                  width="100%"
                  _hover={{ textDecoration: "none" }}
                >
                  <Box
                    backgroundColor={
                      colorMode === "light" ? "#e2e2e2" : "#13161d"
                    }
                    borderRadius="8px"
                    padding="10px"
                    zIndex="2"
                    height="100%"
                    width="100%"
                    boxShadow={
                      colorMode === "light"
                        ? "0 0 0 3px #64646480"
                        : "0 0 0 3px #64646480"
                    }
                    transition="all ease-in-out 0.3s"
                    _groupHover={{
                      boxShadow: "none",
                      backgroundColor:
                        colorMode === "light" ? "#e2d6e4" : "#231f2d",
                      cursor: "pointer",
                    }}
                  >
                    <VStack
                      height="100%"
                      justifyContent="space-between"
                      position="relative"
                      borderRadius="4px"
                    >
                      <CustomScroll>
                        <Text
                          textAlign="left"
                          fontWeight="bold"
                          fontSize="sm"
                          width="100%"
                          paddingLeft="10px"
                          paddingRight="20px"
                          textTransform="uppercase"
                          flexShrink="0"
                          paddingBottom="6px"
                          color={textColor}
                        >
                          {tutorial.title}
                        </Text>

                        <Text
                          width="100%"
                          heigh="100%"
                          textAlign="left"
                          fontSize="xs"
                          paddingLeft="10px"
                          paddingRight="10px"
                          color={textColor}
                          opacity="0.7"
                        >
                          {tutorial.description}
                        </Text>
                      </CustomScroll>
                    </VStack>
                  </Box>
                </Link>
              </Box>
            </AspectRatio>
          ))}
        </SimpleGrid>
      </CustomScroll>
    </VStack>
  );
}

export default observer(TutorialGrid);
