import {
    Box,
    Center,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    FormLabel,
    Heading,
    HStack,
    NumberInput,
    NumberInputField,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Select,
    Text,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function NodeFilter(props) {
    const store = useContext(RootStoreContext);

    const [isDemo, setIsDemo] = useState(false);
    const [title, setTitle] = useState(props.chart.title);

    const { colorMode } = useColorMode();
    const [filterProperty, setFilterProperty] = useState(
        props?.chart?.filter_property ? props?.chart?.filter_property : 'degree'
    );

    useEffect(() => {
        if (props.demoData.length > 0) {
            setIsDemo(true);
            setSliderMaxTooltipValue(props.demoData[0].max);
            setSliderMaxValue(props.demoData[0].max);
        } else if (filterProperty === 'degree') {
            setIsDemo(false);
            setSliderMinTooltipValue(0);
            setSliderMaxTooltipValue(
                store.graph.currentGraphData.meta.maxDegree
            );
            setSliderMaxValue(store.graph.currentGraphData.meta.maxDegree);
        } else {
            setIsDemo(false);
            setSliderMinTooltipValue(
                store.search.searchHints[filterProperty].min
            );
            setSliderMaxTooltipValue(
                store.search.searchHints[filterProperty].max
            );
            setSliderMaxValue(store.search.searchHints[filterProperty].max);
        }
    }, [
        filterProperty,
        props.demoData,
        props.demoData.length,
        props.filterProperty,
        store.graph.currentGraphData.meta.maxDegree,
        store.search.searchHints
    ]);

    const [sliderMinTooltipValue, setSliderMinTooltipValue] = useState(0);
    const [sliderMaxTooltipValue, setSliderMaxTooltipValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );

    const [sliderMaxValue, setSliderMaxValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );

    useEffect(() => {
        if (props.demoData.length === 0) {
            setSliderMaxValue(store.graph.currentGraphData.meta.maxDegree);
            setSliderMaxTooltipValue(
                store.graph.currentGraphData.meta.maxDegree
            );
        }
    }, [props.demoData.length, store.graph.currentGraphData.meta.maxDegree]);

    const filterNodes = (min, max) => {
        store.graphInstance.filterNodesByNumericProp(min, max, filterProperty);
    };

    const onSliderChange = val => {
        store.track.trackEvent(
            `Details Panel - Widget - ${props.chart.id}`,
            'Slider',
            JSON.stringify({
                type: 'Slide',
                min: val[0],
                max: val[1],
                property: filterProperty
            })
        );

        setSliderMinTooltipValue(val[0]);
        setSliderMaxTooltipValue(val[1]);
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <Center height="100%" width="100%">
                <VStack
                    height="100%"
                    width="100%"
                    alignItems="flex-start"
                    spacing={1}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'blackAlpha.800'
                    }
                    borderRadius="6px"
                    justifyContent="center"
                    padding="10% 20%"
                >
                    <CustomScroll
                        style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    >
                        <VStack height="100%" width="100%">
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Title
                                </Heading>

                                <Editable
                                    size="xs"
                                    width="100%"
                                    value={title}
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.100'
                                            : 'blackAlpha.300'
                                    }
                                    borderRadius="5px"
                                    onChange={val => setTitle(val)}
                                    onSubmit={val => {
                                        if (val.trim()) {
                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'title',
                                                val.trim()
                                            );
                                            setTitle(val.trim());
                                        } else {
                                            setTitle(props.chart.title);
                                        }
                                    }}
                                    onFocus={() =>
                                        store.comment.setCommentTrigger(false)
                                    }
                                    onBlur={() =>
                                        store.comment.setCommentTrigger(true)
                                    }
                                >
                                    <EditablePreview
                                        padding="5px 10px"
                                        fontSize="xs"
                                        color="#FFFFFFBB"
                                        backgroundColor="whiteAlpha.200"
                                        width="100%"
                                        size="xs"
                                    />
                                    <EditableInput
                                        backgroundColor="whiteAlpha.200"
                                        padding="5px 10px"
                                        fontSize="xs"
                                        width="100%"
                                        size="xs"
                                    />
                                </Editable>
                            </HStack>
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Filtering Feature
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={filterProperty}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setFilterProperty(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'filter_property',
                                            e.target.value
                                        );
                                    }}
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
                                    <option value="degree">
                                        Neighbour count
                                    </option>
                                    {Object.keys(store.search.nodeTypes)
                                        .map(feature => {
                                            return {
                                                feature: feature,
                                                type: store.search.nodeTypes[
                                                    feature
                                                ]
                                            };
                                        })
                                        .filter(
                                            entry =>
                                                ['integer', 'float'].includes(
                                                    entry['type']
                                                ) &&
                                                store.core.isOverview &&
                                                store.graph.currentGraphData.meta.anchorProperties
                                                    .map(
                                                        entry =>
                                                            entry['property']
                                                    )
                                                    .includes(entry['feature'])
                                        )
                                        .map(entry => (
                                            <option
                                                key={`filter_prop_${entry['feature']}`}
                                                value={entry['feature']}
                                            >
                                                {entry['feature']}
                                            </option>
                                        ))}
                                </Select>
                            </HStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    return (
        <Box height="100%" width="100%" position="relative" padding="20px">
            <Flex
                direction="column"
                height="100%"
                width="100%"
                justifyContent="center"
                alignItems="center"
            >
                <HStack
                    spacing={props.isExpanded ? 10 : '10px'}
                    style={{ marginBottom: '10px' }}
                    justifyContent="space-between"
                    width="100%"
                    paddingBottom="10px"
                >
                    <NumberInput
                        position="relative"
                        border="none"
                        borderRadius="10px"
                        height={props.isExpanded ? '100px' : '50px'}
                        width="84px"
                        value={sliderMinTooltipValue}
                        onChange={val => {
                            store.track.trackEvent(
                                `Details Panel - Widget - ${props.chart.id}`,
                                'Number Input - Min',
                                JSON.stringify({
                                    type: 'Write',
                                    value: val,
                                    property: filterProperty
                                })
                            );

                            setSliderMinTooltipValue(val);
                            if (!isDemo) {
                                filterNodes(val, sliderMaxTooltipValue);
                            }
                        }}
                        min={0}
                        max={sliderMaxTooltipValue}
                    >
                        {props.isExpanded && (
                            <Text
                                position="absolute"
                                size="xs"
                                fontWeight="bold"
                                textAlign="center"
                                width="84px"
                                opacity="0.6"
                                bottom="5px"
                            >
                                min
                            </Text>
                        )}
                        <NumberInputField
                            border="none"
                            borderRadius="10px"
                            height={props.isExpanded ? '100px' : '50px'}
                            width="84px"
                            fontWeight="bold"
                            backgroundColor="whiteAlpha.100"
                            fontSize="md"
                            textAlign="center"
                            padding="5px"
                        />
                    </NumberInput>

                    {(props.isExpanded || isDemo) && (
                        <FormLabel
                            paddingBottom="10px"
                            paddingTop="10px"
                            textAlign="center"
                        >
                            Filtering by{' '}
                            <span>
                                {isDemo
                                    ? props.demoData[0].prop
                                    : filterProperty === 'degree'
                                    ? 'neighbour count'
                                    : filterProperty}
                            </span>
                        </FormLabel>
                    )}

                    <NumberInput
                        value={sliderMaxTooltipValue}
                        borderRadius="10px"
                        height={props.isExpanded ? '100px' : '50px'}
                        width="84px"
                        onChange={val => {
                            store.track.trackEvent(
                                `Details Panel - Widget - ${props.chart.id}`,
                                'Number Input - Max',
                                JSON.stringify({
                                    type: 'Write',
                                    value: val,
                                    property: filterProperty
                                })
                            );

                            setSliderMaxTooltipValue(val);
                            if (!isDemo) {
                                filterNodes(sliderMinTooltipValue, val);
                            }
                        }}
                        min={sliderMinTooltipValue}
                        max={sliderMaxValue}
                    >
                        {props.isExpanded && (
                            <Text
                                position="absolute"
                                size="xs"
                                fontWeight="bold"
                                textAlign="center"
                                width="84px"
                                opacity="0.6"
                                bottom="5px"
                            >
                                max
                            </Text>
                        )}
                        <NumberInputField
                            border="none"
                            borderRadius="10px"
                            height={props.isExpanded ? '100px' : '50px'}
                            width="84px"
                            backgroundColor="whiteAlpha.100"
                            fontSize="md"
                            fontWeight="bold"
                            textAlign="center"
                            padding="5px"
                        />
                    </NumberInput>
                </HStack>
                <RangeSlider
                    width="96%"
                    value={[sliderMinTooltipValue, sliderMaxTooltipValue]}
                    min={0}
                    max={sliderMaxValue}
                    step={1}
                    onChange={onSliderChange}
                    onChangeEnd={val => {
                        if (!isDemo) {
                            filterNodes(val[0], val[1]);
                        }
                    }}
                >
                    <RangeSliderTrack bg="blue.100">
                        <RangeSliderFilledTrack bg="blue.500" />
                    </RangeSliderTrack>

                    <RangeSliderThumb boxSize={3} index={0} />
                    <RangeSliderThumb boxSize={3} index={1} />
                </RangeSlider>
            </Flex>
        </Box>
    );
}
NodeFilter.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.array,
    filterProperty: PropTypes.string
};

NodeFilter.defaultProps = {
    isExpanded: false,
    demoData: [],
    filterProperty: 'degree'
};

export default observer(NodeFilter);
