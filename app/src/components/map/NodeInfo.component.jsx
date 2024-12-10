import React from "react";
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  IconButton,
  Text,
  Button,
} from "@chakra-ui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// new9 - NodeInfoComponent to display node details in a popover
export default function NodeInfoComponent({
  node,
  isOpen,
  onClose,
  position,
  showDirectConnections, // NEW16: Pass the function to show direct connections
}) {
  if (!isOpen || !node) return null;
  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Box display="none" />
      </PopoverTrigger>
      <PopoverContent
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <PopoverBody>
          {node && (
            <Box
              display={"flex"}
              flexDir={"row-reverse"}
              justifyContent={"start"}
              alignItems={"start"}
              gap={"3px"}
            >
              <Box display={"flex"} justifyContent={"end"}>
                <IconButton
                  icon={
                    <XMarkIcon
                      style={{
                        color: "white",
                      }}
                    />
                  }
                  size={"xs"}
                  colorScheme="red"
                  onClick={onClose} // Trigger onClose to close the popover
                  aria-label="Close popover"
                  borderRadius={"full"}
                />
              </Box>
              <Box flex={"auto"}>
                <Box
                  display={"flex"}
                  flexDir={"row"}
                  gap={"3px"}
                  textTransform={"capitalize"}
                >
                  {" "}
                  <Text color={"purple.400"}>label: </Text>
                  <Text>{node.label}</Text>
                </Box>
                <Box
                  textTransform={"capitalize"}
                  display={"flex"}
                  flexDir={"row"}
                  gap={"3px"}
                >
                  <Text color={"purple.400"}>feature: </Text>
                  <Text>{node.feature}</Text>
                </Box>
                <Box
                  textTransform={"capitalize"}
                  display={"flex"}
                  flexDir={"row"}
                  gap={"3px"}
                >
                  <Text color={"purple.400"}>frequency: </Text>
                  <Text>{node.frequency}</Text>
                </Box>
                <Box
                  textTransform={"capitalize"}
                  display={"flex"}
                  flexDir={"row"}
                  gap={"3px"}
                >
                  <Text color={"purple.400"}>searchResultCount: </Text>{" "}
                  <Text>{node.searchResultCount}</Text>
                </Box>
                <Button
                  mt={2}
                  colorScheme="purple"
                  size="sm"
                  onClick={() => showDirectConnections(node.id)}
                >
                  Show Direct Connections
                </Button>
              </Box>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
