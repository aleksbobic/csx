import {
    Box,
    Code,
    Heading,
    HStack,
    IconButton,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { getReasonPhrase } from 'http-status-codes';
import CustomScroll from '../customscroll/CustomScroll.component';

export function ErrorModal(props) {
    const store = useContext(RootStoreContext);
    const modalBackground = useColorModeValue('white', '#202533');
    const modalBorder = useColorModeValue('#e6e6e6', '#343b50');
    const errorDetailsBackground = useColorModeValue(
        'blackAlpha.200',
        'blackAlpha.400'
    );

    const getAdditionalExplanations = code => {
        const explanationMap = new Map([
            [
                422,
                'You are most likely seeing this error because you tried uploading a dataset with an unsuported type.'
            ]
        ]);

        if (explanationMap.has(code)) {
            return explanationMap.get(code);
        }
        return null;
    };

    const renderAdditionalExplanation = () => {
        const additionalExplanation = getAdditionalExplanations(
            store.core.errorDetails.status
        );

        if (!additionalExplanation) {
            return <></>;
        }

        return (
            <Text
                fontSize="sm"
                textAlign="left"
                width="100%"
                fontWeight="bold"
                fontStyle="italic"
                display="inline"
            >
                {additionalExplanation}
            </Text>
        );
    };

    const renderSimpleError = () => (
        <Code
            colorScheme="black"
            maxHeight="100px"
            overflow="scroll"
            width="100%"
            padding="5px"
            borderRadius="10px"
        >
            {store.core.errorDetails}
        </Code>
    );

    const renderErrorProperty = (property, value) =>
        value && value !== '' ? (
            <Text fontSize="sm" textAlign="left" width="100%">
                <Text fontWeight="bold" as="span">
                    {property}:
                </Text>{' '}
                {value}
            </Text>
        ) : (
            <></>
        );
    const renderResponseErrorDetails = () => {
        return (
            <>
                {renderErrorProperty(
                    'Code',
                    `${store.core.errorDetails.status} - ${getReasonPhrase(
                        store.core.errorDetails.status
                    )}`
                )}
                {renderErrorProperty(
                    'Message',
                    store.core.errorDetails.data.detail[0].msg
                )}
            </>
        );
    };

    const renderComplexError = () => {
        return (
            <VStack
                backgroundColor={errorDetailsBackground}
                width="100%"
                borderRadius="6px"
                padding="10px 14px"
                maxHeight="95px"
            >
                <CustomScroll>
                    {renderErrorProperty('Type', store.core.errorDetails.type)}
                    {renderErrorProperty('URL', store.core.errorDetails.url)}
                    {renderErrorProperty(
                        'Method',
                        store.core.errorDetails.method
                    )}
                    {store.core.errorDetails.type === 'response' &&
                        renderResponseErrorDetails()}
                    {store.core.errorDetails.type === 'request' &&
                        renderErrorProperty(
                            'State',
                            store.core.errorDetails.status
                        )}
                    {store.core.errorDetails.type === 'setup' &&
                        renderErrorProperty(
                            'Message',
                            store.core.errorDetails.message
                        )}
                </CustomScroll>
            </VStack>
        );
    };

    return store.core.errorDetails ? (
        <Box
            backgroundColor={modalBackground}
            borderRadius="10px"
            padding="20px"
            marginBottom="20px"
            border="2px solid"
            borderColor={modalBorder}
        >
            <VStack width="400px" position="relative" alignItems="flex-start">
                <HStack justifyContent="space-between" width="100%">
                    <Heading size="sm" color="red.400">
                        Server error
                    </Heading>
                    <IconButton
                        variant="ghost"
                        size="sm"
                        borderRadius="10px"
                        icon={<Close style={{ '--ggs': 0.7 }} />}
                        onClick={() => {
                            props.onClose();
                        }}
                    />
                </HStack>
                <Text fontSize="sm">
                    We ran into some problems while executing your action. If
                    you see one of our devs please share the below details with
                    them.
                </Text>
                {store.core.errorDetails.type === 'request' && (
                    <Text
                        fontSize="sm"
                        textAlign="left"
                        width="100%"
                        fontWeight="bold"
                        fontStyle="italic"
                        display="inline"
                    >
                        If you're seeing this error it most likely means the
                        server isn't running. Please wait for a few minutes
                        before trying to analyise anything again.
                    </Text>
                )}
                {store.core.errorDetails.type === 'response' &&
                    renderAdditionalExplanation()}
                {typeof store.core.errorDetails === 'string'
                    ? renderSimpleError()
                    : renderComplexError()}
            </VStack>
        </Box>
    ) : (
        <></>
    );
}
