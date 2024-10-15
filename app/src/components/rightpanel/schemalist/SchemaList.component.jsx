import "overlayscrollbars/overlayscrollbars.css";

import { Box, Button, HStack, Text, Tooltip } from "@chakra-ui/react";

import CustomScroll from "components/customscroll/CustomScroll.component";
import { RootStoreContext } from "stores/RootStore";
import { useContext } from "react";

export function SchemaList() {
  const store = useContext(RootStoreContext);

  const renderSchemas = () => {
    return store.search.default_schemas[store.core.currentGraph].map(
      (schema) => {
        return (
          <Box
            minHeight="40px"
            minWidth="40px"
            key={`default_schema_${schema.id}`}
          >
            <Tooltip label={`Load ${schema.name} schema`}>
              <Button
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                }}
                _hover={{
                  backgroundColor: "blue.500",
                  color: "white",
                }}
                onClick={() => {
                  if (store.core.isOverview) {
                    store.overviewSchema.loadDefaultSchema(schema.id);
                  } else {
                    store.schema.loadDefaultSchema(schema.id);
                  }

                  store.track.trackEvent(
                    JSON.stringify({
                      area: "Schema panel",
                      sub_area: "Default schema list",
                    }),
                    JSON.stringify({
                      item_type: "Button",
                    }),
                    JSON.stringify({
                      event_type: "Click",
                      event_action: "Load default schema",
                      event_value: schema.name,
                    })
                  );
                }}
              >
                {schema.name.slice(0, 2).toUpperCase()}
              </Button>
            </Tooltip>
          </Box>
        );
      }
    );
  };

  if (store.search.default_schemas[store.core.currentGraph].length === 0) {
    return <></>;
  }

  return (
    <Box
      height="90px"
      width="100%"
      position="absolute"
      top="60px"
      left="0px"
      padding="10px"
      paddingBottom="0"
    >
      <CustomScroll style={{ paddingBottom: "20px" }}>
        <HStack
          spacing="10px"
          alignItems="flex-end"
          height="70px"
          paddingBottom="4px"
        >
          <Text
            fontSize="xs"
            position="absolute"
            top="0px"
            left="10px"
            fontWeight="bold"
            opacity="0.6"
          >
            Default schemas
          </Text>
          {renderSchemas()}
        </HStack>
      </CustomScroll>
    </Box>
  );
}
