import { Flex, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

import { Handle } from 'react-flow-renderer';

const schemaNode = ({ data, isConnectable }) => {
    return (
        <>
            <Handle
                type="target"
                position="top"
                style={{
                    bottom: 30,
                    background: '#555',
                    borderRadius: '5px',
                    height: '10px',
                    width: '20px',
                    marginTop: '-2px'
                }}
                isConnectable={isConnectable}
            />
            <Flex
                alignItems="center"
                fontSize="14px"
                paddingLeft="5px"
                paddingRight="5px"
                maxWidth="150px"
                width="150px"
                justifyContent="space-between"
            >
                <Tooltip label={data.label}>
                    <Text
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {data.label}
                    </Text>
                </Tooltip>
                <Tooltip
                    label={data.isVisible ? 'Hide node type' : 'Show node type'}
                >
                    <IconButton
                        className="nodrag"
                        size="xs"
                        marginLeft="10px"
                        background={
                            data.isVisible
                                ? '#3182CE'
                                : 'rgba(255, 255, 255, 0.08)'
                        }
                        _hover={{ background: '#3182CE' }}
                        onClick={() => {
                            data.toggleVisibility(data.label);
                        }}
                        icon={
                            <LightBulbIcon
                                style={{
                                    width: '14px',
                                    height: '14px'
                                }}
                            />
                        }
                    />
                </Tooltip>
            </Flex>
            <Handle
                type="source"
                position="bottom"
                style={{
                    bottom: 0,
                    background: '#555',
                    marginBottom: '-8px',
                    borderRadius: '5px',
                    height: '10px',
                    width: '20px'
                }}
                isConnectable={isConnectable}
            />
        </>
    );
};

export default schemaNode;
