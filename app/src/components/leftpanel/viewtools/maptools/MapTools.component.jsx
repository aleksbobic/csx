// new18 - map tools component for the left panel

import React from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  VStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
} from "@chakra-ui/react";

function MapTools({
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
  isClusteringEnabled,
  handleToggleClustering,
  clusterRadius,
  handleClusterRadiusChange,
  isVisible,
  toggleLegend,
  hideNoLocationNodes, // NEW20: hide nodes without location
  handleToggleHideNoLocationNodes, // NEW20: hide nodes without location
}) {
  return (
    <Accordion
      width="100%"
      backgroundColor="whiteAlpha.200"
      padding="5px 10px 0"
      borderRadius="10px"
      allowToggle={true}
      style={{ marginTop: "15px" }}
    >
      <AccordionItem>
        <AccordionButton
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: "10px",
            textAlign: "left",
            borderRadius: "10px",
            outline: "none",
            boxShadow: "none",
          }}
        >
          <Text size="sm" fontWeight="bold" width="100%">
            Map Tools
          </Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel padding="0">
          <VStack
            backgroundColor="whiteAlpha.50"
            width="100%"
            padding="16px"
            borderRadius="6px"
            spacing={4}
            marginBottom={"6px"}
          >
            {/* Node Opacity */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
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
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Link Width */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
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
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Link Opacity */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
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
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Link Curvature */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
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
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Link Bundling */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
                Link Bundling
              </Text>
              <Switch
                size="sm"
                isChecked={isBundlingEnabled}
                onChange={handleToggleBundling}
              />
            </Box>

            {/* Clustering */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
                Clustering
              </Text>
              <Switch
                size="sm"
                isChecked={isClusteringEnabled}
                onChange={handleToggleClustering}
              />
              <Text mt={2} fontSize="sm" fontWeight="semibold">
                Cluster Radius
              </Text>
              <Slider
                aria-label="cluster-radius-slider"
                min={10}
                max={100}
                step={5}
                value={clusterRadius}
                onChange={handleClusterRadiusChange}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Legend Visibility */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
                Node Distribution
              </Text>
              <Switch size="sm" isChecked={isVisible} onChange={toggleLegend} />
            </Box>
            {/* // hide nodes without location  */}
            <Box w="100%">
              <Text fontSize="sm" fontWeight="semibold">
                Hide Nodes Without Location
              </Text>
              <Switch
                size="sm"
                isChecked={hideNoLocationNodes}
                onChange={handleToggleHideNoLocationNodes}
              />
            </Box>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default MapTools;
