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
import AutoCompleteInputComponent from 'components/feature/autocompleteinput/AutoCompleteInput.component';
import { Close } from 'css.gg';
import { Handle } from 'react-flow-renderer';

const searchNode = ({ id, data, isConnectable }) => {
    const isFeatureValue = value => {
        switch (data.featureTypes[data.feature]) {
            case 'string':
                return typeof value === 'string';
            case 'list':
            case 'category':
                return data.featureHints[data.feature].values.includes(value);
            default:
                return typeof value === 'number';
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
    };

    const modifyFeature = value => {
        data.feature = value.target.value;
        data.updateActions();
    };

    const renderNewNewTextInput = () => {
        if (!isFeatureValue(data.keyphrase)) {
            modifyKeyphrase('');
        }

        return (
            <AutoCompleteInputComponent
                placeholder={`Search for a keyword in ${data.feature}`}
                getSuggestions={value =>
                    data.getSuggestions(data.feature, value)
                }
                getValue={value => modifyKeyphrase(value)}
                style={{ borderRadius: '5px' }}
                suggestionStyle={{
                    backgroundColor: 'black',
                    top: '110px',
                    position: 'fixed'
                }}
            />
        );
    };

    const renderSelectInput = () => {
        if (!isFeatureValue(data.keyphrase)) {
            modifyKeyphrase(data.featureHints[data.feature].values[0]);
        }

        return (
            <Select
                size="sm"
                variant="filled"
                margin="0px"
                borderRadius="5px"
                onChange={modifyKeyphrase}
                opacity="0.8"
                background="whiteAlpha.200"
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
        if (!isFeatureValue(data.keyphrase)) {
            modifyKeyphrase(data.featureHints[data.feature].min);
        }

        return (
            <NumberInput
                width="100%"
                size="sm"
                variant="filled"
                margin="0px"
                borderRadius="5px"
                onChange={modifyKeyphrase}
                opacity="0.8"
                background="whiteAlpha.200"
                _hover={{
                    opacity: 1
                }}
                _focus={{ opacity: 1 }}
                defaultValue={data.featureHints[data.feature].min}
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
                // return renderTextInput()
                return renderNewNewTextInput();
            case 'list':
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
                            defaultValue={data.feature}
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
