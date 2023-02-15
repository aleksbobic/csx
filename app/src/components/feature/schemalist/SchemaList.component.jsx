import { Box, Button, HStack, Text, Tooltip } from '@chakra-ui/react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import CustomScroll from '../customscroll/CustomScroll.component';

export function SchemaList() {
    const store = useContext(RootStoreContext);

    const renderSchemas = () => {
        return store.search.default_schemas[store.core.currentGraph].map(
            schema => {
                return (
                    <Box
                        minHeight="60px"
                        minWidth="60px"
                        key={`default_schema_${schema.id}`}
                    >
                        <Tooltip label={`Load ${schema.name} schema`}>
                            <Button
                                style={{
                                    width: '60px',
                                    height: '60px',
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

    return (
        <Box
            height="110px"
            width="100%"
            position="absolute"
            top="50px"
            left="0px"
            padding="20px"
            paddingBottom="0"
        >
            <CustomScroll style={{ paddingBottom: '20px' }}>
                <HStack
                    spacing="10px"
                    alignItems="flex-end"
                    height="90px"
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
