import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function SelectedComponentList(props) {
    const store = useContext(RootStoreContext);

    const selectedComponentIds =
        store.graph.currentGraphData.selectedComponents;
    const components = store.graph.currentGraphData.components;

    const getData = () => {
        if (props.demoData.length) {
            return props.demoData;
        }

        return props.networkData === 'all'
            ? components
            : components.filter(c => selectedComponentIds.includes(c.id));
    };

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

    return (
        <VStack height="100%" width="100%" overflowY="scroll" spacing={1}>
            {getData()
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
                            {props.networkData!=='all' && <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
                                    onClick={() => {
                                        if (props.demoData.length) {
                                            store.graph.selectComponent(
                                                component.id
                                            );
                                        }
                                    }}
                                />
                            </Box>}
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
