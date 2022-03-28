import { useColorModeValue } from '@chakra-ui/color-mode';
import {
    AspectRatio,
    Heading,
    SimpleGrid,
    VStack,
    Wrap
} from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/react';
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat';
import { Tag } from '@chakra-ui/tag';
import { Tooltip } from '@chakra-ui/tooltip';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import Dotdotdot from 'react-dotdotdot';
import 'react-flow-renderer/dist/style.css';
import { RootStoreContext } from 'stores/RootStore';

function GraphDetails() {
    const store = useContext(RootStoreContext);
    const statBackgroundColor = useColorModeValue('white', 'black');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');

    const renderGeneralStats = () => {
        const graphCounts = Object.entries(store.graph.graphObjectCount);

        if (!graphCounts.length) {
            return (
                <SimpleGrid
                    columns={{ sm: 3, md: 3, lg: 4, xl: 5, '2xl': 6 }}
                    spacing="10px"
                    width="100%"
                >
                    <AspectRatio ratio={1}>
                        <Skeleton width="auto" borderRadius="10px"></Skeleton>
                    </AspectRatio>
                    <AspectRatio>
                        <Skeleton width="auto" borderRadius="10px"></Skeleton>
                    </AspectRatio>
                </SimpleGrid>
            );
        }

        return (
            <SimpleGrid
                columns={{ sm: 3, md: 3, lg: 4, xl: 5, '2xl': 6 }}
                spacing="10px"
                width="100%"
            >
                {graphCounts.map((entry, index) => (
                    <AspectRatio ratio={1} key={index}>
                        <Stat
                            backgroundColor={statBackgroundColor}
                            padding="10px"
                            borderRadius="10px"
                            width="100%"
                            border="1px solid"
                            borderColor={edgeColor}
                        >
                            <StatNumber textAlign="center" fontSize="md">
                                {entry[1].count}
                            </StatNumber>
                            <StatLabel
                                textTransform="capitalize"
                                opacity="0.75"
                                textAlign="center"
                                fontSize="xs"
                            >
                                {entry[0]}
                            </StatLabel>
                        </Stat>
                    </AspectRatio>
                ))}
            </SimpleGrid>
        );
    };

    const renderNodeStats = () => {
        const graphTypes = Object.entries(store.graph.currentGraphData.types);

        if (!graphTypes.length) {
            return (
                <SimpleGrid
                    columns={{ sm: 3, md: 3, lg: 4, xl: 5, '2xl': 6 }}
                    spacing="10px"
                    width="100%"
                >
                    <AspectRatio ratio={1}>
                        <Skeleton width="auto" borderRadius="10px"></Skeleton>
                    </AspectRatio>
                    <AspectRatio ratio={1}>
                        <Skeleton width="auto" borderRadius="10px"></Skeleton>
                    </AspectRatio>
                    <AspectRatio ratio={1}>
                        <Skeleton width="auto" borderRadius="10px"></Skeleton>
                    </AspectRatio>
                </SimpleGrid>
            );
        }

        return (
            <SimpleGrid
                columns={{ sm: 3, md: 3, lg: 4, xl: 5, '2xl': 6 }}
                spacing="10px"
                width="100%"
            >
                {graphTypes.map((entry, index) => (
                    <AspectRatio ratio={1} key={index}>
                        <Stat
                            backgroundColor={statBackgroundColor}
                            padding="10px"
                            borderRadius="10px"
                            width="100%"
                            border="1px solid"
                            borderColor={edgeColor}
                            size="sm"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <StatNumber textAlign="center" fontSize="md">
                                {entry[1].count}
                            </StatNumber>
                            <Tooltip label={entry[0]}>
                                <StatLabel
                                    textTransform="capitalize"
                                    opacity="0.75"
                                    textAlign="center"
                                    fontSize="xs"
                                    paddingLeft="10px"
                                    paddingRight="10px"
                                >
                                    <Dotdotdot clamp={2}>{entry[0]}</Dotdotdot>
                                </StatLabel>
                            </Tooltip>
                        </Stat>
                    </AspectRatio>
                ))}
            </SimpleGrid>
        );
    };

    const renderSearchTerms = () => {
        try {
            const keywords = JSON.parse(
                store.graph.currentGraphData.meta.query
            );
            return keywords.map((entry, i) => (
                <Tag
                    key={`${entry.label}${i}`}
                    variant="subtle"
                    colorScheme="blue"
                >
                    {entry.label}
                </Tag>
            ));
        } catch (error) {
            return (
                <Tag variant="subtle" colorScheme="blue">
                    {store.graph.currentGraphData.meta.query}
                </Tag>
            );
        }
    };

    return (
        <VStack spacing="20px" height="100%">
            <VStack width="100%">
                <Heading width="100%" textAlign="left" size="md">
                    Graph search term(s):
                </Heading>
                <Wrap width="100%">{renderSearchTerms()}</Wrap>
            </VStack>
            <VStack width="100%">
                <Heading width="100%" textAlign="left" size="md">
                    General:
                </Heading>
                {renderGeneralStats()}
            </VStack>
            <VStack width="100%">
                <Heading width="100%" textAlign="left" size="md">
                    Node types:
                </Heading>
                {renderNodeStats()}
            </VStack>
        </VStack>
    );
}

export default observer(GraphDetails);
