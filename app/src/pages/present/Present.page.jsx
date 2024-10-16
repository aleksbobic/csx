import {
    Box,
    Center,
    Flex,
    Heading,
    HStack,
    IconButton,
    Image,
    Link,
    Spinner,
    Text,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import {
    ArrowDownTrayIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/20/solid';

import logo from 'images/logo.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Markdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import Reveal from 'reveal.js';
import { RootStoreContext } from 'stores/RootStore';
import './Present.scss';

function PresentPage() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [revealInstance, setRevealInstance] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        store.track.trackPageChange();
        const studyID = queryString.parse(location.search).study;
        const publicStudyID = queryString.parse(location.search).pstudy;
        const activeItem = queryString.parse(location.search).active_item;
        store.present.generateSlides(studyID, publicStudyID, activeItem);
    }, [location.search, store.present, store.track]);

    useEffect(() => {
        if (store.present.slides.length > 0) {
            const deck = new Reveal();
            setRevealInstance(deck);
            deck.initialize({
                transition: 'slide',
                slideNumber: false,
                controls: false,
                maxScale: 2.5
            });
            deck.on('slidechanged', e => {
                setCurrentSlide(e.indexv);

                store.track.trackEvent(
                    JSON.stringify({
                        area: 'Presentation page'
                    }),
                    JSON.stringify({
                        item_type: null
                    }),
                    JSON.stringify({
                        event_type: 'Key press',
                        event_action: 'Navigate to slide',
                        event_value: e.indexv
                    })
                );
            });
        }
    }, [store.present.slides, store.track]);

    useEffect(() => {
        if (store.core.studyIsEmpty) {
            navigate('/');
        }
    }, [navigate, store.core.studyIsEmpty]);

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
            let flexDirection;
            let textAlign;

            if (slide.align) {
                textAlign = slide.align;
                flexDirection = slide.align === 'left' ? 'row' : 'row-reverse';
            } else {
                textAlign = index % 2 ? 'left' : 'right';
                flexDirection = index % 2 ? 'row' : 'row-reverse';
            }

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
                            <Flex justifyContent="center" alignItems="center">
                                <Box maxWidth="800px">
                                    <Markdown
                                        className="mkdslide"
                                        children={slide.content}
                                        remarkPlugins={[remarkGfm]}
                                        disallowedElements={['img', 'a']}
                                        style={{ maxWidth: '800px' }}
                                    />
                                </Box>
                            </Flex>
                        </Box>
                    );
                case 'markdownmedia':
                    return (
                        <Box
                            as="section"
                            display="inherit !important"
                            key={`slide_${index}`}
                            data-background-color="#1A202C"
                            height="100%"
                            width="80%"
                            data-transition={
                                slide.transition ? slide.transition : 'slide'
                            }
                        >
                            <HStack
                                flexDirection={flexDirection}
                                height="100%"
                                width="100%"
                            >
                                <Box
                                    overflow="hidden"
                                    width="70%"
                                    height="auto"
                                    padding={slide.chart ? '50px' : '0px'}
                                >
                                    <Image
                                        src={
                                            slide.chart
                                                ? slide.chart
                                                : slide.screenshot
                                        }
                                    />
                                </Box>

                                <Box
                                    textAlign={textAlign}
                                    width="30%"
                                    height="auto"
                                    zIndex="5"
                                >
                                    <Markdown
                                        className="mkdslide"
                                        children={slide.content}
                                        remarkPlugins={[remarkGfm]}
                                        disallowedElements={['img', 'a']}
                                    />
                                </Box>
                            </HStack>
                        </Box>
                    );
                case 'final':
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
                                    <VStack paddingTop="15%">
                                        <Text fontSize="sm" fontWeight="bold">
                                            {slide.text}
                                        </Text>
                                        <Image
                                            src={logo}
                                            alt="Collaboration spotting X logo"
                                            height="50px"
                                        />
                                        <Link
                                            fontWeight="bold"
                                            textDecoration="underline"
                                            fontSize="sm"
                                            display="inline"
                                            color="blue.500"
                                            target="_blank"
                                            href="https://csxp.me"
                                        >
                                            csxp.me
                                        </Link>
                                    </VStack>
                                </VStack>
                            </Center>
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
            <Helmet>
                <title>{store.present.studyTitle}</title>
            </Helmet>
            <HStack
                width="100%"
                height="35px"
                position="absolute"
                left="0px"
                bottom="20px"
                zIndex="3"
                padding="0 20px"
                justifyContent="space-between"
            >
                <Text fontSize="md" fontWeight="bold">
                    {currentSlide + 1} / {store.present.slides.length}
                </Text>
                <HStack>
                    <IconButton
                        opacity="0.5"
                        variant="ghost"
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                            store.present.generatePPT();

                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Presentation page'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action:
                                        'Generate presentation file for study',
                                    event_value: queryString.parse(
                                        location.search
                                    ).study
                                })
                            );
                        }}
                        icon={<ArrowDownTrayIcon width="20px" height="20px" />}
                    />
                    <IconButton
                        opacity="0.5"
                        variant="ghost"
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                            revealInstance.next();

                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Presentation page'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action: 'Next slide'
                                })
                            );
                        }}
                        icon={<ChevronDownIcon width="20px" height="20px" />}
                    />
                    <IconButton
                        opacity="0.5"
                        variant="ghost"
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                            revealInstance.prev();

                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Presentation page'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action: 'Previous slide'
                                })
                            );
                        }}
                        icon={<ChevronUpIcon width="20px" height="20px" />}
                    />
                </HStack>
            </HStack>
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

export default observer(PresentPage);
