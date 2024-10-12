import {
    Box,
    Heading,
    HStack,
    IconButton,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AutoCompleteInputComponent from 'components/feature/autocompleteinput/AutoCompleteInput.component';
import { Handle } from 'react-flow-renderer';

const searchNode = ({ id, data, isConnectable }) => {
    const isFeatureValue = value => {
        switch (data.featureTypes[data.feature]) {
            case 'string':
            case 'list':
                return typeof value === 'string';
            case 'category':
                return data.featureHints[data.feature].values.includes(value);
            default:
                return (
                    typeof value === 'number' &&
                    data.featureHints[data.feature].min <= value &&
                    data.featureHints[data.feature].max >= value
                );
        }
    };

    const modifyKeyphrase = value => {
        if (typeof value === 'object') {
            if (Object.keys(value).includes('target')) {
                data.keyphrase = value.target.value;
            } else {
                data.keyphrase = value.label;
            }
        } else {
            data.keyphrase = value;
        }

        data.trackNodeAction(
            JSON.stringify({
                area: 'Advanced search',
                sub_area: 'Node',
                sub_area_id: id
            }),
            JSON.stringify({ item_type: 'Input element' }),
            JSON.stringify({
                event_type: 'Write',
                event_action: 'Enter keyphrase',
                event_value: `${data.keyphrase}`
            })
        );
    };

    const modifyFeature = value => {
        data.feature = value.target.value;
        data.keyphrase = data.getDefaultValue(value.target.value);
        data.updateActions(id);

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
                event_value: `${data.feature}`
            })
        );
    };

    const renderTextInput = () => {
        if (!isFeatureValue(data.keyphrase)) {
            modifyKeyphrase('');
        }

        return (
            <AutoCompleteInputComponent
                placeholder={`Search for a keyword in ${data.feature}`}
                getSuggestions={value =>
                    data.getSuggestions(data.feature, value)
                }
                getValue={value => {
                    data.updateSearchNodeData(id, value);
                }}
                onBlur={value => {
                    data.trackNodeAction(
                        JSON.stringify({
                            area: 'Advanced search',
                            sub_area: 'Node',
                            sub_area_id: id
                        }),
                        JSON.stringify({ item_type: 'Input element' }),
                        JSON.stringify({
                            event_type: 'Write',
                            event_action: 'Enter keyphrase',
                            event_value: value
                        })
                    );
                }}
                style={{ borderRadius: '5px' }}
                suggestionStyle={{
                    backgroundColor: 'black',
                    top: '110px',
                    position: 'fixed'
                }}
                initialValue={data.keyphrase}
                trackingLocation="Advanced Search - Search Canvas"
                trackingEventTarget={`Node - ${id} - Autocomplete Select Element - Keyphrase`}
                trackingEventFeature={data.feature}
                name="search-node"
            />
        );
    };

    const renderSelectInput = () => {
        return (
            <Select
                className="nodrag"
                size="sm"
                variant="filled"
                margin="0px"
                borderRadius="5px"
                onChange={event => {
                    data.updateSearchNodeData(id, event.target.value);

                    data.trackNodeAction(
                        JSON.stringify({
                            area: 'Advanced search',
                            sub_area: 'Node',
                            sub_area_id: id
                        }),
                        JSON.stringify({ item_type: 'Select element' }),
                        JSON.stringify({
                            event_type: 'Change selection',
                            event_action: 'Change keyphrase',
                            event_value: `${event.target.value}`
                        })
                    );
                }}
                opacity="0.8"
                background={
                    data.colorMode === 'light'
                        ? 'whiteAlpha.800'
                        : 'whiteAlpha.200'
                }
                value={data.keyphrase}
                _hover={{
                    opacity: 1
                }}
                _focus={{ opacity: 1 }}
            >
                {data.featureHints[data.feature].values.map(value => (
                    <option value={value} key={value}>
                        {value}
                    </option>
                ))}
            </Select>
        );
    };

    const renderNumberInput = () => {
        return (
            <NumberInput
                width="100%"
                size="sm"
                variant="filled"
                margin="0px"
                borderRadius="5px"
                onChange={value => {
                    data.updateSearchNodeData(id, value);
                }}
                onBlur={value => {
                    data.trackNodeAction(
                        JSON.stringify({
                            area: 'Advanced search',
                            sub_area: 'Node',
                            sub_area_id: id
                        }),
                        JSON.stringify({ item_type: 'Input element' }),
                        JSON.stringify({
                            event_type: 'Write',
                            event_action: 'Enter keyphrase',
                            event_value: value.target.value
                        })
                    );
                }}
                opacity="0.8"
                background="whiteAlpha.200"
                _hover={{
                    opacity: 1
                }}
                _focus={{ opacity: 1 }}
                value={data.keyphrase}
                min={data.featureHints[data.feature].min}
                max={data.featureHints[data.feature].max}
            >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        );
    };
    const renderInputBasedOnFeatureType = feature => {
        switch (data.featureTypes[feature]) {
            case 'string':
                return renderTextInput();
            case 'list':
                return renderTextInput();
            case 'category':
                return renderSelectInput();
            default:
                return renderNumberInput();
        }
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
                        <Heading size="xs">Search</Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<XMarkIcon />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Dataset property">
                        <Select
                            className="nodrag"
                            margin="0px"
                            variant="filled"
                            size="sm"
                            borderRadius="5px"
                            defaultValue={data.feature}
                            onChange={modifyFeature}
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
                    {renderInputBasedOnFeatureType(data.feature)}
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

export default searchNode;
