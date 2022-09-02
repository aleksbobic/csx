import {
    AspectRatio,
    Box,
    Grid,
    GridItem,
    Heading,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function GraphStats(props) {
    const store = useContext(RootStoreContext);

    const renderGraphStats = (title, data) =>
        data.map((entry, index) => (
            <GridItem
                padding="2px"
                colSpan={1}
                backgroundColor="transparent"
                borderRadius={8}
                key={`${title}_${index}_${entry[1].count}_${entry[1].label}`}
            >
                <AspectRatio ratio={1} key={index} height="100%">
                    <Box
                        backgroundColor={'blackAlpha.900'}
                        borderRadius="10px"
                        width="100%"
                        height="100%"
                    >
                        <VStack
                            width="100%"
                            height="100%"
                            justifyContent="center"
                        >
                            <Text
                                color="whiteAlpha.900"
                                fontSize="xl"
                                fontWeight="bold"
                            >
                                {entry[1].count}
                            </Text>
                            <Tooltip label={entry[1].label}>
                                <Text
                                    color="whiteAlpha.600"
                                    textTransform="capitalize"
                                    opacity="0.75"
                                    textAlign="center"
                                    fontSize="xs"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    width="100%"
                                    paddingLeft="10px"
                                    paddingRight="10px"
                                    style={{ margin: '0px' }}
                                >
                                    {entry[1].label}
                                </Text>
                            </Tooltip>
                        </VStack>
                    </Box>
                </AspectRatio>
            </GridItem>
        ));

    const renderStatsGroup = (data, title) => (
        <VStack width="100%">
            <Heading
                textAlign="left"
                width="100%"
                paddingLeft="4px"
                size="xs"
                color="whiteAlpha.300"
                marginBottom="4px"
            >
                {title}
            </Heading>
            <Grid
                width="100%"
                templateColumns={
                    props.isExpanded
                        ? 'repeat(6, minmax(0, 1fr))'
                        : 'repeat(3, minmax(0, 1fr))'
                }
                gap={1}
                margin="0"
                padding="0"
            >
                {renderGraphStats(title, data)}
            </Grid>
        </VStack>
    );

    const getGraphData = () => {
        if (props.demoData) {
            return Object.entries(props.demoData.graphData);
        }

        return Object.entries(store.graph.graphObjectCount);
    };

    const getNodeData = () => {
        if (props.demoData) {
            return Object.entries(props.demoData.nodeData).map(entry => [
                entry[0],
                { count: entry[1].count, label: entry[0] }
            ]);
        }

        return Object.entries(store.graph.currentGraphData.types).map(entry => [
            entry[0],
            { count: entry[1].count, label: entry[0] }
        ]);
    };

    return (
        <VStack overflowY="scroll" maxHeight="100%" width="100%">
            {renderStatsGroup(getGraphData(), 'Graph Stats')}
            {renderStatsGroup(getNodeData(), 'Node Stats')}
        </VStack>
    );
}
GraphStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.object
};

GraphStats.defaultProps = {};

export default observer(GraphStats);
