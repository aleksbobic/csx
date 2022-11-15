import {
    Box,
    Flex,
    HStack,
    IconButton,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';

import { Handle } from 'react-flow-renderer';

const historyNode = ({ id, data, isConnectable }) => {
    return (
        <Box width="100%" height="100%" role="group">
            {data.parent && (
                <Tooltip label="Remove history item and its children">
                    <IconButton
                        size="xs"
                        variant="ghost"
                        position="absolute"
                        top="5px"
                        right="5px"
                        opacity="0"
                        transition="0.2s all ease-in-out"
                        zIndex="2"
                        onClick={e => {
                            e.preventDefault();
                            data.deleteNode(id);
                        }}
                        _groupHover={{ opacity: 1 }}
                        icon={<Close style={{ '--ggs': '0.7' }} />}
                    />
                </Tooltip>
            )}
            <Box
                transition="0.2s all ease-in-out"
                _hover={{
                    cursor: data.isActive ? 'default' : 'pointer',
                    backgroundColor: data.isActive ? 'default' : '#3182ce'
                }}
                borderRadius="6px"
                height="100%"
                width="100%"
                zIndex="1"
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
                        <Tooltip label={data.title}>
                            <Text
                                fontWeight="bold"
                                fontSize="sm"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                                width="100%"
                                paddingRight={data.parent && '20px'}
                            >
                                {data.title}
                            </Text>
                        </Tooltip>
                        <HStack
                            width="100%"
                            style={{ marginTop: 0 }}
                            opacity={data.isActive ? '1' : '0.7'}
                        >
                            <Text fontSize="xs">Graph type:</Text>
                            <Text fontWeight="bold" fontSize="xs">
                                {data.graphType}
                            </Text>
                        </HStack>
                        <HStack
                            width="100%"
                            style={{ marginTop: 0 }}
                            opacity={data.isActive ? '1' : '0.7'}
                        >
                            <Text fontSize="xs">Comment count:</Text>
                            <Text fontWeight="bold" fontSize="xs">
                                {data.comments.length}
                            </Text>
                        </HStack>
                    </VStack>
                    <Text
                        fontSize="8px"
                        opacity={data.isActive ? '0.7' : '0.5'}
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
        </Box>
    );
};

export default historyNode;
