import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    Text,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function SelectedComponentList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);

    useEffect(() => {
        const components = store.graph.currentGraphData.components;

        if (props.demoData.length) {
            setData(props.demoData);
        } else if (props.networkData === 'all') {
            setData(components);
        } else {
            setData(
                components.filter(c =>
                    store.graph.currentGraphData.selectedComponents.includes(
                        c.id
                    )
                )
            );
        }
    }, [
        props.demoData,
        props.networkData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.graph.currentGraphData.selectedNodes
    ]);

    const renderComponentDetails = component => (
        <HStack>
            <Tag
                size="md"
                borderRadius="4px"
                variant="solid"
                backgroundColor="whiteAlpha.200"
            >
                <TagLabel>
                    {component.node_count}{' '}
                    {component.node_count === 1 ? 'node' : 'nodes'}
                </TagLabel>
            </Tag>
        </HStack>
    );

    if (data.length === 0) {
        return (
            <VStack
                height="100%"
                width="100%"
                overflowY="scroll"
                spacing={1}
                backgroundColor="blackAlpha.800"
                borderRadius="6px"
                justifyContent="center"
                padding="20%"
            >
                <Heading size="md" opacity="0.5">
                    NO DATA
                </Heading>
                {props.networkData !== 'all' && props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Select some components to see details here! 😉
                    </Text>
                )}
            </VStack>
        );
    }

    return (
        <VStack height="100%" width="100%" overflowY="scroll" spacing={1}>
            {data
                .slice()
                .sort((component1, component2) => {
                    if (component1.node_count > component2.node_count) {
                        return -1;
                    } else if (component1.node_count < component2.node_count) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .map(component => {
                    return (
                        <Stat
                            key={`selected_component_${component.id}`}
                            borderRadius="10px"
                            backgroundColor="blackAlpha.800"
                            padding="10px"
                            width="100%"
                            flex="0 1 0%"
                        >
                            <Heading
                                size="xs"
                                marginBottom={props.isExpanded ? '8px' : '0'}
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxWidth="300px"
                                paddingRight="30px"
                            >
                                Component {component.id}
                            </Heading>
                            {props.networkData !== 'all' && (
                                <Box position="absolute" top="4px" right="8px">
                                    <IconButton
                                        size="xs"
                                        border="none"
                                        variant="ghost"
                                        aria-label="Remove from list"
                                        icon={
                                            <Remove
                                                style={{ '--ggs': '0.8' }}
                                            />
                                        }
                                        onClick={() => {
                                            if (props.demoData.length) {
                                                store.graph.selectComponent(
                                                    component.id
                                                );
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                            {props.isExpanded &&
                                renderComponentDetails(component)}
                        </Stat>
                    );
                })}
        </VStack>
    );
}
SelectedComponentList.propTypes = {
    isExpanded: PropTypes.bool,
    networkData: PropTypes.string,
    demoData: PropTypes.array
};

SelectedComponentList.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: []
};

export default observer(SelectedComponentList);
