import {
    Box,
    Heading,
    HStack,
    IconButton,
    Input,
    Select,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const keywordExtractionNode = ({ id, data, isConnectable }) => {
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
                    <HStack width="100%" justifyContent="space-between">
                        <Heading size="xs">Extract keywords</Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<Close />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Dataset property">
                        <Select
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            onChange={modifyFeature}
                            background="whiteAlpha.200"
                            opacity="0.8"
                            _hover={{
                                opacity: 1,
                                cursor: 'pointer'
                            }}
                            _focus={{
                                opacity: 1,
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
                    <Text fontSize="sm">New keyword column name: </Text>
                    <Input
                        size="sm"
                        variant="filled"
                        type="text"
                        placeholder="New feature name"
                        margin="0px"
                        borderRadius="5px"
                        onChange={modifyFeatureName}
                        opacity="0.8"
                        background="whiteAlpha.200"
                        _hover={{
                            opacity: 1
                        }}
                        _focus={{ opacity: 1 }}
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
