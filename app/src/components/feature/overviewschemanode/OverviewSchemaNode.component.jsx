import {
    Flex,
    HStack,
    IconButton,
    Select,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Close, Link, MathPlus } from 'css.gg';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const overviewSchemaNode = ({ id, data }) => {
    const renderLabel = () => {
        if (data.features && data.isAnchor && data.position === 'left') {
            return (
                <Select
                    size="xs"
                    variant="filled"
                    width="100%"
                    borderRadius="6px"
                    marginTop="-2px"
                    value={data.anchor}
                    background="blackAlpha.500"
                    _hover={{ background: 'blackAlpha.700' }}
                    onChange={e => {
                        data.setAnchor(e.target.value);
                    }}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
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
                    borderRadius="6px"
                    marginRight="10px"
                    placeholder="Select link"
                    background="blackAlpha.500"
                    _hover={{ background: 'blackAlpha.700' }}
                    onChange={e => {
                        data.setLink(e.target.value, id);
                    }}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
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

        return (
            <Text
                width="150px"
                textAlign="left"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                paddingLeft="5px"
                paddingRight="5px"
            >
                {data.label}
            </Text>
        );
    };

    const renderAddLinkButton = position => (
        <Flex
            height="100%"
            width="30px"
            alignItems="center"
            position="absolute"
            top="0px"
            right={'0px'}
        >
            <Tooltip label="Add new link node">
                <IconButton
                    top="0px"
                    size="xs"
                    marginLeft={'auto'}
                    marginRight={'-15px'}
                    width="30px"
                    height="30px"
                    borderRadius="full"
                    backgroundColor="#323232"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    onClick={() => data.addLinkNode()}
                    _hover={{
                        backgroundColor: '#1f1f1f',
                        cursor: 'pointer'
                    }}
                    icon={
                        <Link
                            style={{
                                '--ggs': '0.7'
                            }}
                        />
                    }
                ></IconButton>
            </Tooltip>
        </Flex>
    );

    const renderAddNewPropertyArea = () => {
        return (
            <VStack height="auto" width="100%" spacing="5px" padding="0">
                {data.addedProperties.map((property, i) => (
                    <Flex
                        width="100%"
                        height="24px"
                        backgroundColor="blackAlpha.300"
                        borderRadius="6px"
                        alignItems="center"
                        paddingLeft="10px"
                        marginBottom="6px"
                        justifyContent="space-between"
                        key={`${i}_property_${property}`}
                    >
                        <Tooltip label={property}>
                            <Text
                                fontSize="xs"
                                fontWeight="bold"
                                width="100%"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                            >
                                {property}
                            </Text>
                        </Tooltip>
                        {data.position === 'left' && (
                            <Tooltip label="Remove anchor property">
                                <IconButton
                                    onClick={() =>
                                        data.removeProperty(property)
                                    }
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
                        )}
                    </Flex>
                ))}

                {data.position === 'left' &&
                    data.properties.filter(
                        property => !data.addedProperties.includes(property)
                    ).length > 0 && (
                        <HStack
                            height="auto"
                            width="100%"
                            spacing="5"
                            justifyContent="space-between"
                            style={{ marginTop: '0px' }}
                        >
                            <Select
                                id={`${id}_property_selector`}
                                size="xs"
                                variant="filled"
                                width="150px"
                                marginTop="-2px"
                                marginRight="6px"
                                defaultValue={data.properties[0]}
                                borderRadius="6px"
                                background="blackAlpha.500"
                                _hover={{ background: 'blackAlpha.600' }}
                            >
                                {data.properties
                                    .filter(
                                        property =>
                                            !data.addedProperties.includes(
                                                property
                                            )
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
                                    borderRadius="6px"
                                    backgroundColor="blackAlpha.500"
                                    onClick={() =>
                                        data.addProperty(
                                            document.getElementById(
                                                `${id}_property_selector`
                                            ).value
                                        )
                                    }
                                    _hover={{
                                        backgroundColor: 'blackAlpha.600'
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
                    )}
            </VStack>
        );
    };

    return (
        <>
            {data.isAnchor &&
                data.position === 'right' &&
                renderAddLinkButton('right')}
            {['right', 'both'].includes(data.position) && (
                <Handle
                    type="target"
                    position="left"
                    style={{
                        background: 'transparent',
                        border: 'none'
                    }}
                    isConnectable={false}
                />
            )}
            <Flex
                alignItems="center"
                fontSize="14px"
                padding={data.isAnchor ? '5px 10px 10px 0' : '0'}
            >
                {renderLabel()}

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
                    style={{ background: 'transparent', border: 'none' }}
                    isConnectable={false}
                />
            )}
            {data.isAnchor &&
                data.position === 'left' &&
                renderAddLinkButton('left')}
            {((data.isAnchor &&
                data.properties.length > 0 &&
                data.position === 'left') ||
                (data.isAnchor &&
                    data.addedProperties &&
                    data.addedProperties.length > 0)) && (
                <Flex
                    width="100%"
                    justifyContent="center"
                    height="auto"
                    borderTop="1px solid"
                    paddingTop="10px"
                    borderColor="whiteAlpha.100"
                    paddingRight="10px"
                >
                    {renderAddNewPropertyArea()}
                </Flex>
            )}
        </>
    );
};

export default overviewSchemaNode;
