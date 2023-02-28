import {
    Button,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Select,
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
    const [networkData, setNetworkData] = useState(props.chart.network_data);
    const [elementDisplayLimit, setElementDisplayLimit] = useState(10);
    const [connectionFeature, setConnectionFeature] = useState('all');
    const [maxConnectionDegree, setMaxConnectionDegree] = useState(2);
    const [filterProperty, setFilterProperty] = useState('degree');
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
            {['connections'].includes(props.chart.type.toLowerCase()) &&
                isExpanded && (
                    <Tooltip label="Change max degree.">
                        <Select
                            size="xs"
                            variant="filled"
                            borderRadius="5px"
                            opacity="0.5"
                            minWidth="40px"
                            width="40px"
                            textAlign="right"
                            backgroundColor="transparent"
                            _hover={{
                                opacity: '1',
                                backgroundColor: 'whiteAlpha.200'
                            }}
                            icon={<></>}
                            style={{ paddingRight: '8px' }}
                            defaultValue={maxConnectionDegree}
                            onChange={e => {
                                store.track.trackEvent(
                                    `Details Panel - Widget Container - ${props.chart.id}`,
                                    'Select Element - Max Connection Degree in Widget',
                                    JSON.stringify({
                                        type: 'Change selection',
                                        value: e.target.value
                                    })
                                );

                                setMaxConnectionDegree(
                                    parseInt(e.target.value)
                                );
                            }}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </Select>
                    </Tooltip>
                )}
            {'radar' === props.chart.type.toLowerCase() && isExpanded && (
                <>
                    <Tooltip label="Toggle settings mode.">
                        <IconButton
                            size="xs"
                            variant="ghost"
                            opacity="0.5"
                            icon={
                                <Cog6ToothIcon
                                    style={{ width: '18px', height: '18px' }}
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
            {['node filter'].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Change filter property.">
                    <Select
                        size="xs"
                        variant="filled"
                        borderRadius="5px"
                        opacity="0.5"
                        minWidth="70px"
                        width="70px"
                        textAlign="right"
                        backgroundColor="transparent"
                        _hover={{
                            opacity: '1',
                            backgroundColor: 'whiteAlpha.200'
                        }}
                        icon={<></>}
                        style={{ paddingRight: '8px' }}
                        defaultValue={filterProperty}
                        onChange={e => {
                            store.track.trackEvent(
                                `Details Panel - Widget Container - ${props.chart.id}`,
                                'Select Element - Filter Property',
                                JSON.stringify({
                                    type: 'Change selection',
                                    value: e.target.value
                                })
                            );

                            setFilterProperty(e.target.value);
                        }}
                    >
                        <option value="degree">degree</option>
                        {Object.keys(store.search.nodeTypes)
                            .map(feature => {
                                return {
                                    feature: feature,
                                    type: store.search.nodeTypes[feature]
                                };
                            })
                            .filter(
                                entry =>
                                    ['integer', 'float'].includes(
                                        entry['type']
                                    ) &&
                                    store.core.isOverview &&
                                    store.graph.currentGraphData.meta.anchorProperties
                                        .map(entry => entry['property'])
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
                </Tooltip>
            )}
            {['connections'].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Show only features of selected type.">
                    <Select
                        size="xs"
                        variant="filled"
                        borderRadius="5px"
                        opacity="0.5"
                        minWidth="70px"
                        width="70px"
                        textAlign="right"
                        backgroundColor="transparent"
                        _hover={{
                            opacity: '1',
                            backgroundColor: 'whiteAlpha.200'
                        }}
                        icon={<></>}
                        style={{ paddingRight: '8px' }}
                        defaultValue={connectionFeature}
                        onChange={e => {
                            store.track.trackEvent(
                                `Details Panel - Widget Container - ${props.chart.id}`,
                                'Select Element - Connection Feature',
                                JSON.stringify({
                                    type: 'Change selection',
                                    value: e.target.value
                                })
                            );

                            setConnectionFeature(e.target.value);
                        }}
                    >
                        <option value="all">all</option>
                        {store.graph.currentGraphData.perspectivesInGraph.map(
                            feature => (
                                <option
                                    key={`connection_feature_${feature}`}
                                    value={feature}
                                >
                                    {feature}
                                </option>
                            )
                        )}
                    </Select>
                </Tooltip>
            )}
            {[
                'nodes',
                'bar',
                'vertical bar',
                'doughnut',
                'line',
                'grouped bar'
            ].includes(props.chart.type.toLowerCase()) &&
                networkData !== 'selected' &&
                isExpanded && (
                    <Tooltip label="Limit element display by neighbour frequency.">
                        <Select
                            size="xs"
                            variant="filled"
                            borderRadius="5px"
                            opacity="0.5"
                            width="70px"
                            minWidth="70px"
                            textAlign="right"
                            backgroundColor="transparent"
                            _hover={{
                                opacity: '1',
                                backgroundColor: 'whiteAlpha.200'
                            }}
                            icon={<></>}
                            style={{ paddingRight: '8px' }}
                            defaultValue={elementDisplayLimit}
                            onChange={e => {
                                store.track.trackEvent(
                                    `Details Panel - Widget Container - ${props.chart.id}`,
                                    'Select Element - Element Display Limit',
                                    JSON.stringify({
                                        type: 'Change selection',
                                        value: e.target.value
                                    })
                                );

                                setElementDisplayLimit(
                                    parseInt(e.target.value)
                                );
                            }}
                        >
                            <option value={10}>First 10</option>
                            <option value={50}>First 50</option>
                            <option value={100}>First 100</option>
                            <option value={-10}>Last 10</option>
                            <option value={-50}>Last 50</option>
                            <option value={-100}>Last 100</option>
                            <option value={0}>All</option>
                        </Select>
                    </Tooltip>
                )}
            {!['connections', 'node filter', 'radar'].includes(
                props.chart.type.toLowerCase()
            ) && (
                <Tooltip label="Change displayed elements">
                    <Select
                        size="xs"
                        variant="filled"
                        borderRadius="5px"
                        opacity="0.5"
                        minWidth="70px"
                        width="70px"
                        textAlign="right"
                        backgroundColor="transparent"
                        _hover={{
                            opacity: '1',
                            backgroundColor: 'whiteAlpha.200'
                        }}
                        icon={<></>}
                        style={{ paddingRight: '8px' }}
                        defaultValue={props.chart.show_only}
                        onChange={e => {
                            store.track.trackEvent(
                                `Details Panel - Widget Container - ${props.chart.id}`,
                                'Select Element - Network Data',
                                JSON.stringify({
                                    type: 'Change selection',
                                    value: e.target.value
                                })
                            );

                            setNetworkData(e.target.value);
                        }}
                    >
                        {props.chart.elements !== 'edges' && (
                            <option value="selected">selected</option>
                        )}
                        {props.chart.type.toLowerCase() !== 'components' && (
                            <option value="visible">visible</option>
                        )}
                        <option value="all">all</option>
                    </Select>
                </Tooltip>
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
                networkData,
                elementDisplayLimit,
                connectionFeature,
                maxConnectionDegree,
                filterProperty,
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
