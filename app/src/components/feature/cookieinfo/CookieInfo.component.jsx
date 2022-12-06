import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    List,
    ListItem,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'css.gg';

import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function CookieInfo() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);

    const localStorageValues = [
        [
            'index_{name}',
            'Used for storing index data such as data types, features, and more. This data enables us to provide features such as smart connection cardinality in the network schemas, the correct input fields for particular search nodes, and much more.'
        ],
        [
            'chartConfig',
            'Used for storing the last configuration details of charts (widgets) in the data panel. This enables you to have the previously used charts when creating a new study with a previously explored dataset.'
        ],
        [
            'currentDatasetIndex',
            'Stores the currently selected dataset index, which is used to provide the correct index in the search bar when you reopen CSX and set multiple default settings when reopening CSX.'
        ],
        [
            'currentdataset',
            'Stores the currently selected dataset name, which is used similarly to the previous value for providing multiple default settings when reopening CSX.'
        ],
        [
            'useruuid',
            'Stores the unique ID generated for your browser. This is mainly used to provide features such as storing your settings, searches, and studies without asking you to log in and provide any personally identifiable information. This value will stay the same unless you clear your local storage data or switch your browser.'
        ],
        [
            'studyuuid',
            'Stores a unique ID generated for the currently selected study. This is mainly used to store data related to your study.'
        ],
        [
            'chakra-ui-color-mode',
            'Used to store the current color mode, which can be either dark or light and can be changed by clicking on the sun/moon icon.'
        ],
        [
            'hidecookiebanner',
            'Used to store the status of the cookie banner. Once you close the cookie banner, the message will disappear.'
        ],
        [
            'trackingenabled',
            'Used to store your choice regarding interaction tracking.'
        ]
    ];

    const renderInteractionTracking = () => (
        <Box>
            <Heading
                size="xs"
                textAlign="left"
                width="100%"
                paddingTop="20px"
                paddingLeft="16px"
            >
                Interaction Tracking
            </Heading>
            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px"
                opacity="0.7"
            >
                To further improve CSX and provide new and exciting features, we
                would like to ask you to enable interaction tracking. As you can
                see from the above-provided information, we do not store
                user-identifiable information. We will use the collected data
                for two purposes:
            </Text>

            <List fontSize="xs" width="100%" padding="8px" textAlign="left">
                <ListItem>
                    <ChevronRight
                        style={{
                            '--ggs': 0.5,
                            display: 'inline-block',
                            marginBottom: '-7px',
                            color: '#43a2fb'
                        }}
                    />
                    Improving CSX with new features and fixing bugs.
                </ListItem>
                <ListItem>
                    <ChevronRight
                        style={{
                            '--ggs': 0.5,
                            display: 'inline-block',
                            marginBottom: '-7px',
                            color: '#43a2fb'
                        }}
                    />
                    Contributing to research through interaction data analysis.
                </ListItem>
            </List>
            <Text fontSize="xs" textAlign="justify" padding="0 16px 16px">
                Please enable interaction trucking to enable us to{' '}
                <b style={{ color: '#43a2fb' }}>
                    contribute to the scientific community
                </b>
                ,{' '}
                <b style={{ color: '#43a2fb' }}>
                    make CSX an even better and fully featured open-source tool
                </b>
                , and{' '}
                <b style={{ color: '#43a2fb' }}>
                    provide its services to much broader communities
                </b>
                . This will allow us to collect additional interaction data with
                CSX (such as button clicks and page navigation) in addition to
                the data mentioned above and enable us to analyze the data
                associated with your unique ID for the purposes stated above.
            </Text>
            <FormControl display="flex" alignItems="center" paddingLeft="16px">
                <FormLabel
                    htmlFor="interaction-tracking"
                    marginBottom="0px"
                    fontSize="xs"
                >
                    Enable interaction tracking?
                </FormLabel>
                <Switch
                    id="interaction-tracking"
                    size="sm"
                    isChecked={store.core.trackingEnabled}
                    value={store.core.trackingEnabled}
                    onChange={e => {
                        store.core.setTrackingEnabled(e.target.checked);
                        store.core.setHideCookieBanner();
                    }}
                />
                <Text
                    fontSize="xs"
                    marginLeft="12px"
                    fontWeight="bold"
                    opacity="0.7"
                    paddingTop="1px"
                >
                    Tracking{' '}
                    {store.core.trackingEnabled ? 'enabled' : 'disabled'}
                </Text>
            </FormControl>
        </Box>
    );

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
                    <ChevronLeft
                        style={{ '--ggs': 0.6, marginRight: '-4px' }}
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
                onClick={() => store.core.setShowCookieInfo(false)}
            >
                Back
            </Button>
            <Heading size="md" opacity="0.7">
                Cookies & Local Storage
            </Heading>
            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px"
                opacity="0.7"
            >
                You might be wondering does Collaboration Spotting X use cookies
                and what is their purpose. In short, CSX does not use cookies.
                However, it does use local storage to store a multitude of
                values necessary to provide various features such as studies,
                multiple datasets, local settings storage, and more without
                demanding that you log in. Here you can find a short description
                of all local storage values and their purpose. Since storing
                these values is necessary for the system's proper functioning,
                these values are saved automatically. By using CSX, you also
                understand and agree that data such as your comments in studies
                and the study history have to be stored in our database.
            </Text>

            <Heading
                size="xs"
                textAlign="left"
                width="100%"
                paddingTop="20px"
                paddingLeft="16px"
            >
                Local Storage Values
            </Heading>
            <Box
                padding="16px"
                width="100%"
                paddingBottom="0px"
                paddingTop="0px"
            >
                <Table>
                    <Thead>
                        <Tr>
                            <Th
                                padding="8px"
                                paddingLeft="0"
                                borderBottom="none"
                                width="162px"
                            >
                                Value
                            </Th>
                            <Th padding="8px" borderBottom="none">
                                Purpose
                            </Th>
                        </Tr>
                    </Thead>
                </Table>
            </Box>
            <Box
                maxHeight="200px"
                backgroundColor="blackAlpha.200"
                padding="16px"
                borderRadius="8px"
                width="100%"
            >
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
                    <Box width="100%" height="168px">
                        <Table>
                            <Tbody>
                                {localStorageValues.map(entry => (
                                    <Tr
                                        opacity="0.5"
                                        transition="0.2s all ease-in-out"
                                        _hover={{ opacity: 1 }}
                                        key={`cookie_${entry[0]}`}
                                    >
                                        <Td
                                            borderBottom="none"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            padding="8px"
                                            textTransform="uppercase"
                                            verticalAlign="top"
                                            paddingLeft="0"
                                        >
                                            {entry[0]}
                                        </Td>
                                        <Td
                                            borderBottom="none"
                                            padding="8px"
                                            fontSize="xs"
                                        >
                                            {entry[1]}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </OverlayScrollbarsComponent>
            </Box>
            {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' &&
                renderInteractionTracking()}
        </VStack>
    );
}

CookieInfo.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(CookieInfo));
