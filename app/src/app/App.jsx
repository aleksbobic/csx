import { Box, useColorMode, useToast } from '@chakra-ui/react';
import ControlPanelComponent from 'components/interface/controlpanel/ControlPanel.component';
import NavigationPanelComponent from 'components/interface/navigation/NavigationPanel.component';
import { observer } from 'mobx-react';
import OverviewGraphPage from 'pages/graph/Graph.page';
import HomePage from 'pages/home/Home.page';
import SearchPage from 'pages/search/Search.page';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import {
    BrowserRouter as Router,
    Route,
    Switch as RRSwitch
} from 'react-router-dom';
import './App.scss';

import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { ErrorModal } from 'components/feature/errorModal/ErrorModal.component';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { isEnvFalse, isEnvTrue } from 'general.utils';

function CSX() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const errorToastRef = useRef();
    const errorToast = useToast();

    useEffect(() => {
        window.addEventListener('beforeunload', () => {
            store.track.trackEvent(
                'Global',
                'Tab Switch',
                JSON.stringify({
                    value: 'User closed the tab'
                })
            );
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                store.track.trackEvent(
                    'Global',
                    'Tab Switch',
                    JSON.stringify({
                        value: 'User switched to a different tab'
                    })
                );
            } else {
                store.track.trackEvent(
                    'Global',
                    'Tab Switch',
                    JSON.stringify({
                        value: 'User returned to the csx tab'
                    })
                );
            }
        });

        return () => {
            window.removeEventListener('beforeunload', () => {
                store.track.trackEvent(
                    'Global',
                    'Tab Switch',
                    JSON.stringify({
                        value: 'User closed the tab'
                    })
                );
            });
            window.removeEventListener('visibilitychange', () => {
                if (document.hidden) {
                    store.track.trackEvent(
                        'Global',
                        'Tab Switch',
                        JSON.stringify({
                            value: 'User switched to a different tab'
                        })
                    );
                } else {
                    store.track.trackEvent(
                        'Global',
                        'Tab Switch',
                        JSON.stringify({
                            value: 'User returned to the csx tab'
                        })
                    );
                }
            });
        };
    }, []);

    const renderErrorToast = useCallback(() => {
        errorToastRef.current = errorToast({
            render: () => (
                <ErrorModal
                    onClose={() => {
                        errorToast.close(errorToastRef.current);
                    }}
                />
            ),
            status: 'error',
            duration: 50000,
            isClosable: true,
            onCloseComplete: function () {
                store.core.setErrorDetails(null);
            }
        });
    }, [store.core, errorToast]);

    useEffect(() => {
        if (store.core.errorDetails) {
            renderErrorToast();
        } else {
            errorToast.closeAll();
        }
    }, [colorMode, errorToast, renderErrorToast, store.core.errorDetails]);

    return (
        <HelmetProvider>
            <Router>
                {isEnvTrue('REACT_APP_MANDATORY_HTTPS') && (
                    <Helmet>
                        <meta
                            http-equiv="Content-Security-Policy"
                            content="upgrade-insecure-requests"
                        />
                    </Helmet>
                )}
                <CustomScroll
                    style={{
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        backgroundColor:
                            colorMode === 'light' ? 'white' : '#171A23'
                    }}
                >
                    <NavigationPanelComponent />
                    <Box
                        backgroundColor={
                            colorMode === 'light' ? 'white' : '#171A23'
                        }
                        height="100%"
                        width="100%"
                        zIndex="1"
                    >
                        <RRSwitch>
                            <Route exact path="/" label="home">
                                <HomePage />
                            </Route>
                            <Route path="/graph/detail" label="graphdetail">
                                <ControlPanelComponent />
                                <OverviewGraphPage />
                            </Route>
                            <Route path="/graph" label="graph">
                                <ControlPanelComponent />
                                <OverviewGraphPage />
                            </Route>
                            {isEnvFalse(
                                'REACT_APP_DISABLE_ADVANCED_SEARCH'
                            ) && (
                                <Route path="/search" label="search">
                                    <SearchPage />
                                </Route>
                            )}
                        </RRSwitch>
                    </Box>
                </CustomScroll>
            </Router>
        </HelmetProvider>
    );
}

export default observer(CSX);
