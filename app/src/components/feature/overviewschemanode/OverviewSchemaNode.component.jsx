import { Flex, IconButton, Select, Text, Tooltip } from '@chakra-ui/react';
import { Add, Anchor, Close } from 'css.gg';
import React from 'react';

import { Handle } from 'react-flow-renderer';

const overviewSchemaNode = ({ id, data }) => {
    const renderLabel = () => {
        if (data.features && data.isAnchor) {
            return (
                <Select
                    size="xs"
                    variant="filled"
                    width="150px"
                    marginTop="-2px"
                    marginRight="10px"
                    value={data.anchor}
                    background="#1e5c97"
                    _hover={{ background: '#143e66' }}
                    onChange={e => {
                        data.setAnchor(e.target.value);
                    }}
                >
                    {data.features.map((feature, id) => (
                        <option value={feature} key={id}>
                            {feature}
                        </option>
                    ))}
                </Select>
            );
        }

        if (data.features && data.isLink && !data.label) {
            return (
                <Select
                    size="xs"
                    variant="filled"
                    width="150px"
                    marginTop="-2px"
                    marginRight="10px"
                    placeholder="Select link"
                    background="#1c1c1c"
                    _hover={{ background: '#080808' }}
                    onChange={e => {
                        data.setLink(e.target.value, id);
                    }}
                >
                    {data.features
                        .filter(entry => entry !== data.anchor)
                        .map((feature, id) => (
                            <option value={feature} key={id}>
                                {feature}
                            </option>
                        ))}
                </Select>
            );
        }

        return <Text>{data.label}</Text>;
    };

    return (
        <>
            {data.isAnchor && data.position === 'right' && (
                <Tooltip label="Add new link node">
                    <IconButton
                        position="absolute"
                        left="0px"
                        top="0px"
                        size="xs"
                        marginLeft="-34px"
                        width="30px"
                        height="30px"
                        borderRadius="full"
                        backgroundColor="#3182ce"
                        onClick={() => data.addLinkNode()}
                        _hover={{ opacity: 0.8, backgroundColor: '#3182ce' }}
                        icon={
                            <Add
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    ></IconButton>
                </Tooltip>
            )}
            {['right', 'both'].includes(data.position) && (
                <Handle
                    type="target"
                    position="left"
                    style={{ background: '#555' }}
                    isConnectable={false}
                />
            )}
            <Flex
                alignItems="center"
                fontSize="14px"
                paddingLeft="10px"
                paddingRight="5px"
            >
                {renderLabel()}
                {data.isAnchor && (
                    <Tooltip label="This is an anchor">
                        <Anchor
                            style={{
                                marginLeft: '10px',
                                marginRight: '5px',
                                '--ggs': '0.7'
                            }}
                        />
                    </Tooltip>
                )}
                <Tooltip label={'Remove link node'}>
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
                        onClick={() =>
                            data.label
                                ? data.setLink(data.label, id)
                                : data.removeLink(id)
                        }
                        opacity={data.isLink ? 1 : 0.5}
                        icon={
                            <Close
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    />
                </Tooltip>
            </Flex>
            {['left', 'both'].includes(data.position) && (
                <Handle
                    type="source"
                    position="right"
                    style={{ background: '#555' }}
                    isConnectable={false}
                />
            )}
            {data.isAnchor && data.position === 'left' && (
                <Tooltip label="Add new link node">
                    <IconButton
                        position="absolute"
                        right="0px"
                        top="0px"
                        size="xs"
                        marginRight="-34px"
                        width="30px"
                        height="30px"
                        borderRadius="full"
                        backgroundColor="#3182ce"
                        onClick={() => data.addLinkNode()}
                        _hover={{ opacity: 0.8, backgroundColor: '#3182ce' }}
                        icon={
                            <Add
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    ></IconButton>
                </Tooltip>
            )}
        </>
    );
};

export default overviewSchemaNode;
