import {
    GridItem,
    Heading,
    HStack,
    IconButton,
    Tooltip,
    useColorModeValue
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
    const widgetBackground = useColorModeValue(
        'blackAlpha.200',
        'whiteAlpha.200'
    );

    useEffect(() => {
        if (props.maxColSize === 1) {
            setIsExpanded(true);
            store.stats.expandChart(props.chart.id, false);
        } else {
            setIsExpanded(false);
            store.stats.shrinkChart(props.chart.id, false);
        }
    }, [props.chart.id, props.maxColSize, store.stats]);

    const renderWidgetRemoveButton = () => (
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
    );

    const renderWidgetSizebutton = () => (
        <Tooltip label={isExpanded ? 'Shrink' : 'Expand'}>
            <IconButton
                icon={
                    isExpanded ? (
                        <ArrowsMergeAltH style={{ '--ggs': 0.7 }} />
                    ) : (
                        <ArrowsH style={{ '--ggs': 0.7 }} />
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
                        `Details Panel - Widget Container - ${props.chart.id}`,
                        'Button',
                        JSON.stringify({
                            type: 'Click',
                            value: isExpanded
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
            backgroundColor={widgetBackground}
            borderRadius={8}
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
    title: PropTypes.string,
    maxColSize: PropTypes.number
};

export default observer(WidgetContainer);
