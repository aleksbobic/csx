import "overlayscrollbars/overlayscrollbars.css";

import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Slide,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import { FolderOpenIcon, PaintBrushIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect } from "react";

import CustomScroll from "components/feature/customscroll/CustomScroll.component";
import ModificationTools from "components/feature/leftpanel/modificationtools/ModificationTools.component";
import { RootStoreContext } from "stores/RootStore";
import StudyInfo from "components/feature/leftpanel/studyinfo/StudyInfo.component";
import ViewTools from "components/feature/leftpanel/viewtools/ViewTools.component";
import { observer } from "mobx-react";
import { schemeYlOrRd } from "d3-scale-chromatic";

function LeftPanel() {
  const store = useContext(RootStoreContext);
  const { isOpen, onOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue("white", "black");
  const tabListbgColor = useColorModeValue("white", "black");
  const tabInactiveColors = useColorModeValue("black", "white");
  const tabBorderColor = useColorModeValue("white", "black");
  const edgeColor = useColorModeValue("gray.300", "gray.900");

  const legendBackgroundColor = useColorModeValue(
    "whiteAlpha.800",
    "blackAlpha.700"
  );

  const legendBorderColor = useColorModeValue("gray.100", "gray.900");

  const toggleControlPanel = () => {
    onToggle();

    store.track.trackEvent(
      JSON.stringify({
        area: "Left panel",
      }),
      JSON.stringify({
        item_type: "Button",
      }),
      JSON.stringify({
        event_type: "Click",
        event_action: `${isOpen ? "Open" : "Close"} left panel`,
      })
    );
  };

  useEffect(() => {
    if (isOpen !== store.core.isLeftSidePanelOpen) {
      store.core.setIsLeftSidePanelOpen(isOpen);
    }
  }, [isOpen, store.core]);

  const openSliderIfClosed = () => {
    if (!isOpen) {
      onOpen();
    }
  };

  const renderColorLegend = () => {
    const selectedColorScheme =
      store.graphInstance.nodeColorScheme[store.core.currentGraph];

    let legendItems = Object.keys(
      store.graphInstance.nodeColorSchemeColors[store.core.currentGraph][
        selectedColorScheme
      ]
    );

    if (
      (["integer", "float"].includes(
        store.search.nodeTypes[
          store.graphInstance.nodeColorScheme[store.core.currentGraph]
        ]
      ) ||
        store.graphInstance.nodeColorScheme[store.core.currentGraph] ===
          "degree") &&
      legendItems.length > 8
    ) {
      return (
        <VStack width="90px" alignItems="flex-start">
          <Heading size="xs" width="100%" textAlign="left">
            Node colors
          </Heading>

          <Flex maxWidth="300px" maxHeight="300px">
            <CustomScroll>
              <Tooltip label={`Min value: ${legendItems[0]}`}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  width="90px"
                  display="inline-block"
                  position="absolute"
                  textAlign="center"
                  left="0"
                  color="blackAlpha.700"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {legendItems[0]}
                </Text>
              </Tooltip>
              <Tooltip
                label={`Max value: ${legendItems[legendItems.length - 1]}`}
              >
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  width="90px"
                  display="inline-block"
                  position="absolute"
                  textAlign="center"
                  left="0"
                  bottom="5px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {legendItems[legendItems.length - 1]}
                </Text>
              </Tooltip>
              <Box
                width="90px"
                height="300px"
                borderRadius="2px"
                bgGradient={`linear(to-b, ${String(schemeYlOrRd[9])})`}
              />
            </CustomScroll>
          </Flex>
        </VStack>
      );
    }

    if (selectedColorScheme === "node type") {
      legendItems = legendItems.filter((key) =>
        store.graph.detailGraphData.perspectivesInGraph.includes(key)
      );
    }

    const legend = legendItems.map((key) => {
      return (
        <HStack width="100%" key={key}>
          <Tag
            size="sm"
            borderRadius="full"
            variant="solid"
            backgroundColor={
              store.graphInstance.nodeColorSchemeColors[
                store.core.currentGraph
              ][selectedColorScheme][key]
            }
          />
          <Text
            size="sm"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {key}
          </Text>
        </HStack>
      );
    });

    if (legend.length === 0) {
      return null;
    }

    return (
      <Flex
        width="150px"
        maxWidth="200px"
        minWidth="50px"
        maxHeight="300px"
        overflowY="scroll"
      >
        <VStack width="100%" paddingBottom="10px">
          <Heading size="xs" width="100%" textAlign="left">
            Node colors
          </Heading>
          {legend}
        </VStack>
      </Flex>
    );
  };

  const renderEdgeColorLegend = () => {
    const selectedColorScheme =
      store.graphInstance.edgeColorScheme[store.core.currentGraph];

    let legendItems = Object.keys(
      store.graphInstance.edgeColorSchemeColors[store.core.currentGraph][
        selectedColorScheme
      ]
    );

    if (legendItems.length > 8) {
      return (
        <VStack width="90px">
          <Heading size="xs" width="100%" textAlign="left">
            Edge colors
          </Heading>

          <Flex maxWidth="300px" maxHeight="300px">
            <CustomScroll>
              <Tooltip label={`Min value: ${legendItems[0]}`}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  width="90px"
                  display="inline-block"
                  position="absolute"
                  textAlign="center"
                  left="0"
                  color="blackAlpha.700"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {legendItems[0]}
                </Text>
              </Tooltip>
              <Tooltip
                label={`Max value: ${legendItems[legendItems.length - 1]}`}
              >
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  width="90px"
                  display="inline-block"
                  position="absolute"
                  textAlign="center"
                  left="0"
                  bottom="5px"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {legendItems[legendItems.length - 1]}
                </Text>
              </Tooltip>
              <Box
                width="90px"
                height="300px"
                borderRadius="2px"
                bgGradient={`linear(to-b, ${String(schemeYlOrRd[9])})`}
              />
            </CustomScroll>
          </Flex>
        </VStack>
      );
    }

    const legend = legendItems.map((key) => {
      return (
        <HStack key={key} width="100%">
          <Tag
            size="sm"
            borderRadius="full"
            variant="solid"
            backgroundColor={
              store.graphInstance.edgeColorSchemeColors[
                store.core.currentGraph
              ][selectedColorScheme][key]
            }
          />
          <Text
            size="sm"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {selectedColorScheme === "weight" ? "Weight " : ""}
            {key}
            {selectedColorScheme === "feature types"
              ? key === "1"
                ? " feature"
                : " features"
              : ""}
          </Text>
        </HStack>
      );
    });

    if (legend.length === 0) {
      return null;
    }

    return (
      <Flex
        maxWidth="200px"
        minWidth="50px"
        width="150px"
        maxHeight="300px"
        overflowY="scroll"
      >
        <VStack width="100%" paddingBottom="10px">
          <Heading size="xs" width="100%" textAlign="left">
            Edge colors
          </Heading>
          {legend}
        </VStack>
      </Flex>
    );
  };

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const renderTabs = () => (
    <TabList
      position="absolute"
      top="0"
      paddingLeft="10px"
      paddingRight="10px"
      paddingTop="10px"
      width="60px"
      height="100%"
      zIndex="2"
      spacing="10px"
      bgColor={tabListbgColor}
    >
      <Tooltip label={isOpen ? "Minimize" : "Maximize"}>
        <IconButton
          variant="link"
          width="40px"
          height="40px"
          borderRadius="6px"
          color={tabInactiveColors}
          style={{ marginBottom: "10px", borderRadius: "10px" }}
          onClick={() => {
            toggleControlPanel();
          }}
          _hover={{ bgColor: "whiteAlpha.200" }}
          icon={
            isOpen ? (
              <ChevronDoubleLeftIcon
                style={{ width: "14px", height: "14px" }}
              />
            ) : (
              <ChevronDoubleRightIcon
                style={{ width: "14px", height: "14px" }}
              />
            )
          }
        />
      </Tooltip>
      <Tab
        width="40px"
        height="40px"
        onClick={() => {
          openSliderIfClosed();

          store.track.trackEvent(
            JSON.stringify({
              area: "Left panel",
            }),
            JSON.stringify({
              item_type: "Button",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: "Open study info",
            })
          );
        }}
        padding="8px"
        _hover={{ bgColor: "whiteAlpha.200" }}
        style={
          isOpen
            ? {
                borderRadius: "10px",
                borderColor: "transparent",
                marginBottom: "10px",
              }
            : {
                color: tabInactiveColors,
                borderColor: "transparent",
                borderRadius: "10px",
                marginBottom: "10px",
              }
        }
        _selected={{
          bgColor: isOpen ? "whiteAlpha.200" : "transparent",
          color: "blue.300",
        }}
      >
        <Tooltip label="Study Settings">
          <Box
            id="StudySettingsTab"
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <FolderOpenIcon width="20px" height="20px" />
          </Box>
        </Tooltip>
      </Tab>
      <Tab
        width="40px"
        height="40px"
        onClick={() => {
          openSliderIfClosed();

          store.track.trackEvent(
            JSON.stringify({
              area: "Left panel",
            }),
            JSON.stringify({
              item_type: "Button",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: "Open view tools",
            })
          );
        }}
        _hover={{ bgColor: "whiteAlpha.200" }}
        padding="8px"
        marginbottom="10px"
        style={
          isOpen
            ? {
                borderRadius: "10px",
                borderColor: "transparent",
                marginBottom: "10px",
              }
            : {
                color: tabInactiveColors,
                borderRadius: "10px",
                borderColor: "transparent",
                marginBottom: "10px",
              }
        }
        _selected={{
          bgColor: isOpen ? "whiteAlpha.200" : "transparent",
          color: "blue.300",
        }}
      >
        <Tooltip label="View tools">
          <Box
            id="viewsettingstab"
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <PaintBrushIcon width="18px" height="18px" />
          </Box>
        </Tooltip>
      </Tab>
      <Tab
        width="40px"
        height="40px"
        onClick={() => {
          openSliderIfClosed();

          store.track.trackEvent(
            JSON.stringify({
              area: "Left panel",
            }),
            JSON.stringify({
              item_type: "Button",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: "Open modification tools",
            })
          );
        }}
        _hover={{ bgColor: "whiteAlpha.200" }}
        padding="8px"
        marginbottom="10px"
        style={
          isOpen
            ? {
                borderRadius: "10px",
                borderColor: "transparent",
                marginBottom: "10px",
              }
            : {
                color: tabInactiveColors,
                borderRadius: "10px",
                borderColor: "transparent",
                marginBottom: "10px",
              }
        }
        _selected={{
          bgColor: isOpen ? "whiteAlpha.200" : "transparent",
          color: "blue.300",
        }}
      >
        <Tooltip label="Modification tools">
          <Box
            id="NetworkModifcationTools"
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <CubeTransparentIcon
              width="18px"
              height="18px"
              style={{ marginLeft: "-2px" }}
            />
          </Box>
        </Tooltip>
      </Tab>
    </TabList>
  );

  const renderTabPanels = () => (
    <TabPanels
      width="250px"
      height="100%"
      marginLeft="50px"
      bgColor={bgColor}
      borderRight="1px solid"
      borderColor={edgeColor}
      position="relative"
      style={{ overflowX: "hidden" }}
    >
      <TabPanel
        width="250px"
        height="100%"
        style={{ paddingLeft: 0, paddingRight: "15px" }}
      >
        <CustomScroll
          style={{
            paddingLeft: "10px",
            paddingRight: "0",
          }}
        >
          <StudyInfo />
        </CustomScroll>
      </TabPanel>
      <TabPanel
        width="250px"
        height="100%"
        style={{
          overflowX: "hidden",
          paddingLeft: 0,
          paddingRight: "15px",
        }}
      >
        <CustomScroll
          style={{
            paddingLeft: "10px",
            paddingRight: "0",
          }}
        >
          <ViewTools />
        </CustomScroll>
      </TabPanel>
      <TabPanel
        width="250px"
        height="100%"
        style={{
          overflowX: "hidden",
          paddingLeft: 0,
          paddingRight: "15px",
        }}
      >
        <CustomScroll
          style={{
            paddingLeft: "10px",
            paddingRight: "0",
          }}
        >
          <ModificationTools />
        </CustomScroll>
      </TabPanel>
    </TabPanels>
  );
  return (
    <Box
      minW="50px"
      maxW="300px"
      borderRight="1px solid"
      borderColor={edgeColor}
      position="fixed"
      left="0px"
      height="100%"
      zIndex="2"
      marginTop="60px"
      id="controlpanel"
    >
      <Tabs
        variant="line"
        orientation="vertical"
        colorScheme="blue"
        height="100%"
        borderColor={tabBorderColor}
        defaultIndex={1}
        isLazy
      >
        {renderTabs()}
        <Slide
          direction="left"
          id="controlpanelslide"
          in={isOpen}
          position="fixed"
          left="50px"
          style={{
            position: "fixed",
            width: "250px",
            bottom: "0px",
            marginTop: "60px",
          }}
        >
          {renderTabPanels()}

          {!store.core.dataIsLoading &&
            store.core.currentGraph &&
            (!["none", "component"].includes(
              store.graphInstance.selectedColorSchema
            ) ||
              !["auto"].includes(
                store.graphInstance.selectedEdgeColorSchema
              )) && (
              <HStack
                position="absolute"
                bottom="20px"
                left="320px"
                id="colorscheme"
                backgroundColor={legendBackgroundColor}
                padding="20px"
                borderRadius="10px"
                spacing="20px"
                alignItems="flex-start"
                zIndex={2}
                borderColor={legendBorderColor}
              >
                {store.core.currentGraph &&
                  !["none", "component"].includes(
                    store.graphInstance.selectedColorSchema
                  ) &&
                  renderColorLegend()}
                {store.core.currentGraph &&
                  !["auto"].includes(
                    store.graphInstance.selectedEdgeColorSchema
                  ) &&
                  renderEdgeColorLegend()}
              </HStack>
            )}
        </Slide>
      </Tabs>
    </Box>
  );
}

export default observer(LeftPanel);
