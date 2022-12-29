import {
    AspectRatio,
    Box,
    Button,
    Heading,
    IconButton,
    SimpleGrid,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { Close } from 'css.gg';

import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function StudyGrid(props) {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const history = useHistory();

    const openStudy = studyUuid => {
        props.onOpenStudy();
        history.push(`/graph?study=${studyUuid}`);
    };

    return (
        <VStack
            marginTop="40px"
            padding="20px 10px"
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
            }
            borderRadius="12px"
        >
            <Heading colSpan={2} size="sm" opacity="0.76" width="100%">
                Studies
            </Heading>

            <OverlayScrollbarsComponent
                style={{
                    width: '100%',
                    height: '100%',
                    paddingLeft: '10px',
                    paddingRight: '10px'
                }}
                options={{
                    scrollbars: {
                        theme: 'os-theme-dark',
                        autoHide: 'scroll',
                        autoHideDelay: 600,
                        clickScroll: true
                    }
                }}
            >
                <SimpleGrid
                    width="100%"
                    columns={[1, 2, 3]}
                    spacing="10px"
                    padding="10px 0"
                    borderRadius="12px"
                    maxHeight="250px"
                >
                    {store.core.studies.map(study => (
                        <AspectRatio
                            ratio={1}
                            key={`study_${study.study_uuid}`}
                        >
                            <Box padding="3px" role="group">
                                <Box
                                    width="100%"
                                    height="100%"
                                    background="linear-gradient(129deg, rgba(102,74,182,1) 0%, rgba(153,115,188,1) 55%, rgba(172,109,182,1) 100%)"
                                    position="absolute"
                                    borderRadius="10px"
                                    zIndex="0"
                                    opacity="0"
                                    transition="all ease-in-out 0.3s"
                                    _groupHover={{ opacity: 1 }}
                                ></Box>
                                <Box
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? '#e2e2e2'
                                            : '#13161d'
                                    }
                                    borderRadius="8px"
                                    padding="10px"
                                    zIndex="2"
                                    height="100%"
                                    width="100%"
                                    boxShadow={
                                        colorMode === 'light'
                                            ? '0 0 0 3px #64646480'
                                            : '0 0 0 3px #64646480'
                                    }
                                    transition="all ease-in-out 0.3s"
                                    _groupHover={{
                                        boxShadow: 'none'
                                    }}
                                >
                                    <Tooltip label="Delete study">
                                        <IconButton
                                            size="xs"
                                            position="absolute"
                                            top="10px"
                                            right="10px"
                                            variant="ghost"
                                            zIndex="3"
                                            icon={
                                                <Close
                                                    style={{ '--ggs': '0.7' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Home Page - Study Grid',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: `Delete ${study.study_uuid}`
                                                    })
                                                );

                                                store.core.deleteStudy(
                                                    study.study_uuid
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                    <VStack
                                        height="100%"
                                        justifyContent="space-between"
                                        position="relative"
                                    >
                                        <Tooltip label={study.study_name}>
                                            <Text
                                                textAlign="left"
                                                fontWeight="bold"
                                                fontSize="sm"
                                                width="100%"
                                                paddingLeft="10px"
                                                paddingRight="20px"
                                                textTransform="uppercase"
                                                overflow="hidden"
                                                whiteSpace="nowrap"
                                                textOverflow="ellipsis"
                                                flexShrink="0"
                                            >
                                                {study.study_name}
                                            </Text>
                                        </Tooltip>
                                        <OverlayScrollbarsComponent
                                            style={{
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            options={{
                                                scrollbars: {
                                                    theme: 'os-theme-dark',
                                                    autoHide: 'scroll',
                                                    autoHideDelay: 600,
                                                    clickScroll: true
                                                }
                                            }}
                                        >
                                            <Text
                                                width="100%"
                                                heigh="100%"
                                                textAlign="left"
                                                fontSize="sm"
                                                paddingLeft="10px"
                                                paddingRight="10px"
                                                opacity="0.7"
                                            >
                                                {study.study_description
                                                    ? study.study_description
                                                    : 'No description yet ...'}
                                            </Text>
                                        </OverlayScrollbarsComponent>

                                        <Button
                                            width="100%"
                                            size="xs"
                                            flexShrink="0"
                                            backgroundColor={
                                                colorMode === 'light' &&
                                                '#d4d4d4'
                                            }
                                            _hover={{
                                                backgroundColor: '#925eb5',
                                                color:
                                                    colorMode === 'light' &&
                                                    'white'
                                            }}
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Home Page - Study Grid',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: `Open ${study.study_uuid}`
                                                    })
                                                );
                                                openStudy(study.study_uuid);
                                            }}
                                        >
                                            Open
                                        </Button>
                                    </VStack>
                                </Box>
                            </Box>
                        </AspectRatio>
                    ))}
                </SimpleGrid>
            </OverlayScrollbarsComponent>
        </VStack>
    );
}

StudyGrid.propTypes = {
    onOpenStudy: PropTypes.func
};

export default withRouter(observer(StudyGrid));
