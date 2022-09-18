import { Box, Checkbox, Text, VStack, Wrap } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function Serp(props) {
    const store = useContext(RootStoreContext);

    const [visibleProperties, setVisibleProperties] = useState(
        Object.keys(store.search.nodeTypes).slice(0, 3)
    );

    const getDataComponent = (feature, value, index, feature_index) => {
        if (store.search.nodeTypes[feature] === 'string') {
            return (
                <Box
                    key={`serp_result_${index}_${feature_index}`}
                    padding="6px"
                    borderRadius="6px"
                    width="100%"
                >
                    <Text
                        fontSize="xs"
                        backgroundColor="blue.700"
                        marginRight="5px"
                        display="inline"
                        padding="3px 6px"
                        borderRadius="3px"
                        fontWeight="bold"
                    >
                        {feature.toUpperCase()}
                    </Text>
                    <Text fontSize="xs" width="100%" paddingTop="10px">
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Text>
                </Box>
            );
        }

        if (store.search.nodeTypes[feature] === 'list') {
            return (
                <Box
                    key={`serp_result_${index}_${feature_index}`}
                    padding="6px"
                    borderRadius="6px"
                    width="100%"
                >
                    <Text
                        fontSize="xs"
                        backgroundColor="blue.700"
                        marginRight="5px"
                        display="inline"
                        padding="3px 6px"
                        borderRadius="3px"
                        fontWeight="bold"
                    >
                        {feature.toUpperCase()}:
                    </Text>

                    <Text fontSize="xs" display="inline">
                        {String(value.filter(value => value !== '')).replace(
                            /,/g,
                            ' | '
                        )}
                    </Text>
                </Box>
            );
        }

        return (
            <Box
                key={`serp_result_${index}_${feature_index}`}
                padding="6px"
                borderRadius="6px"
                width="100%"
            >
                <Text
                    fontSize="xs"
                    backgroundColor="blue.700"
                    marginRight="5px"
                    display="inline"
                    padding="3px 6px"
                    borderRadius="3px"
                    fontWeight="bold"
                >
                    {feature.toUpperCase()}:
                </Text>

                <Text fontSize="xs" display="inline">
                    {value}
                </Text>
            </Box>
        );
    };
    const renderResult = (data, index) => {
        const propertyObjects = Object.keys(data)
            .filter(
                feature =>
                    !!store.search.nodeTypes[feature] &&
                    visibleProperties.includes(feature)
            )
            .map((feature, feature_index) =>
                getDataComponent(feature, data[feature], index, feature_index)
            );

        return (
            <VStack
                key={`serp_result_${index}`}
                backgroundColor="whiteAlpha.100"
                width="100%"
                padding="20px"
                borderRadius="6px"
            >
                {propertyObjects}
            </VStack>
        );
    };

    return (
        <VStack height="100%" width="100%" marginTop="20px">
            <Wrap paddingBottom="10px">
                {Object.keys(store.search.nodeTypes).map(feature => (
                    <Checkbox
                        isChecked={visibleProperties.includes(feature)}
                        key={`serp_list_checkbox_${feature}`}
                        size="sm"
                        onChange={e => {
                            if (e.target.checked) {
                                setVisibleProperties([
                                    ...visibleProperties,
                                    feature
                                ]);
                            } else {
                                setVisibleProperties([
                                    ...visibleProperties.filter(
                                        value => value !== feature
                                    )
                                ]);
                            }
                        }}
                    >
                        {feature}
                    </Checkbox>
                ))}
            </Wrap>
            <VStack
                height="100%"
                display="flex"
                flexDir="column"
                paddingTop="10px"
                alignItems="center"
                overflowY="scroll"
                spacing="10px"
                paddingBottom="20px"
            >
                {props.data.map((entry, index) => renderResult(entry, index))}
            </VStack>
        </VStack>
    );
}

Serp.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    hiddenColumns: PropTypes.array
};

Serp.defaultProps = {
    hiddenColumns: []
};

export default observer(Serp);
