import {
    Box,
    Center,
    Code,
    Heading,
    HStack,
    IconButton,
    Text,
    useColorMode,
    useToast,
    VStack
} from '@chakra-ui/react';
import ContextMenuComponent from 'components/feature/contextmenu/ContextMenu.component';
import GraphComponent from 'components/feature/graph/Graph.component';
import StatsModalComponent from 'components/interface/statsmodal/StatsModal.component';
import { Close, Spinner } from 'css.gg';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function GraphPage() {
    const store = useContext(RootStoreContext);
    const toast = useToast();
    const location = useLocation();
    const { colorMode } = useColorMode();
    const toastRef = useRef();
    const history = useHistory();

    useEffect(() => {
        store.track.trackPageChange();

        store.core.setCurrentGraph(
            location.pathname.startsWith('/graph/detail')
                ? 'detail'
                : 'overview'
        );

        const query = queryString.parse(location.search).query;
        const dataset = queryString.parse(location.search).dataset;
        const suuid = queryString.parse(location.search).suuid;

        store.graphInstance.toggleVisibleComponents(-1);

        if (query) {
            if (location.pathname.startsWith('/graph/detail')) {
                let visible_entries = [];

                if (store.graph.currentGraphData.selectedComponents.length) {
                    const entryArray = store.graph.currentGraphData.components
                        .filter(component =>
                            store.graph.currentGraphData.selectedComponents.includes(
                                component.id
                            )
                        )
                        .reduce(
                            (entries, component) =>
                                entries.concat(component.entries),
                            []
                        );

                    visible_entries = JSON.stringify([...new Set(entryArray)]);
                }

                let same_components =
                    visible_entries.length ===
                    store.graph.detailGraphData.meta.visible_entries.length;

                if (
                    visible_entries.length ===
                    store.graph.detailGraphData.meta.visible_entries.length
                ) {
                    for (let entry in visible_entries) {
                        if (
                            store.graph.detailGraphData.meta.visible_entries.includes(
                                entry
                            )
                        ) {
                            same_components = false;
                            break;
                        }
                    }
                }

                store.graph.getSearchGraph(query, 'detail', suuid);
            } else {
                store.graph.getSearchGraph(query, 'overview', suuid);
            }
        } else {
            history.push('/');
        }
    }, [
        history,
        location.search,
        store.graph,
        store.track,
        location.pathname,
        store.core,
        store.graphInstance
    ]);

    useEffect(() => {
        if (store.search.searchIsEmpty) {
            history.push('/');
        }
    }, [history, store.search.searchIsEmpty]);

    const renderToast = useCallback(() => {
        toastRef.current = toast({
            render: () => {
                return (
                    <Box
                        backgroundColor="red.500"
                        borderRadius="10px"
                        padding="10px"
                        key="id"
                    >
                        <VStack
                            width="400px"
                            position="relative"
                            alignItems="flex-start"
                        >
                            <HStack justifyContent="space-between" width="100%">
                                <Heading size="md">Server error :(</Heading>
                                <IconButton
                                    variant="ghost"
                                    size="md"
                                    icon={<Close />}
                                    onClick={() => {
                                        toast.close(toastRef.current);
                                    }}
                                />
                            </HStack>
                            <Text>
                                There seems to be some issues with our server.
                                Sorry for that, we&#39;ll fix it as soon as
                                possible. If you see one of our devs please
                                share the following code with them:
                            </Text>
                            <Code
                                colorScheme="black"
                                maxHeight="100px"
                                overflow="scroll"
                                width="100%"
                                padding="5px"
                                borderRadius="10px"
                            >
                                {store.core.errorMessage.toString()}
                                {store.core.errorDetails}
                            </Code>
                        </VStack>
                    </Box>
                );
            },
            status: 'error',
            duration: 100000,
            isClosable: true,
            onCloseComplete: function () {
                store.core.errorMessage = false;
            }
        });
    }, [store.core, toast]);

    useEffect(() => {
        store.workflow.setShouldRunWorkflow(false);

        if (store.core.errorMessage) {
            renderToast();
        }
    }, [store.core.errorMessage, renderToast, store.workflow]);

    return (
        <Box zIndex={1} height="100%" position="relative" id="graph">
            <StatsModalComponent />
            <ContextMenuComponent />
            <GraphComponent
                graphData={
                    store.core.isDetail
                        ? store.graph.detailGraphData
                        : store.graph.graphData
                }
            />

            {!store.graph.currentGraphData.nodes.length && (
                <Center
                    width="100%"
                    height="100%"
                    backgroundColor={
                        colorMode === 'light' ? '#efefef' : '#1A202C'
                    }
                    position="fixed"
                    top="0"
                    left="0"
                >
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                        zIndex="20"
                    />
                </Center>
            )}
        </Box>
    );
}

export default observer(GraphPage);
