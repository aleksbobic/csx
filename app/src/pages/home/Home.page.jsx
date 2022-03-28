import {
    AspectRatio,
    Box,
    Center,
    Container,
    Heading,
    HStack,
    Image,
    Link,
    LinkBox,
    LinkOverlay,
    SimpleGrid,
    Text,
    useColorMode
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';

function HomePage() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);

    useEffect(() => {
        store.track.trackPageChange();
        store.search.setSearchIsEmpty(false);
    });

    const renderServerNetworks = () => {
        const cardColor =
            colorMode === 'light' ? 'blackAlpha.50' : 'blackAlpha.400';
        const cardHoverColor =
            colorMode === 'light' ? 'blackAlpha.50' : 'blackAlpha.400';

        return store.core.availableDatasets.map(network => {
            return (
                <LinkBox as="article" key={network.name}>
                    <AspectRatio
                        ratio="1"
                        backgroundColor={'transparent'}
                        borderRadius="10px"
                        border="1px solid"
                        borderColor={cardColor}
                        transition="all ease-in-out .3s"
                        padding="20px"
                        _hover={{
                            backgroundColor: cardHoverColor,
                            shadow: 'xl',
                            borderColor: 'transparent'
                        }}
                    >
                        <Box>
                            <LinkOverlay
                                as={NavLink}
                                to={`/graph?id=${network.id}`}
                                onClick={() =>
                                    store.track.trackEvent(
                                        'homepage',
                                        'button click',
                                        `network: ${network.id}`
                                    )
                                }
                            >
                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    padding="10px"
                                    textTransform="uppercase"
                                    textAlign="center"
                                >
                                    {network.name}
                                </Text>
                            </LinkOverlay>
                        </Box>
                    </AspectRatio>
                </LinkBox>
            );
        });
    };

    const renderFooter = () => (
        <Container
            maxW="container.xl"
            justifyContent="space-evenly"
            display="flex"
        >
            <Center
                paddingTop="100px"
                paddingBottom="50px"
                maxWidth="300px"
                flexDir="column"
                alignItems="start"
            >
                <HStack justifyContent="center" marginBottom="20px">
                    <Image
                        src={logodark}
                        alt="Collaboration spotting logo"
                        height="20px"
                        display={colorMode === 'light' ? 'none' : 'block'}
                    />
                    <Image
                        src={logolight}
                        alt="Collaboration spotting logo"
                        height="20px"
                        display={colorMode === 'light' ? 'block' : 'none'}
                    />{' '}
                    <Text fontWeight="bold">Collaboration Spotting X</Text>
                </HStack>
                <Text marginBottom="20px" textAlign="left">
                    Developed at <b>CERN</b>, Geneva, Switzerland by{' '}
                    <b>Aleksandar Bobić</b> led by <b>Dr. Jean-Marie Le Goff</b>{' '}
                    and <b>prof. Christian Gütl</b>.
                </Text>
                <Text textAlign="left" fontWeight="bold">
                    CERN &copy; 2022
                </Text>
            </Center>
            <Center maxWidth="300px">
                <Text
                    fontStyle="italic"
                    fontSize="sm"
                    textAlign="left"
                    marginTop="20px"
                >
                    This project was inspired by the{' '}
                    <Link
                        fontWeight="bold"
                        textDecoration="underline"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://collaborationspotting.web.cern.ch/"
                        _hover={{ opacity: 1 }}
                    >
                        Collaboration Spotting project
                    </Link>
                    . We would like to thank the{' '}
                    <Link
                        fontWeight="bold"
                        textDecoration="underline"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://ercim-news.ercim.eu/en111/r-i/collaboration-spotting-a-visual-analytics-platform-to-assist-knowledge-discovery"
                        _hover={{ opacity: 1 }}
                    >
                        Collaboration Spotting team
                    </Link>{' '}
                    for their contributions.
                </Text>
            </Center>
        </Container>
    );

    return (
        store.search.datasets && (
            <Box
                className="App"
                backgroundColor={colorMode === 'light' ? 'white' : '#171A23'}
                paddingTop="150px"
            >
                <Center width="100%" minH="200px" flexDir="column">
                    <Image
                        src={logo}
                        height="40px"
                        alt="Collaboration spotting logo"
                        marginBottom="10px"
                    />
                    <Heading
                        fontSize="2xl"
                        fontWeight="extrabold"
                        marginBottom="20px"
                        textAlign="center"
                    >
                        COLLABORATION SPOTTING X
                    </Heading>
                </Center>
                <Container
                    marginTop="20px"
                    marginBottom="150px"
                    maxW="container.sm"
                >
                    <SearchBarComponent style={{ marginTop: '0px' }} />
                </Container>
                <Container maxW="container.md" marginBottom="350px">
                    <Heading
                        size="xs"
                        mb="20px"
                        mt="50px"
                        textAlign="center"
                        opacity="0.5"
                    >
                        Locally Available Datasets
                    </Heading>
                    <SimpleGrid
                        columns={{ sm: 3, md: 4, lg: 5, xl: 6 }}
                        spacing="20px"
                    >
                        {renderServerNetworks()}
                    </SimpleGrid>
                </Container>
                {renderFooter()}
            </Box>
        )
    );
}

HomePage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(HomePage));
