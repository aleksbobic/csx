import {
    Box,
    Heading,
    HStack,
    IconButton,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Handle } from 'react-flow-renderer';

const datasetNode = ({ id, data, isConnectable }) => {
    return (
        <>
            <Box
                backgroundColor="blackAlpha.300"
                borderRadius="8px"
                padding="8px"
            >
                <VStack alignItems="start" fontSize="14px">
                    <HStack width="100%" justifyContent="space-between">
                        <Heading size="xs">
                            {data.dataset.charAt(0).toUpperCase() +
                                data.dataset.slice(1)}{' '}
                            dataset
                        </Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<XMarkIcon />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                </VStack>
                <Handle
                    type="source"
                    position="bottom"
                    style={{
                        bottom: 0,
                        background: '#555',
                        marginBottom: '-5px',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
            </Box>
        </>
    );
};

export default datasetNode;
