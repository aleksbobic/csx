import {
  Box,
  HStack,
  Heading,
  IconButton,
  Select,
  Tooltip,
  VStack,
} from "@chakra-ui/react";

import { Handle } from "react-flow-renderer";
import { XMarkIcon } from "@heroicons/react/24/outline";

const connectorNode = ({ id, data, isConnectable }) => {
  const modifyConnector = (value) => {
    data.connector = value.target.value;
    data.trackNodeAction(
      JSON.stringify({
        area: "Advanced search",
        sub_area: "Node",
        sub_area_id: id,
      }),
      JSON.stringify({ item_type: "Select element" }),
      JSON.stringify({
        event_type: "Change selection",
        event_value: `${value.target.value}`,
      })
    );
  };

  return (
    <>
      <Box backgroundColor="blackAlpha.300" borderRadius="8px" padding="8px">
        <Handle
          type="target"
          position="top"
          style={{
            bottom: 30,
            background: "#555",
            borderRadius: "5px",
            height: "10px",
            width: "20px",
          }}
          isConnectable={isConnectable}
        />
        <VStack alignItems="start" fontSize="14px">
          <HStack width="100%" justifyContent="space-between">
            <Heading size="xs">Connector</Heading>
            <Tooltip label="Remove node">
              <IconButton
                size="xs"
                icon={<XMarkIcon />}
                onClick={() => data.deleteNode(id)}
              />
            </Tooltip>
          </HStack>
          <Select
            className="nodrag"
            margin="0px"
            variant="filled"
            size="sm"
            defaultValue={data.connector}
            borderRadius="5px"
            onChange={modifyConnector}
            background={
              data.colorMode === "light" ? "whiteAlpha.800" : "whiteAlpha.200"
            }
            opacity="0.8"
            _hover={{
              opacity: 1,
              cursor: "pointer",
            }}
            _focus={{
              opacity: 1,
              cursor: "pointer",
            }}
          >
            <option value="or">or</option>
            <option value="and">and</option>
            {data.parents.length < 2 && <option value="not">not</option>}
          </Select>
        </VStack>
        <Handle
          type="source"
          position="bottom"
          style={{
            bottom: 0,
            background: "#555",
            marginBottom: "-5px",
            borderRadius: "5px",
            height: "10px",
            width: "20px",
          }}
          isConnectable={isConnectable}
        />
      </Box>
    </>
  );
};

export default connectorNode;
