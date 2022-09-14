import {
    Button,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Select,
    Tooltip
} from '@chakra-ui/react';
import { ArrowsH, ArrowsMergeAltH, Close, ToolbarTop } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
    Children,
    cloneElement,
    isValidElement,
    useContext,
    useState
} from 'react';
import { RootStoreContext } from 'stores/RootStore';

function StatContainer(props) {
    const store = useContext(RootStoreContext);
    const [isExpanded, setIsExpanded] = useState(props.chart.colSpan === 2);
    const [networkData, setNetworkData] = useState(props.chart.network_data);
    const [elementDisplayLimit, setElementDisplayLimit] = useState(10);
    const [connectionFeature, setConnectionFeature] = useState('all');
    const [maxConnectionDegree, setMaxConnectionDegree] = useState(2);

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
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    flexGrow="1"
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
                            onChange={e =>
                                setMaxConnectionDegree(parseInt(e.target.value))
                            }
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
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
                        onChange={e => setConnectionFeature(e.target.value)}
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
                            onChange={e =>
                                setElementDisplayLimit(parseInt(e.target.value))
                            }
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
            {!['connections'].includes(props.chart.type.toLowerCase()) && (
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
                        onChange={e => setNetworkData(e.target.value)}
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
            {props.chart.colSpan === 1 ? (
                <Tooltip label="Expand">
                    <IconButton
                        icon={<ArrowsH />}
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        backgroundColor="transparent"
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() => {
                            setIsExpanded(true);
                            store.stats.expandChart(props.chart.id);
                        }}
                    />
                </Tooltip>
            ) : (
                <Tooltip label="Shrink">
                    <IconButton
                        icon={<ArrowsMergeAltH />}
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() => {
                            setIsExpanded(false);
                            store.stats.shrinkChart(props.chart.id);
                        }}
                    />
                </Tooltip>
            )}

            <Tooltip label="Remove chart">
                <IconButton
                    icon={<Close />}
                    size="sm"
                    variant="ghost"
                    opacity={0.5}
                    _hover={{
                        opacity: 1
                    }}
                    onClick={() => store.stats.removeChart(props.chart.id)}
                />
            </Tooltip>
        </HStack>
    );

    const renderChartContainerBottomControls = () => (
        <HStack position="absolute" bottom="6px" right="6px">
            <Tooltip label="Toggle legend">
                <IconButton
                    icon={<ToolbarTop />}
                    size="sm"
                    variant="ghost"
                    opacity={0.5}
                    _hover={{
                        opacity: 1
                    }}
                    onClick={() => store.stats.toggleLegend(props.chart.id)}
                />
            </Tooltip>
            {!['doughnut'].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Toggle x axis label">
                    <Button
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() =>
                            store.stats.toggleAxisLabels(props.chart.id, 'x')
                        }
                    >
                        X
                    </Button>
                </Tooltip>
            )}
            {!['doughnut'].includes(props.chart.type.toLowerCase()) && (
                <Tooltip label="Toggle y axis label">
                    <Button
                        size="sm"
                        variant="ghost"
                        opacity={0.5}
                        _hover={{
                            opacity: 1
                        }}
                        onClick={() =>
                            store.stats.toggleAxisLabels(props.chart.id, 'y')
                        }
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
                maxConnectionDegree
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
            paddingBottom={
                props.chart.colSpan === 2 &&
                !['graph stats', 'connections', 'components', 'nodes'].includes(
                    props.chart.type.toLowerCase()
                )
                    ? '50px'
                    : '10px'
            }
            colSpan={props.chart.colSpan}
            backgroundColor="whiteAlpha.200"
            borderRadius={8}
            position="relative"
        >
            {renderChartContainerTopControls(props.chart)}
            {childrenWithProps}

            {props.chart.colSpan === 2 &&
                !['graph stats', 'connections', 'components', 'nodes'].includes(
                    props.chart.type.toLowerCase()
                ) &&
                renderChartContainerBottomControls(props.chart)}
        </GridItem>
    );
}
StatContainer.propTypes = {
    statObject: PropTypes.object,
    chart: PropTypes.object,
    index: PropTypes.number,
    title: PropTypes.string
};

export default observer(StatContainer);
