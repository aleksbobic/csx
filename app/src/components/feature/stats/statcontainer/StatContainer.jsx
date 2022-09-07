import {
    GridItem,
    Heading,
    HStack,
    IconButton,
    Select,
    Tooltip
} from '@chakra-ui/react';
import { ArrowsH, ArrowsMergeAltH, Close, Ruler, ToolbarTop } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { cloneElement } from 'react';
import { Children, isValidElement, useContext, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function StatContainer(props) {
    const store = useContext(RootStoreContext);
    const [isExpanded, setIsExpanded] = useState(props.chart.colSpan === 2);
    const [networkData, setNetworkData] = useState(props.chart.network_data);
    const [elementDisplayLimit, setElementDisplayLimit] = useState(10);

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
            {['nodes'].includes(props.chart.type.toLowerCase()) &&
                networkData === 'all' &&
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
                        <option value="selected">selected</option>
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

            <Tooltip label="Toggle axis labels">
                <IconButton
                    icon={<Ruler />}
                    size="sm"
                    variant="ghost"
                    opacity={0.5}
                    _hover={{
                        opacity: 1
                    }}
                    onClick={() => store.stats.toggleAxisLabels(props.chart.id)}
                />
            </Tooltip>
        </HStack>
    );

    const childrenWithProps = Children.map(props.children, child => {
        if (isValidElement(child)) {
            return cloneElement(child, {
                isExpanded,
                networkData,
                elementDisplayLimit
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
