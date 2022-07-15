import { Flex, Text } from '@chakra-ui/react';

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
            >
                <Text>{data.label}</Text>
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
