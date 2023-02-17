import {
    Box,
    Center,
    Divider,
    Heading,
    HStack,
    Image,
    Spinner,
    Text,
    useColorMode,
    VStack
} from '@chakra-ui/react';

import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router';
import { withRouter } from 'react-router-dom';
import Reveal from 'reveal.js';
import { RootStoreContext } from 'stores/RootStore';
import queryString from 'query-string';
import './Present.scss';

function PresentPage() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const location = useLocation();

    useEffect(() => {
        const studyID = queryString.parse(location.search).study;
        const activeItem = queryString.parse(location.search).active_item;
        store.present.generateSlides(studyID, activeItem);
    }, []);

    useEffect(() => {
        if (store.present.slides.length > 0) {
            const deck = new Reveal();
            deck.initialize({
                transition: 'slide',
                slideNumber: true,
                maxScale: 2.5
            });
        }
    }, [store.present.slides]);

    const renderLoader = () => (
        <Center
            width="100%"
            height="100%"
            backgroundColor={colorMode === 'light' ? '#efefef' : '#1A202C'}
            position="fixed"
            top="0"
            left="0"
            zIndex="2"
        >
            <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
                zIndex="20"
            />
        </Center>
    );

    const renderSlides = () => {
        return store.present.slides.map((slide, index) => {
            switch (slide.type) {
                case 'intro':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                        >
                            <Center>
                                <VStack padding="15%">
                                    <Heading size="sm">{slide.title}</Heading>
                                    <Text fontSize="md" padding="0 15%">
                                        {slide.text}
                                    </Text>

                                    <HStack
                                        justifyContent="space-between"
                                        width="100%"
                                        padding="15%"
                                    >
                                        <Text fontSize="sm">{slide.time}</Text>
                                        <Text fontSize="sm">
                                            {slide.author}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Center>
                        </Box>
                    );
                case 'markdown':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                        >
                            <ReactMarkdown
                                className="comment"
                                children={slide.content}
                                remarkPlugins={[remarkGfm]}
                                disallowedElements={['img', 'a']}
                            />
                        </Box>
                    );
                case 'markdownscreenshotandchart':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                            height="100%"
                            width="80%"
                        >
                            <HStack
                                flexDirection={
                                    index % 2 ? 'row' : 'row-reverse'
                                }
                                height="100%"
                                width="100%"
                            >
                                <Center
                                    className="fragment fade-in-then-out"
                                    width="70%"
                                    height="100%"
                                >
                                    <Box
                                        overflow="hidden"
                                        width="100%"
                                        height="100%"
                                    >
                                        <Image
                                            height="100%"
                                            objectFit="cover"
                                            objectPosition={`${slide.screenshotXOffset}% 0`}
                                            src={slide.screenshot}
                                        />
                                    </Box>
                                </Center>
                                <Center
                                    className="fragment fade-in"
                                    width="50%"
                                    height="100%"
                                    padding={
                                        index % 2
                                            ? '10% 0 10% 20%'
                                            : '10% 20% 10% 0'
                                    }
                                >
                                    <Image src={slide.chart} />
                                </Center>
                                <Center width="30%" height="100%">
                                    <Box
                                        textAlign={index % 2 ? 'left' : 'right'}
                                        width="100%"
                                    >
                                        <ReactMarkdown
                                            className="comment"
                                            children={slide.content}
                                            remarkPlugins={[remarkGfm]}
                                            disallowedElements={['img', 'a']}
                                        />
                                    </Box>
                                </Center>
                            </HStack>
                        </Box>
                    );
                case 'markdownchart':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                            height="100%"
                            width="80%"
                        >
                            <HStack
                                flexDirection={
                                    index % 2 ? 'row' : 'row-reverse'
                                }
                                height="100%"
                                width="100%"
                            >
                                <Center
                                    width="50%"
                                    height="100%"
                                    padding={
                                        index % 2
                                            ? '10% 0 10% 20%'
                                            : '10% 20% 10% 0'
                                    }
                                >
                                    <Image src={slide.chart} />
                                </Center>
                                <Center width="50%" height="100%">
                                    <Box
                                        textAlign={index % 2 ? 'left' : 'right'}
                                        width="100%"
                                    >
                                        <ReactMarkdown
                                            className="comment"
                                            children={slide.content}
                                            remarkPlugins={[remarkGfm]}
                                            disallowedElements={['img', 'a']}
                                        />
                                    </Box>
                                </Center>
                            </HStack>
                        </Box>
                    );
                case 'markdownscreenshot':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                            height="100%"
                            width="80%"
                        >
                            <HStack
                                flexDirection={
                                    index % 2 ? 'row' : 'row-reverse'
                                }
                                height="100%"
                                width="100%"
                            >
                                <Center width="70%" height="100%">
                                    <Box
                                        overflow="hidden"
                                        width="100%"
                                        height="100%"
                                    >
                                        <Image
                                            height="100%"
                                            objectFit="cover"
                                            objectPosition={`${slide.screenshotXOffset}% 0`}
                                            src={slide.screenshot}
                                        />
                                    </Box>
                                </Center>
                                <Center width="30%" height="100%">
                                    <Box
                                        textAlign={index % 2 ? 'left' : 'right'}
                                        width="100%"
                                    >
                                        <ReactMarkdown
                                            className="comment"
                                            children={slide.content}
                                            remarkPlugins={[remarkGfm]}
                                            disallowedElements={['img', 'a']}
                                        />
                                    </Box>
                                </Center>
                            </HStack>
                        </Box>
                    );
                default:
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                        >
                            <Center>
                                <VStack padding="15%">
                                    <Heading size="sm">{slide.title}</Heading>
                                    <Text>{slide.text}</Text>
                                </VStack>
                            </Center>
                        </Box>
                    );
            }
        });
    };

    return store.present.slides.length > 0 ? (
        <Box
            width="100%"
            height="100%"
            position="absolute"
            left="0"
            backgroundColor={colorMode === 'light' ? 'white' : '#171A23'}
            className="reveal"
        >
            <Box className="slides" data-transition="slide">
                <Box as="section">{renderSlides()}</Box>
            </Box>
        </Box>
    ) : (
        renderLoader()
    );
}

PresentPage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(PresentPage));
