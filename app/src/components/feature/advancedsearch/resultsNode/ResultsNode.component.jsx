import {
    Box,
    Button,
    Heading,
    HStack,
    IconButton,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';

import React from 'react';
import { Handle } from 'react-flow-renderer';

const resultsNode = ({ id, data, isConnectable }) => {
    return (
        <>
            <Box
                backgroundColor="blackAlpha.300"
                borderRadius="8px"
                padding="8px"
            >
                <Handle
                    type="target"
                    position="top"
                    style={{
                        bottom: 30,
                        background: '#555',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
                <VStack alignItems="start" fontSize="14px">
                    <HStack width="100%" justifyContent="space-between">
                        <Heading size="xs">Results node</Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<XMarkIcon />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Data flowing into this node is visualised in the graph.">
                        <Button
                            variant="solid"
                            size="sm"
                            rightIcon={<PlayIcon />}
                            onClick={() => data.runWorkflow(id)}
                        >
                            Run workflow
                        </Button>
                    </Tooltip>
                </VStack>
            </Box>
        </>
    );
};

export default resultsNode;
