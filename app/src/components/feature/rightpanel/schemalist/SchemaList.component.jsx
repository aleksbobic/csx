import {
    Box,
    Button,
    HStack,
    SkeletonCircle,
    Text,
    Tooltip
} from '@chakra-ui/react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import CustomScroll from '../../customscroll/CustomScroll.component';
import { observer } from 'mobx-react';

function SchemaList() {
    const store = useContext(RootStoreContext);

    const renderSchemas = () => {
        return store.search.default_schemas[store.core.currentGraph].map(
            schema => {
                return (
                    <Box
                        minHeight="40px"
                        minWidth="40px"
                        key={`default_schema_${schema.id}`}
                    >
                        <Tooltip label={`Load ${schema.name} schema`}>
                            <Button
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px'
                                }}
                                _hover={{
                                    backgroundColor: 'blue.500',
                                    color: 'white'
                                }}
                                onClick={() => {
                                    if (store.core.isOverview) {
                                        store.overviewSchema.loadDefaultSchema(
                                            schema.id
                                        );
                                    } else {
                                        store.schema.loadDefaultSchema(
                                            schema.id
                                        );
                                    }

                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Schema panel',
                                            sub_area: 'Default schema list'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Load default schema',
                                            event_value: schema.name
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

    const renderRecommendedSchemas = () => {
        if (store.core.dataIsLoading) {
            return [1, 3, 4].map(entry => (
                <Box
                    minHeight="40px"
                    minWidth="40px"
                    key={`default_schema_${entry}`}
                    borderRadius="8px"
                    padding="1px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <SkeletonCircle size="20px" />
                </Box>
            ));
        }

        const recShemaData = store.core.isOverview
            ? store.overviewSchema.recommendedSchemas
            : store.schema.recommendedSchemas;

        return recShemaData.map(schema => {
            return (
                <Box
                    minHeight="40px"
                    minWidth="40px"
                    key={`default_schema_${schema.id}`}
                    background="linear-gradient(152deg, rgba(3,25,119,1) 0%, rgba(66,154,226,1) 100%)"
                    borderRadius="8px"
                    padding="1px"
                >
                    <Tooltip label={`Load ${schema.name} schema`}>
                        <Button
                            background="blackAlpha.800"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px'
                            }}
                            _hover={{
                                backgroundColor: 'blue.500',
                                color: 'white'
                            }}
                            onClick={() => {
                                if (store.core.isOverview) {
                                    store.overviewSchema.loadRecommendedSchema(
                                        schema.id
                                    );
                                } else {
                                    store.schema.loadRecommendedSchema(
                                        schema.id
                                    );
                                }

                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Schema panel',
                                        sub_area: 'Recommended schema list'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Button'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Load recommended schema',
                                        event_value: JSON.stringify({
                                            node: schema.node,
                                            properties: schema.properties,
                                            edges: schema.edges
                                        })
                                    })
                                );
                            }}
                        >
                            {schema.name.slice(0, 2).toUpperCase()}
                        </Button>
                    </Tooltip>
                </Box>
            );
        });
    };

    if (
        store.search.default_schemas[store.core.currentGraph].length === 0 &&
        ((store.core.isOverview &&
            store.overviewSchema.recommendedSchemas.length === 0) ||
            store.schema.recommendedSchemas.length === 0)
    ) {
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
            <CustomScroll style={{ paddingBottom: '20px' }}>
                <HStack
                    spacing="10px"
                    alignItems="flex-end"
                    height="70px"
                    paddingBottom="4px"
                >
                    {store.search.currentDataset === 'openalex' && (
                        <HStack
                            spacing="10px"
                            alignItems="flex-end"
                            height="70px"
                            padding="0"
                            margin="0"
                            position="relative"
                            paddingRight="10px"
                        >
                            <Text
                                fontSize="xs"
                                position="absolute"
                                top="0px"
                                left="10px"
                                fontWeight="bold"
                                opacity="0.6"
                            >
                                Recommended schemas
                            </Text>
                            {renderRecommendedSchemas()}
                        </HStack>
                    )}

                    {store.search.default_schemas[store.core.currentGraph]
                        .length > 0 && (
                        <HStack
                            spacing="10px"
                            alignItems="flex-end"
                            height="70px"
                            minWidth="150px"
                            padding="0"
                            margin="0"
                            position="relative"
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
                    )}
                </HStack>
            </CustomScroll>
        </Box>
    );
}

export default observer(SchemaList);
