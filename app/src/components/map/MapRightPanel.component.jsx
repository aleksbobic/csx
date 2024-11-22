// new 9 - right panel for map
import React from "react";
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Switch,
} from "@chakra-ui/react";

export default function MapRightPanel({
  nodeOpacityValue,
  handleNodeOpacityChange,
  linkWidthValue,
  handleLinkWidthChange,
  linkOpacityValue,
  handleLinkOpacityChange,
  linkCurvatureValue,
  handleLinkCurvatureChange,
  isBundlingEnabled,
  handleToggleBundling,
}) {
  return (
    <Box
      position="absolute"
      right="1em"
      top={{ base: "6.5em", md: "5em" }}
      width="300px"
      bg={"blackAlpha.600"}
      p="6"
      borderRadius="md"
      boxShadow="lg"
      zIndex="1"
      display={"flex"}
      flexDir={"column"}
      gap={"2em"}
    >
      <Box display={"flex"} flexDir={"column"} justifyContent={"center"}>
        <Text fontWeight="bold" mb={"1em"} borderBottom={"1px solid gray"}>
          Nodes
        </Text>
        {/* Node Opacity Slider */}
        <Text fontWeight="bold" mb="2">
          Node Opacity
        </Text>
        <Slider
          aria-label="node-opacity-slider"
          min={0}
          max={1}
          step={0.01}
          value={nodeOpacityValue}
          onChange={handleNodeOpacityChange}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="purple.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
      <Box display={"flex"} flexDir={"column"} justifyContent={"center"}>
        <Text fontWeight="bold" mb={"1em"} borderBottom={"1px solid gray"}>
          Links
        </Text>
        {/* Link Width Slider */}
        <Text fontWeight="bold" mt="4" mb="2">
          Link Width
        </Text>
        <Slider
          aria-label="link-width-slider"
          min={0.5}
          max={5}
          step={0.1}
          value={linkWidthValue}
          onChange={handleLinkWidthChange}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="purple.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>

        {/* Link Opacity Slider */}
        <Text fontWeight="bold" mt="4" mb="2">
          Link Opacity
        </Text>
        <Slider
          aria-label="link-opacity-slider"
          min={0}
          max={1}
          step={0.01}
          value={linkOpacityValue}
          onChange={handleLinkOpacityChange}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="purple.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>

        {/* Link Curvature Slider */}
        <Text fontWeight="bold" mt="4" mb="2">
          Link Curvature
        </Text>
        <Slider
          aria-label="link-curvature-slider"
          min={0}
          max={1}
          step={0.01}
          value={linkCurvatureValue}
          onChange={handleLinkCurvatureChange}
        >
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="purple.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>

        {/*new11 Link Bundling Switch */}
        <Text fontWeight="bold" mt="4" mb="2">
          Link Bundling
        </Text>
        <Switch
          size={"lg"}
          isChecked={isBundlingEnabled}
          onChange={handleToggleBundling}
          colorScheme="purple"
        />
      </Box>
    </Box>
  );
}
