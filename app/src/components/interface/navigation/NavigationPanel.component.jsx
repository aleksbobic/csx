import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Divider,
    HStack,
    IconButton,
    Image,
    Link,
    Slide,
    Text,
    Tooltip,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import {
    Assign,
    BorderRight,
    ChevronRight,
    Moon,
    RadioCheck,
    Ratio,
    Ring,
    Sun,
    Sync
} from 'css.gg';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import DataPanelComponent from '../datapanel/DataPanel.component';

function NavigationPanelComponent() {
    const store = useContext(RootStoreContext);
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onToggle } = useDisclosure();
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'black');

    const edgeColorDark =
        location.pathname !== '/' ? 'gray.900' : 'transparent';
    const edgeColorLight =
        location.pathname !== '/' ? 'gray.300' : 'transparent';

    const edgeColor = useColorModeValue(edgeColorLight, edgeColorDark);

    const graphUtilsMenuBackground = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const isJSON = str => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    const regenerateGraph = () => {
        const query = queryString.parse(location.search).query;

        store.graph.getSearchGraph(
            store.graph.currentGraphData.meta.query,
            isJSON(query),
            location.pathname.startsWith('/graph/detail')
                ? 'detail'
                : 'overview'
        );
    };

    const toggleDataPanel = () => {
        onToggle();
        store.track.trackEvent(
            'navbar',
            'button click',
            `data panel ${isOpen ? 'off' : 'on'}`
        );
    };

    const toggleColor = () => {
        store.track.trackEvent(
            'navbar',
            'button click',
            `color mode ${colorMode === 'light' ? 'dark' : 'light'}`
        );
        toggleColorMode();
    };

    const renderGraphUtils = () => (
        <Box position="absolute" marginLeft="-105px" top="20px" id="graphutils">
            <HStack
                spacing="10px"
                backgroundColor={graphUtilsMenuBackground}
                padding="5px 6px"
                borderRadius="8px"
                style={{ backdropFilter: 'blur(2px)' }}
            >
                <Tooltip
                    label={
                        location.pathname.startsWith('/graph/detail')
                            ? 'View overview graph'
                            : 'View detail graph'
                    }
                >
                    <IconButton
                        as={NavLink}
                        to={
                            location.pathname.startsWith('/graph/detail')
                                ? `/graph?query=${getQueryString(
                                      'query'
                                  )}&dataset=${getQueryString('dataset')}`
                                : `/graph/detail?query=${getQueryString(
                                      'query'
                                  )}&dataset=${getQueryString('dataset')}`
                        }
                        id="switchgraphviewbutton"
                        size="sm"
                        border="none"
                        aria-label="Switch graph view"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={
                            location.pathname.startsWith('/graph/detail') ? (
                                <RadioCheck
                                    style={{
                                        '--ggs': '0.68'
                                    }}
                                />
                            ) : (
                                <Ring style={{ '--ggs': '0.7' }} />
                            )
                        }
                    />
                </Tooltip>
                <Tooltip label="Regenerate graph">
                    <IconButton
                        id="regenerategraphbutton"
                        size="sm"
                        border="none"
                        aria-label="Regenerate graph"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<Sync style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'graph utils',
                                'button click',
                                'regenerate graph'
                            );
                            regenerateGraph();
                        }}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );

    const renderHoverData = () => (
        <VStack
            alignItems="flex-start"
            position="absolute"
            bottom="50px"
            right="0px"
            width="200px"
            spacing="5px"
            backgroundColor="blackAlpha.600"
            borderRadius="10px"
            padding="10px"
        >
            {store.graphInstance.hoverData.map((entry, index) => (
                <Box width="100%" key={`hover_data_${index}`}>
                    <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {entry.feature}:{' '}
                    </Text>
                    <Text
                        fontSize="sm"
                        color="gray.200"
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {entry.label}
                    </Text>
                </Box>
            ))}
        </VStack>
    );

    const renderViewUtils = () => (
        <Box
            position="absolute"
            marginLeft="-100px"
            bottom="75px"
            id="viewutils"
        >
            {store.graphInstance.hoverData.length > 0 &&
                store.core.isOverview &&
                renderHoverData()}
            <HStack spacing="10px">
                <Tooltip label="Make Screenshot">
                    <IconButton
                        size="sm"
                        border="none"
                        aria-label="Make Screenshot"
                        icon={<Ratio />}
                        onClick={() => {
                            store.track.trackEvent(
                                'view utils',
                                'button click',
                                'take screenshot'
                            );
                            store.graphInstance.takeScreenshot();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Zoom to fit">
                    <IconButton
                        id="zoomtofitbutton"
                        size="sm"
                        border="none"
                        aria-label="Zoom to fit"
                        icon={<Assign />}
                        onClick={() => {
                            store.track.trackEvent(
                                'view utils',
                                'button click',
                                'zoom to fit'
                            );
                            store.graphInstance.zoomToFit();
                        }}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );

    const getQueryString = param => queryString.parse(location.search)[param];

    const renderWorkspaceSwitch = () => (
        <ButtonGroup size="xs" isAttached>
            <Tooltip label="Retrieval workspace">
                <Button
                    variant={
                        location.pathname === '/search' ? 'solid' : 'outline'
                    }
                    as={NavLink}
                    to={`/search?query=${getQueryString(
                        'query'
                    )}&dataset=${getQueryString('dataset')}`}
                    border="1px solid transparent"
                    opacity={location.pathname === '/search' ? '1' : '0.5'}
                >
                    Search
                </Button>
            </Tooltip>
            <Tooltip label="Graph analysis workspace">
                <Button
                    variant={
                        location.pathname === '/graph' ? 'solid' : 'outline'
                    }
                    border="1px solid transparent"
                    as={NavLink}
                    to={`/graph?query=${getQueryString(
                        'query'
                    )}&dataset=${getQueryString('dataset')}`}
                    opacity={
                        location.pathname.startsWith('/graph') ? '1' : '0.5'
                    }
                    style={{
                        pointerEvents: !store.graph.currentGraphData.nodes
                            .length
                            ? 'none'
                            : 'auto'
                    }}
                >
                    Graph
                </Button>
            </Tooltip>
        </ButtonGroup>
    );

    const renderToggles = () => (
        <ButtonGroup
            variant="outline"
            size="md"
            display="flex"
            alignItems="center"
            height="100%"
            borderLeft="1px solid"
            paddingLeft="10px"
            borderColor={edgeColor}
        >
            {location.pathname.startsWith('/graph') && (
                <Tooltip label="Toggle data panel">
                    <IconButton
                        border="none"
                        aria-label="Data panel toggle"
                        id="datapnaletoggle"
                        onClick={toggleDataPanel}
                        icon={<BorderRight />}
                    />
                </Tooltip>
            )}
            <Tooltip label="Toggle color mode">
                <IconButton
                    border="none"
                    aria-label="Color mode"
                    icon={colorMode === 'light' ? <Moon /> : <Sun />}
                    onClick={toggleColor}
                />
            </Tooltip>
        </ButtonGroup>
    );

    return (
        <>
            <Box
                id="navigation"
                pos="fixed"
                zIndex="5"
                height="50px"
                backgroundColor={
                    location.pathname !== '/' ? bgColor : 'transparent'
                }
                right="0px"
                width="100%"
                paddingRight="15px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid"
                borderColor={edgeColor}
                style={{ backdropFilter: 'blur(2px)' }}
            >
                <HStack spacing="10px">
                    <Link
                        as={NavLink}
                        to="/"
                        paddingRight="5px"
                        paddingLeft="5px"
                        borderRight="1px solid"
                        borderColor={edgeColor}
                        id="homelink"
                        onClick={() =>
                            store.track.trackEvent(
                                'navbar',
                                'button click',
                                'logo'
                            )
                        }
                    >
                        <Image
                            src={logo}
                            alt="Collaboration spotting logo"
                            height="40px"
                            padding="10px"
                        />
                    </Link>

                    {location.pathname !== '/' && renderWorkspaceSwitch()}
                    {location.pathname !== '/' && (
                        <Box style={{ marginLeft: '125px' }}>
                            <Divider
                                opacity="0.4"
                                orientation="vertical"
                                height="80%"
                                top="6px"
                                position="absolute"
                                backgroundColor="gray.900"
                            />
                            <Breadcrumb
                                marginLeft="20px"
                                spacing="2px"
                                separator={
                                    <ChevronRight style={{ '--ggs': '0.5' }} />
                                }
                            >
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as={NavLink}
                                        to="/"
                                        fontSize="xs"
                                        fontWeight="regular"
                                    >
                                        {store?.search?.currentDataset?.toUpperCase()}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as={NavLink}
                                        to={`/graph?query=${getQueryString(
                                            'query'
                                        )}&dataset=${getQueryString(
                                            'dataset'
                                        )}`}
                                        fontSize="xs"
                                        fontWeight="regular"
                                    >
                                        {location.pathname
                                            .split('/')[1]
                                            .charAt(0)
                                            .toUpperCase() +
                                            location.pathname
                                                .split('/')[1]
                                                .slice(1)}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {location.pathname.split('/')[2] ===
                                    'detail' && (
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            as={Text}
                                            fontSize="xs"
                                            fontWeight="bold"
                                            _hover={{ cursor: 'default' }}
                                        >
                                            Detail
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                )}
                            </Breadcrumb>
                        </Box>
                    )}
                </HStack>
                {renderToggles()}
            </Box>
            {location.pathname.startsWith('/graph') && (
                <Slide
                    direction="right"
                    in={isOpen}
                    style={{
                        zIndex: 10,
                        right: '0px',
                        width: '35%',
                        position: 'fixed',
                        top: '50px',
                        height: '100%'
                    }}
                >
                    {renderGraphUtils()}
                    {renderViewUtils()}
                    <DataPanelComponent />
                </Slide>
            )}
        </>
    );
}

export default observer(NavigationPanelComponent);
