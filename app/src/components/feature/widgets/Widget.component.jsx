import {
    Button,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ArrowsH, ArrowsMergeAltH, Close } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
    Children,
    cloneElement,
    isValidElement,
    useContext,
    useEffect,
    useState
} from 'react';
import { RootStoreContext } from 'stores/RootStore';

function WidgetContainer(props) {
    const store = useContext(RootStoreContext);
    const [isExpanded, setIsExpanded] = useState(props.chart.colSpan === 2);
    const [settingsMode, setSettingsMode] = useState(false);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (props.maxColSize === 1) {
            setIsExpanded(true);
            store.stats.expandChart(props.chart.id, false);
        } else {
            setIsExpanded(false);
            store.stats.shrinkChart(props.chart.id, false);
        }
    }, [props.chart.id, props.maxColSize, store.stats]);

    const renderChartContainerTopControls = () => (
        <HStack
            position="absolute"
            padding="6px 6px 0 12px"
            width="100%"
            top="0px"
            right="0px"
            justifyContent="end"
        >
            <Tooltip label={props.title}>
                <Heading
                    size="xs"
                    fontSize="xs"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    flexGrow="1"
                    opacity="0.5"
                >
                    {props.title}
                </Heading>
            </Tooltip>
            {isExpanded && (
                <>
                    <Tooltip label="Toggle settings mode.">
                        <IconButton
                            size="xs"
                            variant="ghost"
                            opacity="0.5"
                            icon={
                                <Cog6ToothIcon
                                    style={{
                                        width: '18px',
                                        height: '18px'
                                    }}
                                />
                            }
                            onClick={() => {
                                store.track.trackEvent(
                                    'Side panel - Node Settings',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: settingsMode
                                            ? 'Turn off settings mode'
                                            : 'Turn on settings mode'
                                    })
                                );

                                setSettingsMode(!settingsMode);
                            }}
                            zIndex="3"
                            _hover={{
                                opacity: 1,
                                backgroundColor: 'transparent'
                            }}
                        />
                    </Tooltip>
                </>
            )}
            {props.maxColSize > 1 &&
                (props.chart.colSpan === 1 ? (
                    <Tooltip label="Expand">
                        <IconButton
                            icon={<ArrowsH style={{ '--ggs': 0.7 }} />}
                            size="xs"
                            variant="ghost"
                            opacity={0.5}
                            backgroundColor="transparent"
                            _hover={{
                                opacity: 1
                            }}
                            onClick={() => {
                                store.track.trackEvent(
                                    `Details Panel - Widget Container - ${props.chart.id}`,
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Expand widget'
                                    })
                                );
                                setSettingsMode(false);
                                setIsExpanded(true);
                                store.stats.expandChart(props.chart.id);
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip label="Shrink">
                        <IconButton
                            icon={<ArrowsMergeAltH style={{ '--ggs': 0.7 }} />}
                            size="xs"
                            variant="ghost"
                            opacity={0.5}
                            _hover={{
                                opacity: 1
                            }}
                            onClick={() => {
                                store.track.trackEvent(
                                    `Details Panel - Widget Container - ${props.chart.id}`,
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Shrink widget'
                                    })
                                );

                                setSettingsMode(false);
                                setIsExpanded(false);
                                store.stats.shrinkChart(props.chart.id);
                            }}
                        />
                    </Tooltip>
                ))}

            <Tooltip label="Remove widget">
                <IconButton
                    icon={<Close style={{ '--ggs': 0.7 }} />}
                    size="xs"
                    variant="ghost"
                    opacity={0.5}
                    _hover={{
                        opacity: 1
                    }}
                    onClick={() => {
                        store.track.trackEvent(
                            `Details Panel - Widget Container - ${props.chart.id}`,
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: 'Remove widget'
                            })
                        );
                        store.stats.removeChart(props.chart.id);
                    }}
                />
            </Tooltip>
        </HStack>
    );

    const renderChartContainerBottomControls = () => (
        <HStack position="absolute" bottom="6px" right="6px">
            {![
                'doughnut',
                'bar',
                'line',
                'vertical bar',
                'grouped bar'
            ].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Toggle x axis label">
                    <Button
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() => {
                            store.track.trackEvent(
                                `Details Panel - Widget Container - ${props.chart.id}`,
                                'Button - X Axis Visibility',
                                JSON.stringify({
                                    type: 'Click',
                                    value: !props.chart.labels.x.display
                                        ? 'Visible'
                                        : 'Invisible'
                                })
                            );

                            store.stats.toggleAxisLabels(props.chart.id, 'x');
                        }}
                    >
                        X
                    </Button>
                </Tooltip>
            )}
            {![
                'doughnut',
                'bar',
                'line',
                'vertical bar',
                'grouped bar'
            ].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Toggle y axis label">
                    <Button
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() => {
                            store.track.trackEvent(
                                `Details Panel - Widget Container - ${props.chart.id}`,
                                'Button - Y Axis Visibility',
                                JSON.stringify({
                                    type: 'Click',
                                    value: !props.chart.labels.y.display
                                        ? 'Visible'
                                        : 'Invisible'
                                })
                            );

                            store.stats.toggleAxisLabels(props.chart.id, 'y');
                        }}
                    >
                        Y
                    </Button>
                </Tooltip>
            )}
        </HStack>
    );

    const childrenWithProps = Children.map(props.children, child => {
        if (isValidElement(child)) {
            return cloneElement(child, {
                isExpanded,
                settingsMode,
                title: props.title
            });
        }
        return child;
    });

    return (
        <GridItem
            key={`Chart container ${props.index}`}
            height={props.chart.height}
            padding="10px"
            paddingTop="42px"
            paddingBottom={props.chart.colSpan === 2 && '10px'}
            colSpan={props.chart.colSpan}
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.200' : 'whiteAlpha.200'
            }
            borderRadius={8}
            position="relative"
        >
            {renderChartContainerTopControls(props.chart)}
            {childrenWithProps}

            {props.chart.colSpan === 2 &&
                ![
                    'graph stats',
                    'connections',
                    'components',
                    'nodes',
                    'node filter',
                    'radar'
                ].includes(props.chart.type.toLowerCase()) &&
                renderChartContainerBottomControls(props.chart)}
        </GridItem>
    );
}
WidgetContainer.propTypes = {
    statObject: PropTypes.object,
    chart: PropTypes.object,
    index: PropTypes.number,
    title: PropTypes.string,
    maxColSize: PropTypes.number
};

export default observer(WidgetContainer);
