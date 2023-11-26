import {
    GridItem,
    Heading,
    HStack,
    IconButton,
    Tooltip,
    useColorModeValue
} from '@chakra-ui/react';
import {
    Cog6ToothIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
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
    const widgetBackground = useColorModeValue(
        'blackAlpha.200',
        'whiteAlpha.200'
    );

    useEffect(() => {
        setIsExpanded(props.maxColSize === 1);
        if (props.maxColSize === 1) {
            store.stats.expandChart(props.chart.id, false);
        } else {
            store.stats.shrinkChart(props.chart.id, false);
        }
    }, [props.chart.id, props.maxColSize, store.stats]);

    const renderWidgetRemoveButton = () => (
        <Tooltip label="Remove widget">
            <IconButton
                icon={<XMarkIcon style={{ width: '16px', height: '16px' }} />}
                size="xs"
                variant="ghost"
                opacity={0.5}
                _hover={{
                    opacity: 1
                }}
                onClick={() => {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Widget',
                            area_id: props.chart.id,
                            sub_area: 'Widget container'
                        }),
                        JSON.stringify({
                            item_type: 'Button'
                        }),
                        JSON.stringify({
                            event_type: 'Click',
                            event_action: 'Remove widget'
                        })
                    );
                    store.stats.removeChart(props.chart.id);
                }}
            />
        </Tooltip>
    );

    const renderWidgetSizebutton = () => (
        <Tooltip label={isExpanded ? 'Shrink' : 'Expand'}>
            <IconButton
                icon={
                    isExpanded ? (
                        <ArrowsPointingInIcon
                            style={{ width: '16px', height: '16px' }}
                        />
                    ) : (
                        <ArrowsPointingOutIcon
                            style={{ width: '16px', height: '16px' }}
                        />
                    )
                }
                size="xs"
                variant="ghost"
                opacity={0.5}
                backgroundColor="transparent"
                _hover={{
                    opacity: 1
                }}
                onClick={() => {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Widget',
                            area_id: props.chart.id,
                            sub_area: 'Widget container'
                        }),
                        JSON.stringify({
                            item_type: 'Button'
                        }),
                        JSON.stringify({
                            event_type: 'Click',
                            event_action: isExpanded
                                ? 'Shrink widget'
                                : 'Expand widget'
                        })
                    );
                    setSettingsMode(false);
                    if (isExpanded) {
                        store.stats.shrinkChart(props.chart.id);
                    } else {
                        store.stats.expandChart(props.chart.id);
                    }
                    setIsExpanded(!isExpanded);
                }}
            />
        </Tooltip>
    );

    const renderWidgetSettingsButton = () => (
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
                        JSON.stringify({
                            area: 'Widget',
                            area_id: props.chart.id,
                            sub_area: 'Widget container'
                        }),
                        JSON.stringify({
                            item_type: 'Button'
                        }),
                        JSON.stringify({
                            event_type: 'Click',
                            event_action: !settingsMode
                                ? 'Open settings'
                                : 'Close settings'
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
    );

    const renderWidgetHeader = () => (
        <HStack
            position="absolute"
            padding="6px 6px 0 12px"
            width="100%"
            top="0px"
            right="0px"
            justifyContent="end"
        >
            <Tooltip label={props.chart.title}>
                <Heading
                    size="xs"
                    fontSize="xs"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    flexGrow="1"
                    opacity="0.5"
                >
                    {props.chart.title}
                </Heading>
            </Tooltip>
            {isExpanded && renderWidgetSettingsButton()}
            {props.maxColSize > 1 && renderWidgetSizebutton()}
            {renderWidgetRemoveButton()}
        </HStack>
    );

    const renderWidgetsWithProps = Children.map(props.children, child => {
        if (isValidElement(child)) {
            return cloneElement(child, {
                isExpanded,
                settingsMode,
                title: props.chart.title
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
            backgroundColor={widgetBackground}
            borderRadius={8}
            overflowY="overlay"
            position="relative"
        >
            {renderWidgetHeader(props.chart)}
            {renderWidgetsWithProps}
        </GridItem>
    );
}
WidgetContainer.propTypes = {
    statObject: PropTypes.object,
    chart: PropTypes.object,
    index: PropTypes.number,
    maxColSize: PropTypes.number
};

export default observer(WidgetContainer);
