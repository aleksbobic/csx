import {
  Box,
  HStack,
  Heading,
  IconButton,
  Input,
  Text,
  Tooltip,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";

import CustomScroll from "components/customscroll/CustomScroll.component";
import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import SchemaConfig from "components/schemaconfig/SchemaConfig.component";
import { observer } from "mobx-react";

function DatasetConfigSchema(props) {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();
  const [schemaName, setSchemaName] = useState("");

  const renderDefultSchemas = () => {
    return store.fileUpload.fileUploadData.schemas[props.graphType].map(
      (schema) => (
        <HStack
          height="40px"
          width="100%"
          key={`schema_${schema.id}`}
          backgroundColor={
            colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
          }
          padding="10px"
          justifyContent="space-between"
          marginBottom="8px"
          borderRadius="8px"
        >
          <Tooltip label={schema.name}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {schema.name}
            </Text>
          </Tooltip>
          )
          <Tooltip label={`Delete ${schema.name} schema`}>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={() => {
                store.track.trackEvent(
                  {
                    area: "Home page",
                    sub_area: "Dataset upload modal",
                  },
                  {
                    item_type: "Button",
                  },
                  {
                    event_type: "Click",
                    event_action: "Delete default schema",
                    event_value: schema.name,
                  }
                );

                store.fileUpload.deleteDefaultSchema(
                  schema.id,
                  props.graphType
                );
              }}
              icon={<XMarkIcon style={{ width: "14px", height: "14px" }} />}
            />
          </Tooltip>
        </HStack>
      )
    );
  };

  return (
    <>
      <Heading size="xs" marginBottom="10px" opacity="0.6">
        Default {props.graphType} schemas
      </Heading>
      <HStack height="100%" width="100%" paddingBottom="20px" spacing="10px">
        <VStack
          height="100%"
          maxWidth="180px"
          minWidth="180px"
          backgroundColor={
            colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
          }
          borderRadius="10px"
        >
          <CustomScroll style={{ padding: "10px 10px 0 10px" }}>
            {renderDefultSchemas()}
            <HStack
              height="40px"
              width="100%"
              backgroundColor={
                colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
              }
              padding="10px"
              justifyContent="space-between"
              marginBottom="8px"
              borderRadius="8px"
            >
              <Input
                fontSize="sm"
                size="xs"
                variant="filled"
                fontWeight="bold"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                placeholder="Schema name"
                borderRadius="4px"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
              ></Input>
              <Tooltip label="Add default schema">
                <IconButton
                  variant="ghost"
                  size="xs"
                  isDisabled={
                    schemaName === "" ||
                    (props.graphType === "overview" &&
                      !store.overviewSchema.schemaHasLink)
                  }
                  onClick={() => {
                    store.track.trackEvent(
                      {
                        area: "Home page",
                        sub_area: "Dataset upload modal",
                      },
                      {
                        item_type: "Button",
                      },
                      {
                        event_type: "Click",
                        event_action: `Save default schema for ${props.graphType} graph`,
                        event_value: schemaName,
                      }
                    );

                    store.fileUpload.addDefaultSchema(
                      schemaName,
                      props.graphType
                    );
                    setSchemaName("");
                  }}
                  icon={
                    <PlusIcon
                      style={{
                        width: "14px",
                        height: "14px",
                      }}
                    />
                  }
                />
              </Tooltip>
            </HStack>
          </CustomScroll>
        </VStack>
        <Box
          height="100%"
          width="100%"
          backgroundColor={
            colorMode === "light" ? "blackAlpha.300" : "blackAlpha.500"
          }
          borderRadius="10px"
        >
          <SchemaConfig graphType={props.graphType} />
        </Box>
      </HStack>
    </>
  );
}

DatasetConfigSchema.propTypes = {
  graphType: PropTypes.string,
};

const ObservedDatasetConfigSchema = observer(DatasetConfigSchema);
export default ObservedDatasetConfigSchema;
