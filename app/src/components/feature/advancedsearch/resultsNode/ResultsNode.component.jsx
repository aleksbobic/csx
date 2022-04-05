import { Box, Button, Heading, Tooltip, VStack } from '@chakra-ui/react';
import { PlayButton } from 'css.gg';
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
                    <Heading size="xs">Results node</Heading>
                    <Tooltip label="Data flowing into this node is visualised in the graph.">
                        <Button
                            variant="solid"
                            size="sm"
                            rightIcon={<PlayButton />}
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
