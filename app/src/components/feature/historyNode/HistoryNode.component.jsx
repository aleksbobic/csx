import {
    Box,
    Flex,
    IconButton,
    Text,
    Tooltip,
    VStack,
    Wrap
} from '@chakra-ui/react';
import { Close, Comment } from 'css.gg';

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
                        _groupHover={{
                            opacity: 1
                        }}
                        _hover={{ backgroundColor: 'whiteAlpha.200' }}
                        icon={
                            <Close
                                style={{
                                    '--ggs': '0.7',
                                    color:
                                        (data.colorMode === 'light' ||
                                            data.isActive) &&
                                        'white'
                                }}
                            />
                        }
                    />
                </Tooltip>
            )}
            <Box
                transition="0.2s all ease-in-out"
                _groupHover={{
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
                                fontSize="xs"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                                width="100%"
                                paddingRight={data.parent && '20px'}
                                color={
                                    data.colorMode === 'light' &&
                                    data.isActive &&
                                    'white'
                                }
                                _groupHover={{ color: 'white' }}
                            >
                                {data.title}
                            </Text>
                        </Tooltip>

                        <Wrap
                            spacing="2px"
                            style={{
                                margin: 0,
                                marginTop: '3px',
                                paddingRight: !data.title && '20px'
                            }}
                        >
                            <Flex justifyContent="center">
                                <Box
                                    backgroundColor={
                                        data.isActive
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="4px"
                                    padding="2px 6px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        textAlign="center"
                                        color={
                                            data.colorMode === 'light' &&
                                            data.isActive &&
                                            'white'
                                        }
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.graphType}
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex justifyContent="center">
                                <Box
                                    backgroundColor={
                                        data.isActive
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="4px"
                                    padding="2px 6px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    color={
                                        data.colorMode === 'light' &&
                                        data.isActive &&
                                        'white'
                                    }
                                    _groupHover={{ color: 'white' }}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        textAlign="center"
                                        marginRight="2px"
                                        color="currentColor"
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.comments.length}
                                    </Text>
                                    <Comment
                                        style={{
                                            '--ggs': '0.5',
                                            marginTop: '-2px',
                                            opacity: 0.7,
                                            color: 'currentColor'
                                        }}
                                    />
                                </Box>
                            </Flex>
                            <Flex justifyContent="center">
                                <Box
                                    backgroundColor={
                                        data.isActive
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="4px"
                                    padding="2px 6px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        textAlign="center"
                                        marginRight="4px"
                                        color={
                                            data.colorMode === 'light' &&
                                            data.isActive &&
                                            'white'
                                        }
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.nodeCount}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        opacity="0.6"
                                        color={
                                            data.colorMode === 'light' &&
                                            data.isActive &&
                                            'white'
                                        }
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.nodeCount === 1
                                            ? 'node'
                                            : 'nodes'}
                                    </Text>
                                </Box>
                            </Flex>
                            <Flex justifyContent="center">
                                <Box
                                    backgroundColor={
                                        data.isActive
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="4px"
                                    padding="2px 6px"
                                    marginRight="4px"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        textAlign="center"
                                        marginRight="4px"
                                        color={
                                            data.colorMode === 'light' &&
                                            data.isActive &&
                                            'white'
                                        }
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.edgeCount}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="bold"
                                        opacity="0.6"
                                        color={
                                            data.colorMode === 'light' &&
                                            data.isActive &&
                                            'white'
                                        }
                                        _groupHover={{ color: 'white' }}
                                    >
                                        {data.edgeCount === 1
                                            ? 'edge'
                                            : 'edges'}
                                    </Text>
                                </Box>
                            </Flex>
                        </Wrap>
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
