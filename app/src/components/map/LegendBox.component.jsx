// new15 - legend box to show the distribution of the data on the map
import React from "react";
import { Box } from "@chakra-ui/react";

export default function LegendBox({ distribution, isVisible }) {
  if (!isVisible) return null;

  return (
    <Box
      position="absolute"
      bottom="6em"
      left={"3em"}
      bg="blackAlpha.600"
      p="4"
      borderRadius="md"
      zIndex="2"
      display="flex"
      flexDirection="column"
      width="200px"
      maxHeight={"300px"}
      overflowY="auto"
    >
      {distribution.map((region, idx) => (
        <Box
          key={idx}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          borderBottom="1px solid white"
          color="white"
          fontSize="sm"
          py="2"
        >
          <span>{region.continent}</span>
          <span>{region.percentage}%</span>
        </Box>
      ))}
    </Box>
  );
}
