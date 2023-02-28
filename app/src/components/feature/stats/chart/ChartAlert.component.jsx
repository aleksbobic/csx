import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import { Heading, Text, useColorMode, VStack } from '@chakra-ui/react';

function ChartAlert(props) {
    const { colorMode } = useColorMode();

    return (
        <VStack
            height="100%"
            width="100%"
            spacing={1}
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.200' : 'blackAlpha.800'
            }
            borderRadius="6px"
            justifyContent="center"
            padding="20%"
        >
            <Heading
                size={props.size}
                opacity="0.5"
                width="100%"
                textAlign="center"
            >
                {props.title}
            </Heading>

            {props.size === 'md' && (
                <Text
                    textAlign="center"
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.5"
                >
                    {props.message}
                </Text>
            )}
        </VStack>
    );
}

ChartAlert.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md'])
};

ChartAlert.defaultProps = {
    title: 'NO DATA',
    message:
        'Please select some elements to get useful insights from this chart! 😉',
    size: 'sm'
};

export default observer(ChartAlert);
