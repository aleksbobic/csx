import { Flex, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { Anchor, Link } from 'css.gg';
import React from 'react';

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
                paddingLeft="10px"
                paddingRight="5px"
            >
                <Text>{data.label}</Text>
                <Tooltip label="Use as anchor">
                    <IconButton
                        marginLeft="10px"
                        size="sm"
                        minWidth="20px"
                        height="20px"
                        width="20px"
                        variant="ghost"
                        disabled={data.isAnchor}
                        _disabled={{ opacity: 1, cursor: 'default' }}
                        _hover={{ opacity: 1 }}
                        onClick={() => data.setAnchor(data.label)}
                        opacity={data.isAnchor ? 1 : 0.5}
                        icon={
                            <Anchor
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    />
                </Tooltip>
                <Tooltip
                    label={data.isLink ? 'Remove from links' : 'Add to links'}
                >
                    <IconButton
                        marginLeft="5px"
                        size="sm"
                        minWidth="20px"
                        height="20px"
                        width="20px"
                        variant="ghost"
                        disabled={data.isAnchor}
                        _disabled={{ display: 'none' }}
                        _hover={{ opacity: 1 }}
                        onClick={() => data.setLink(data.label)}
                        opacity={data.isLink ? 1 : 0.5}
                        icon={
                            <Link
                                style={{
                                    '--ggs': '0.7'
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
