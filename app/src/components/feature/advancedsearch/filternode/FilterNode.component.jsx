import { Box, Heading, Input, Select, Tooltip, VStack } from '@chakra-ui/react';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const filterNode = ({ data, isConnectable }) => {
    const modifyMin = value => {
        data.min = value.target.value;
    };

    const modifyMax = value => {
        data.max = value.target.value;
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
                <VStack alignItems="start" fontSize="14px">
                    <Heading size="xs">Between</Heading>
                    <Tooltip label="Dataset property">
                        <Select
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            defaultValue={data.feature}
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
                    <Input
                        size="sm"
                        variant="filled"
                        type="Number"
                        placeholder="Min"
                        margin="0px"
                        defaultValue={data.min}
                        borderRadius="5px"
                        onChange={modifyMin}
                        background="blackAlpha.500"
                        _hover={{ background: 'blackAlpha.600' }}
                        _focus={{ background: 'blackAlpha.600' }}
                    ></Input>

                    <Input
                        size="sm"
                        variant="filled"
                        type="Number"
                        placeholder="Max"
                        margin="0px"
                        defaultValue={data.max}
                        borderRadius="5px"
                        onChange={modifyMax}
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

export default filterNode;
