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

function NodeFilter(props) {
    const store = useContext(RootStoreContext);

    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        if (props.demoData.length > 0) {
            setIsDemo(true);
            setSliderMaxTooltipValue(props.demoData[0].max);
            setSliderMaxValue(props.demoData[0].max);
        }
    }, [props.demoData, props.demoData.length]);

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

    return (
        <Box
            overflowY="scroll"
            height="100%"
            width="100%"
            position="relative"
            padding="20px"
        >
            <Flex
                direction="column"
                height="100%"
                width="100%"
                justifyContent="center"
                alignItems="center"
            >
                <HStack
                    spacing={10}
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
                            setSliderMinTooltipValue(val);
                            if (!isDemo) {
                                store.graphInstance.filterNodesByDegree(
                                    val,
                                    sliderMaxTooltipValue
                                );
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
                            backgroundColor="blackAlpha.400"
                            fontSize="md"
                            textAlign="center"
                            padding="5px"
                        />
                    </NumberInput>

                    {(props.isExpanded || isDemo) && (
                        <FormLabel paddingBottom="10px" paddingTop="10px">
                            Filtering by{' '}
                            <span>
                                {isDemo ? props.demoData[0].prop : 'connection'}
                            </span>
                        </FormLabel>
                    )}

                    <NumberInput
                        value={sliderMaxTooltipValue}
                        borderRadius="10px"
                        height={props.isExpanded ? '100px' : '50px'}
                        width="84px"
                        onChange={val => {
                            setSliderMaxTooltipValue(val);
                            if (!isDemo) {
                                store.graphInstance.filterNodesByDegree(
                                    sliderMinTooltipValue,
                                    val
                                );
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
                            backgroundColor="blackAlpha.400"
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
                    onChange={val => {
                        setSliderMinTooltipValue(val[0]);
                        setSliderMaxTooltipValue(val[1]);
                    }}
                    onChangeEnd={val => {
                        if (!isDemo) {
                            store.graphInstance.filterNodesByDegree(
                                val[0],
                                val[1]
                            );
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
    networkData: PropTypes.string,
    demoData: PropTypes.array,
    elementDisplayLimit: PropTypes.number
};

NodeFilter.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: [],
    elementDisplayLimit: 10
};

export default observer(NodeFilter);
