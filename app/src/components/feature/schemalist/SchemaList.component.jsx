import { Box, Button, Divider, HStack, Text, Tooltip } from '@chakra-ui/react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { MathPlus } from 'css.gg';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import CustomScroll from '../customscroll/CustomScroll.component';

export function SchemaList() {
    const store = useContext(RootStoreContext);

    const renderSchemaItem = name => {
        return (
            <Tooltip label={`Load ${name} schema`}>
                <Box minHeight="60px" minWidth="60px">
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
                    >
                        {name.slice(0, 2).toUpperCase()}
                    </Button>
                </Box>
            </Tooltip>
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
                <HStack spacing="10px">
                    <HStack
                        width="210px"
                        height="90px"
                        paddingBottom="10px"
                        alignItems="flex-end"
                    >
                        <Text
                            fontSize="xs"
                            position="absolute"
                            top="0px"
                            left="10px"
                            fontWeight="bold"
                            opacity="0.6"
                        >
                            Default
                        </Text>
                        {renderSchemaItem('abcdef')}
                        {renderSchemaItem('bcdef')}
                        {renderSchemaItem('cdef')}
                    </HStack>
                    <Divider orientation="vertical" height="70px" />
                    <HStack
                        width="auto"
                        height="90px"
                        paddingBottom="10px"
                        alignItems="flex-end"
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
                            Custom
                        </Text>
                        <Tooltip label="Store current schema">
                            <Box minHeight="60px" minWidth="60px">
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
                                >
                                    <MathPlus />
                                </Button>
                            </Box>
                        </Tooltip>
                    </HStack>
                </HStack>
            </CustomScroll>
        </Box>
    );
}
