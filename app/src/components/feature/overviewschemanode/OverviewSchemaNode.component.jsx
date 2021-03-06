import {
    Flex,
    HStack,
    IconButton,
    Select,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Anchor, Close, MathPlus } from 'css.gg';
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
                    background="blackAlpha.600"
                    _hover={{ background: 'blackAlpha.700' }}
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
                    background="blackAlpha.600"
                    _hover={{ background: 'blackAlpha.700' }}
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

    const renderAddLinkButton = position => (
        <Flex
            height="100%"
            width="30px"
            alignItems="center"
            position="absolute"
            top="0px"
            left={position === 'right' ? '0px' : 'auto'}
            right={position === 'right' ? 'auto' : '0px'}
        >
            <Tooltip label="Add new link node">
                <IconButton
                    top="0px"
                    size="xs"
                    marginLeft={position === 'right' ? '-34px' : 'auto'}
                    marginRight={position === 'right' ? 'auto' : '-34px'}
                    width="30px"
                    height="30px"
                    borderRadius="full"
                    backgroundColor="blue.500"
                    onClick={() => data.addLinkNode()}
                    _hover={{ backgroundColor: 'blue.600' }}
                    icon={
                        <MathPlus
                            style={{
                                '--ggs': '0.7'
                            }}
                        />
                    }
                ></IconButton>
            </Tooltip>
        </Flex>
    );

    const renderAddNewPropertyArea = () => (
        <VStack height="auto" width="100%" spacing="5px" padding="5px">
            {data.addedProperties.map((property, i) => (
                <Flex
                    width="100%"
                    key={`${i}_property_${property}`}
                    height="24px"
                    backgroundColor="blackAlpha.600"
                    borderRadius="6px"
                    alignItems="center"
                    paddingLeft="10px"
                    paddingRight="0"
                    justifyContent="space-between"
                >
                    <Text fontSize="xs" fontWeight="bold">
                        {property}
                    </Text>
                    <Tooltip label="Remove anchor property">
                        <IconButton
                            onClick={() => data.removeProperty(property)}
                            size="xs"
                            variant="ghost"
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
            ))}

            <HStack
                height="36px"
                padding="3px 0px"
                width="100%"
                spacing="5"
                style={{ marginTop: '0px' }}
            >
                <Select
                    id={`${id}_property_selector`}
                    size="xs"
                    variant="filled"
                    width="150px"
                    marginTop="-2px"
                    marginRight="10px"
                    defaultValue={data.properties[0]}
                    borderRadius="6px"
                    background="blackAlpha.400"
                    _hover={{ background: '#143e66' }}
                >
                    {data.properties
                        .filter(
                            property => !data.addedProperties.includes(property)
                        )
                        .map((feature, id) => (
                            <option value={feature} key={id}>
                                {feature}
                            </option>
                        ))}
                </Select>
                <Tooltip label="Add selected feature as anchor property">
                    <IconButton
                        size="xs"
                        borderRadius="full"
                        backgroundColor="blackAlpha.300"
                        onClick={() =>
                            data.addProperty(
                                document.getElementById(
                                    `${id}_property_selector`
                                ).value
                            )
                        }
                        _hover={{
                            backgroundColor: 'blue.600'
                        }}
                        style={{ marginLeft: '0px' }}
                        rightIcon={
                            <MathPlus
                                style={{
                                    marginLeft: '-8px',
                                    marginTop: '0px',
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    ></IconButton>
                </Tooltip>
            </HStack>
        </VStack>
    );

    return (
        <>
            {data.isAnchor &&
                data.position === 'right' &&
                renderAddLinkButton('right')}
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
                padding={
                    data.isAnchor ? '5px 5px 10px 10px' : '0px 5px 0px 10px'
                }
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
            {data.isAnchor &&
                data.position === 'left' &&
                renderAddLinkButton('left')}
            {data.isAnchor && (
                <Flex
                    width="100%"
                    justifyContent="center"
                    height="auto"
                    marginTop="0"
                    borderTop="1px solid"
                    borderTopColor="blackAlpha.300"
                    backgroundColor="blackAlpha.400"
                    borderBottomLeftRadius="8px"
                    borderBottomRightRadius="8px"
                >
                    {renderAddNewPropertyArea()}
                </Flex>
            )}
        </>
    );
};

export default overviewSchemaNode;
