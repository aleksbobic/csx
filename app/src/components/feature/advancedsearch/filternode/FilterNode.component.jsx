import {
    Box,
    Heading,
    HStack,
    IconButton,
    NumberInput,
    NumberInputField,
    Select,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Handle } from 'react-flow-renderer';

const filterNode = ({ id, data, isConnectable }) => {
    const modifyMin = value => {
        data.updateFilterNodeData(id, 'min', value);

        data.trackNodeAction(
            JSON.stringify({
                area: 'Advanced search',
                sub_area: 'Node',
                sub_area_id: id
            }),
            JSON.stringify({ item_type: 'Input element' }),
            JSON.stringify({
                event_type: 'Write',
                event_action: 'Set min value',
                event_value: `${value}`
            })
        );
    };

    const modifyMax = value => {
        data.updateFilterNodeData(id, 'max', value);

        data.trackNodeAction(
            JSON.stringify({
                area: 'Advanced search',
                sub_area: 'Node',
                sub_area_id: id
            }),
            JSON.stringify({ item_type: 'Input element' }),
            JSON.stringify({
                event_type: 'Write',
                event_action: 'Set max value',
                event_value: `${value}`
            })
        );
    };

    const modifyFeature = value => {
        data.feature = value.target.value;
        data.updateFilterNodeValues(id, value.target.value);

        data.trackNodeAction(
            JSON.stringify({
                area: 'Advanced search',
                sub_area: 'Node',
                sub_area_id: id
            }),
            JSON.stringify({ item_type: 'Select element' }),
            JSON.stringify({
                event_type: 'Change selection',
                event_action: 'Change node feature',
                event_value: `${value.target.value}`
            })
        );
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
                                icon={<XMarkIcon />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Filter this property">
                        <Select
                            className="nodrag"
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            value={data.feature}
                            background={
                                data.colorMode === 'light'
                                    ? 'whiteAlpha.800'
                                    : 'whiteAlpha.200'
                            }
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
                        <NumberInput
                            borderRadius="5px"
                            opacity="0.8"
                            background="whiteAlpha.200"
                            _hover={{
                                opacity: 1
                            }}
                            _focus={{ opacity: 1 }}
                            margin="0px"
                            variant="filled"
                            onChange={modifyMin}
                            value={data.min}
                            size="sm"
                            min={data.min_value}
                            max={data.max}
                        >
                            <NumberInputField borderRadius="5px" />
                        </NumberInput>
                    </Tooltip>
                    <Tooltip label="To">
                        <NumberInput
                            borderRadius="5px"
                            opacity="0.8"
                            background="whiteAlpha.200"
                            _hover={{
                                opacity: 1
                            }}
                            _focus={{ opacity: 1 }}
                            margin="0px"
                            variant="filled"
                            onChange={modifyMax}
                            value={data.max}
                            size="sm"
                            min={data.min}
                            max={data.max_value}
                        >
                            <NumberInputField borderRadius="5px" />
                        </NumberInput>
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
