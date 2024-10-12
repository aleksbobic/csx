import {
    Button,
    Heading,
    Image,
    Text,
    useColorMode,
    VStack
} from '@chakra-ui/react';

import { LightBulbIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function EmptyStudy() {
    const store = useContext(RootStoreContext);
    const [emptySearchImage, setEmptySearchImage] = useState(null);
    const [emptySearchAnimalType, setEmptySearchAnimalType] = useState(null);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!emptySearchImage) {
            store.search.getRandomImage().then(response => {
                setEmptySearchImage(response.image);
                setEmptySearchAnimalType(response.animal);
            });
        }
    }, [emptySearchImage, store.search]);

    return (
        <VStack
            marginTop="40px"
            padding="40px"
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
            }
            borderRadius="12px"
            position="relative"
        >
            <Button
                leftIcon={
                    <ChevronLeftIcon
                        style={{
                            width: '14px',
                            height: '14px',
                            marginRight: '-4px'
                        }}
                    />
                }
                position="absolute"
                top="20px"
                left="20px"
                size="xs"
                paddingLeft="0"
                variant="ghost"
                _hover={{
                    backgroundColor:
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'whiteAlpha.100'
                }}
                onClick={() => {
                    store.core.setStudyIsEmpty(false);
                    setEmptySearchImage(null);
                    setEmptySearchAnimalType(null);
                }}
            >
                Back
            </Button>
            <Heading textAlign="center" size="md">
                Study Not Found
            </Heading>
            <Text
                textAlign="center"
                color={
                    colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.500'
                }
                fontSize="xs"
                fontWeight="bold"
                width="70%"
            >
                It seems like the study you tried accessing doesn't exist
                anymore. Here's a cute tiny {emptySearchAnimalType} to make you
                feel better:
            </Text>
            {emptySearchImage && (
                <Image
                    // src={searchImage1}
                    src={`data:image/jpeg;base64,${emptySearchImage}`}
                    height="70px"
                    filter="grayscale(100%) contrast(150%)"
                    opacity={colorMode === 'light' ? '0.7' : '0.5'}
                    style={{ marginTop: '25px', marginBottom: '25px' }}
                />
            )}
            <Text
                textAlign="center"
                color={
                    colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.500'
                }
                fontSize="xs"
                fontWeight="bold"
                width="70%"
            >
                <LightBulbIcon
                    width="12px"
                    style={{
                        display: 'inline',
                        marginRight: '2px'
                    }}
                />{' '}
                If you tried accessing a study you created make sure to save the
                study before leaving Collaboration Spotting X.
            </Text>
            <Text
                textAlign="center"
                color={
                    colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.500'
                }
                fontSize="xs"
                fontWeight="bold"
                width="70%"
            >
                <LightBulbIcon
                    width="12px"
                    style={{
                        display: 'inline',
                        marginRight: '2px'
                    }}
                />{' '}
                If you tried accessing a study someone shared with you make sure
                they made it publically available.
            </Text>
        </VStack>
    );
}

EmptyStudy.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(EmptyStudy));
