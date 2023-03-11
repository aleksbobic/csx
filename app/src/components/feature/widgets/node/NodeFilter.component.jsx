import {
    Box,
    Flex,
    FormLabel,
    HStack,
    NumberInput,
    NumberInputField,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Text
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import WidgetSettings from '../WidgetSettings.component';

function NodeFilter(props) {
    const store = useContext(RootStoreContext);

    const [isDemo, setIsDemo] = useState(false);
    const [widgetConfig, setWidgetConfig] = useState(
        store.stats?.activeWidgets?.find(
            widget => widget.id === props.chart?.id
        ) || {}
    );

    useEffect(() => {
        if (props.demoData.length > 0) {
            setIsDemo(true);
            setSliderMaxTooltipValue(props.demoData[0].max);
            setSliderMaxValue(props.demoData[0].max);
        } else {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setWidgetConfig(widget);

            if (!widget) {
                setIsDemo(false);
                setSliderMinTooltipValue(0);
                setSliderMaxTooltipValue(0);
                setSliderMaxValue(0);
            } else {
                if (widget.filter_property === 'degree') {
                    setIsDemo(false);
                    setSliderMinTooltipValue(0);
                    setSliderMaxTooltipValue(
                        store.graph.currentGraphData.meta.maxDegree
                    );
                    setSliderMaxValue(
                        store.graph.currentGraphData.meta.maxDegree
                    );
                } else {
                    setIsDemo(false);

                    setSliderMinTooltipValue(
                        store.search.searchHints[widget.filter_property].min
                    );
                    setSliderMaxTooltipValue(
                        store.search.searchHints[widget.filter_property].max
                    );
                    setSliderMaxValue(
                        store.search.searchHints[widget.filter_property].max
                    );
                }
            }
        }
    }, [
        props.chart?.id,
        props.demoData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.stats.activeWidgets,
        store.core.currentGraph,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
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
        store.graphInstance.filterNodesByNumericProp(
            min,
            max,
            widgetConfig.filter_property
        );
    };

    const onSliderChange = val => {
        store.track.trackEvent(
            `Details Panel - Widget - ${props.chart.id}`,
            'Slider',
            JSON.stringify({
                type: 'Slide',
                min: val[0],
                max: val[1],
                property: widgetConfig.filter_property
            })
        );

        setSliderMinTooltipValue(val[0]);
        setSliderMaxTooltipValue(val[1]);
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['node filtering']}
            />
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
                                    property: widgetConfig.filter_property
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
                                    : widgetConfig.filter_property === 'degree'
                                    ? 'neighbour count'
                                    : widgetConfig.filter_property}
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
                                    property: widgetConfig.filter_property
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
    demoData: PropTypes.array
};

NodeFilter.defaultProps = {
    isExpanded: false,
    demoData: []
};

export default observer(NodeFilter);
