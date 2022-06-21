import {
    Box,
    Heading,
    HStack,
    IconButton,
    Input,
    Select,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const filterNode = ({ id, data, isConnectable }) => {
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
                    <HStack width="100%" justifyContent="space-between">
                        <Heading size="xs">Filter</Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<Close />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Filter this property">
                        <Select
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            defaultValue={data.feature}
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
                            onChange={modifyFeature}
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
                    <Tooltip label="From">
                        <Input
                            size="sm"
                            variant="filled"
                            type="Number"
                            placeholder="Min"
                            margin="0px"
                            defaultValue={data.min}
                            borderRadius="5px"
                            onChange={modifyMin}
                            opacity="0.8"
                            background="whiteAlpha.200"
                            _hover={{
                                opacity: 1
                            }}
                            _focus={{ opacity: 1 }}
                        ></Input>
                    </Tooltip>
                    <Tooltip label="To">
                        <Input
                            size="sm"
                            variant="filled"
                            type="Number"
                            placeholder="Max"
                            margin="0px"
                            defaultValue={data.max}
                            borderRadius="5px"
                            onChange={modifyMax}
                            opacity="0.8"
                            background="whiteAlpha.200"
                            _hover={{
                                opacity: 1
                            }}
                            _focus={{ opacity: 1 }}
                        ></Input>
                    </Tooltip>
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
