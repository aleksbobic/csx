import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    Link,
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
    useColorModeValue,
    VStack
} from '@chakra-ui/react';

import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import 'overlayscrollbars/overlayscrollbars.css';
import { isEnvFalse } from 'general.utils';
import CustomScroll from '../../customscroll/CustomScroll.component';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function CookieInfo() {
    const { colorMode } = useColorMode();
    const textColor = useColorModeValue('black', 'white');
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
        ],
        [
            'surveyhidden',
            'Used to track if a user closed the survey popup. If set to true the popup will not appear.'
        ],
        [
            'neverShowInteractionsModal',
            'Used to track if a user closed the interactions modal. If set to true the modal will not appear.'
        ],
        [
            'finishedHomeJoyride',
            'Used to track if a user finished the home page tutorial. If set to true the tutorial will not appear.'
        ],
        [
            'finishedAdvancedSearchJoyride',
            'Used to track if a user finished the advanced search tutorial. If set to true the tutorial will not appear.'
        ],
        [
            'finishedGraphJoyride',
            'Used to track if a user finished the network analysis tutorial. If set to true the tutorial will not appear.'
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
                color={textColor}
            >
                Interaction Tracking
            </Heading>
            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px"
                opacity="0.7"
                color={textColor}
            >
                To further improve CSX and provide new and exciting features, we
                would like to ask you to enable interaction tracking. As you can
                see from the above-provided information, we do not store
                user-identifiable information. We will use the collected data
                for two purposes:
            </Text>

            <List
                fontSize="xs"
                width="100%"
                padding="8px"
                textAlign="left"
                color={textColor}
            >
                <ListItem>
                    <ChevronRightIcon
                        style={{
                            width: '12px',
                            height: '12px',
                            display: 'inline-block',
                            marginBottom: '-7px',
                            color: '#43a2fb'
                        }}
                    />
                    Improving CSX with new features (this may also include using
                    the data to train machine learning features such as
                    recommender systems) and fixing bugs.
                </ListItem>
                <ListItem>
                    <ChevronRightIcon
                        style={{
                            width: '12px',
                            height: '12px',
                            display: 'inline-block',
                            marginBottom: '-7px',
                            color: '#43a2fb'
                        }}
                    />
                    Contributing to research through interaction data analysis
                    and also through potentially open-sourcing the collected
                    data.
                </ListItem>
            </List>
            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px 16px"
                color={textColor}
            >
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
                The data will be stored only for the duration needed to conduct
                analysis and will be deleted after. It may be published in fully
                anonymised form in scientific publications. During the
                collection phase the data is stored on a server located in the
                European Union. If for any reason you decide to opt-out of the
                interaction tracking, you can do so by clicking the button
                below. Please note that this will not delete any of the data
                that has already been collected immediatelly but the data will
                not be used for analysis and will be deleted at the earliest
                possible time.
            </Text>

            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px 16px"
                color={textColor}
            >
                In case you decide to enable interaciton tracking we use{' '}
                <b style={{ color: '#43a2fb' }}>Matomo</b> which{' '}
                <b style={{ color: '#43a2fb' }}>will add additional cookies</b>.
                You can read about Matomo's cookies by visiting the{' '}
                <Link
                    fontWeight="bold"
                    textDecoration="underline"
                    opacity="0.75"
                    target="_blank"
                    href="https://matomo.org/faq/general/faq_146/"
                    _hover={{ opacity: 1 }}
                >
                    Matomo cookie explanation page
                </Link>
                .
            </Text>
            <FormControl display="flex" alignItems="center" paddingLeft="16px">
                <FormLabel
                    htmlFor="interaction-tracking"
                    marginBottom="0px"
                    fontSize="xs"
                    color={textColor}
                >
                    Enable interaction tracking?
                </FormLabel>
                <Switch
                    id="interaction-tracking"
                    size="sm"
                    isChecked={store.core.trackingEnabled}
                    value={store.core.trackingEnabled}
                    onChange={e => {
                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Home page',
                                sub_area: 'Tracking information panel'
                            }),
                            JSON.stringify({
                                item_type: 'Switch'
                            }),
                            JSON.stringify({
                                event_type: 'Toggle',
                                event_action: 'Toggle interaction tracking',
                                event_value: e.target.checked ? 'On' : 'Off'
                            })
                        );

                        store.core.setTrackingEnabled(e.target.checked);

                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Global'
                            }),
                            JSON.stringify({
                                item_type: null
                            }),
                            JSON.stringify({
                                event_type: 'Initialisation',
                                event_value: store.core.userUuid
                            })
                        );

                        store.core.setHideCookieBanner();
                    }}
                />
                <Text
                    fontSize="xs"
                    marginLeft="12px"
                    fontWeight="bold"
                    opacity="0.7"
                    paddingTop="1px"
                    color={textColor}
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
                    <ChevronLeftIcon
                        style={{
                            width: '12px',
                            height: '12px',
                            marginRight: '-4px'
                        }}
                    />
                }
                position="absolute"
                top="20px"
                left="20px"
                size="xs"
                paddingLeft="0"
                color={textColor}
                variant="ghost"
                _hover={{
                    backgroundColor:
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'whiteAlpha.100'
                }}
                onClick={() => {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Home page',
                            sub_area: 'Tracking information panel'
                        }),
                        JSON.stringify({
                            item_type: 'Button'
                        }),
                        JSON.stringify({
                            event_type: 'Click',
                            event_action: 'Close tracking information panel'
                        })
                    );
                    store.core.setShowCookieInfo(false);
                }}
            >
                Back
            </Button>
            <Heading size="md" opacity="0.7" color={textColor}>
                Cookies & Local Storage
            </Heading>
            <Text
                fontSize="xs"
                textAlign="justify"
                padding="0 16px"
                opacity="0.7"
                color={textColor}
            >
                You might be wondering does Collaboration Spotting X use cookies
                and what is their purpose. In short, CSX does not use cookies by
                default. However, it does use local storage to store a multitude
                of values necessary to provide various features such as studies,
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
                color={textColor}
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
                                color={textColor}
                            >
                                Value
                            </Th>
                            <Th
                                padding="8px"
                                borderBottom="none"
                                color={textColor}
                            >
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
                <CustomScroll
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
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
                                            color={textColor}
                                        >
                                            {entry[0]}
                                        </Td>
                                        <Td
                                            borderBottom="none"
                                            padding="8px"
                                            fontSize="xs"
                                            color={textColor}
                                        >
                                            {entry[1]}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </CustomScroll>
            </Box>
            {isEnvFalse('REACT_APP_DISABLE_TRACKING') &&
                renderInteractionTracking()}
        </VStack>
    );
}

CookieInfo.propTypes = {
    history: PropTypes.object
};

export default observer(CookieInfo);
