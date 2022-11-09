import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { Handle } from 'react-flow-renderer';

const historyNode = ({ id, data, isConnectable }) => {
    return (
        <>
            <Box
                transition="0.1s all ease-in-out"
                _hover={{
                    cursor: data.isActive ? 'default' : 'pointer',
                    backgroundColor: data.isActive ? 'default' : '#3182ce33'
                }}
                borderRadius="6px"
                height="100%"
                width="100%"
                onClick={() => data.loadStudy(id)}
            >
                <Handle
                    type="target"
                    position="top"
                    style={{
                        borderRadius: '5px',
                        height: 0,
                        borderWidth: '1px',
                        width: '20px',
                        top: '0px',
                        opacity: 0
                    }}
                    isConnectable={isConnectable}
                />
                <Flex alignItems="center" fontSize="14px" padding="10px">
                    <VStack width="100%" height="100%">
                        <HStack width="100%">
                            <Text fontSize="xs">Action:</Text>
                            <Text
                                fontWeight="bold"
                                fontSize="xs"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                            >
                                {data.action}
                            </Text>
                        </HStack>
                        <HStack width="100%" style={{ marginTop: 0 }}>
                            <Text fontSize="xs">Graph type:</Text>
                            <Text fontWeight="bold" fontSize="xs">
                                {data.graphType}
                            </Text>
                        </HStack>
                        <HStack width="100%" style={{ marginTop: 0 }}>
                            <Text fontSize="xs">Comment count:</Text>
                            <Text fontWeight="bold" fontSize="xs">
                                {data.comments.length}
                            </Text>
                        </HStack>
                    </VStack>
                    <Text
                        fontSize="8px"
                        opacity="0.5"
                        bottom="5px"
                        position="absolute"
                    >
                        {data.actionTime}
                    </Text>
                </Flex>
                <Handle
                    type="source"
                    position="bottom"
                    style={{
                        bottom: 0,
                        background: 'transparent',
                        borderRadius: '5px',
                        height: 0,
                        borderWidth: '1px',
                        width: '20px',
                        opacity: 0
                    }}
                    isConnectable={isConnectable}
                />
            </Box>
        </>
    );
};

export default historyNode;
