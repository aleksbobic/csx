import {
    Box,
    Heading,
    HStack,
    IconButton,
    Input,
    Select,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';
import { Handle } from 'react-flow-renderer';

const countsNode = ({ id, data, isConnectable }) => {
    const modifyFeatureName = value => {
        data.newFeatureName = value.target.value;
    };

    const modifyFeature = value => {
        data.feature = value.target.value;
    };

    return (
        <>
            <Box
                backgroundColor="blackAlpha.300"
                borderRadius="8px"
                padding="8px"
            >
                <Handle
                    type="target"
                    position="top"
                    style={{
                        bottom: 30,
                        background: '#555',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
                <VStack alignItems="start" fontSize="14px">
                    <HStack width="100%" justifyContent="space-between">
                        <Heading size="xs">Count values</Heading>
                        <Tooltip label="Remove node">
                            <IconButton
                                size="xs"
                                icon={<Close />}
                                onClick={() => data.deleteNode(id)}
                            />
                        </Tooltip>
                    </HStack>
                    <Tooltip label="Column containing list values which should be counted.">
                        <Select
                            margin="0px"
                            variant="filled"
                            size="sm"
                            defaultValue={data.feature}
                            borderRadius="5px"
                            onChange={modifyFeature}
                            background="whiteAlpha.200"
                            opacity="0.8"
                            _hover={{
                                opacity: 1,
                                cursor: 'pointer'
                            }}
                            _focus={{
                                opacity: 1,
                                cursor: 'pointer'
                            }}
                        >
                            {data.features.map((feature, index) => (
                                <option
                                    key={`search_node_${feature}_${index}`}
                                    value={feature}
                                >
                                    {feature}
                                </option>
                            ))}
                        </Select>
                    </Tooltip>
                    <Tooltip label="New column name which will contain the list value counts.">
                        <Input
                            size="sm"
                            variant="filled"
                            type="text"
                            defaultValue={data.newFeatureName}
                            placeholder="New feature name"
                            margin="0px"
                            borderRadius="5px"
                            onChange={modifyFeatureName}
                            opacity="0.8"
                            background="whiteAlpha.200"
                            _hover={{
                                opacity: 1
                            }}
                            _focus={{ opacity: 1 }}
                        ></Input>
                    </Tooltip>
                </VStack>
                <Handle
                    type="source"
                    position="bottom"
                    style={{
                        bottom: 0,
                        background: '#555',
                        marginBottom: '-5px',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
            </Box>
        </>
    );
};

export default countsNode;
