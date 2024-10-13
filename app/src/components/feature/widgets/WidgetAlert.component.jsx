import PropTypes from 'prop-types';

import { Heading, Text, useColorModeValue, VStack } from '@chakra-ui/react';

function WidgetAlert({
    title = 'NO DATA',
    message = 'Please select some elements to get useful insights from this chart! 😉',
    size = 'sm'
}) {
    const alertBackground = useColorModeValue(
        'blackAlpha.200',
        'blackAlpha.800'
    );

    return (
        <VStack
            height="100%"
            width="100%"
            spacing={1}
            backgroundColor={alertBackground}
            borderRadius="6px"
            justifyContent="center"
            padding="20%"
        >
            <Heading size={size} opacity="0.5" width="100%" textAlign="center">
                {title}
            </Heading>

            {size === 'md' && (
                <Text
                    textAlign="center"
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.5"
                >
                    {message}
                </Text>
            )}
        </VStack>
    );
}

WidgetAlert.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md'])
};

export default WidgetAlert;
