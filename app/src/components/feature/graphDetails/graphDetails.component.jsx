import { Heading, VStack, Wrap } from '@chakra-ui/layout';
import { Tag } from '@chakra-ui/tag';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import 'react-flow-renderer/dist/style.css';
import { RootStoreContext } from 'stores/RootStore';

function GraphDetails() {
    const store = useContext(RootStoreContext);

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
        <VStack spacing="20px" height="auto">
            <VStack width="100%">
                <Heading width="100%" textAlign="left" size="md">
                    Graph search term(s):
                </Heading>
                <Wrap width="100%">{renderSearchTerms()}</Wrap>
            </VStack>
        </VStack>
    );
}

export default observer(GraphDetails);
