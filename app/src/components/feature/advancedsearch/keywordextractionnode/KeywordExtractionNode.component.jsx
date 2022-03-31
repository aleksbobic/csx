import {
    Box,
    Heading,
    Input,
    Select,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const keywordExtractionNode = ({ data, isConnectable }) => {
    const modifyFeatureName = value => {
        data.newFeatureName = value.target.value;
    };

    const modifyFeature = value => {
        data.feature = value.target.value;
    };

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
                    <Heading size="xs">Extract keywords from:</Heading>
                    <Tooltip label="Dataset property">
                        <Select
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            background="blackAlpha.500"
                            onChange={modifyFeature}
                            _hover={{
                                background: 'blackAlpha.600',
                                cursor: 'pointer'
                            }}
                        >
                            {data.features.map((feature, index) => (
                                <option
                                    key={`search_node_${feature}_${index}`}
                                    value={feature}
                                >
                                    {feature}
                                </option>
                            ))}
                        </Select>
                    </Tooltip>
                    <Text fontSize="sm">
                        Assing keywords to new feature named:{' '}
                    </Text>
                    <Input
                        size="sm"
                        variant="filled"
                        type="text"
                        placeholder="New feature name"
                        margin="0px"
                        borderRadius="5px"
                        onChange={modifyFeatureName}
                        background="blackAlpha.500"
                        _hover={{ background: 'blackAlpha.600' }}
                        _focus={{ background: 'blackAlpha.600' }}
                    ></Input>
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

export default keywordExtractionNode;
