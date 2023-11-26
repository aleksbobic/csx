import { Box, useColorMode, useToast } from '@chakra-ui/react';
import LeftPanel from 'components/interface/leftpanel/LeftPanel.component';
import NavigationPanelComponent from 'components/interface/navigation/NavigationPanel.component';
import { observer } from 'mobx-react';
import GraphPage from 'pages/graph/Graph.page';
import HomePage from 'pages/home/Home.page';
import SearchPage from 'pages/search/Search.page';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import {
    Switch as RRSwitch,
    Route,
    BrowserRouter as Router
} from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import './App.scss';

import CommentModal from 'components/feature/commentmodal/CommentModal.component';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { ErrorModal } from 'components/feature/errorModal/ErrorModal.component';
import { isEnvFalse, isEnvTrue } from 'general.utils';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PresentPage from 'pages/present/Present.page';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function CSX() {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const errorToastRef = useRef();
    const errorToast = useToast();

    useEffect(() => {
        window.addEventListener('beforeunload', () => {
            store.track.trackEvent(
                JSON.stringify({
                    area: 'Global'
                }),
                JSON.stringify({
                    item_type: null
                }),
                JSON.stringify({
                    event_type: 'Tab interaction',
                    event_action: 'Close tab'
                })
            );
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                store.track.trackEvent(
                    JSON.stringify({
                        area: 'Global'
                    }),
                    JSON.stringify({
                        item_type: null
                    }),
                    JSON.stringify({
                        event_type: 'Tab interaction',
                        event_action: 'Switch to another tab'
                    })
                );
            } else {
                store.track.trackEvent(
                    JSON.stringify({
                        area: 'Global'
                    }),
                    JSON.stringify({
                        item_type: null
                    }),
                    JSON.stringify({
                        event_type: 'Tab interaction',
                        event_action: 'Return to tab'
                    })
                );
            }
        });

        return () => {
            window.removeEventListener('beforeunload', () => {
                store.track.trackEvent(
                    JSON.stringify({
                        area: 'Global'
                    }),
                    JSON.stringify({
                        item_type: null
                    }),
                    JSON.stringify({
                        event_type: 'Tab interaction',
                        event_action: 'Close tab'
                    })
                );
            });
            window.removeEventListener('visibilitychange', () => {
                if (document.hidden) {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Global'
                        }),
                        JSON.stringify({
                            item_type: null
                        }),
                        JSON.stringify({
                            event_type: 'Tab interaction',
                            event_action: 'Switch to another tab'
                        })
                    );
                } else {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Global'
                        }),
                        JSON.stringify({
                            item_type: null
                        }),
                        JSON.stringify({
                            event_type: 'Tab interaction',
                            event_action: 'Return to tab'
                        })
                    );
                }
            });
        };
    }, [store.track]);

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
                <CompatRouter>
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
                                    <CommentModal />
                                    <LeftPanel />
                                    <GraphPage />
                                </Route>
                                <Route path="/graph" label="graph">
                                    <CommentModal />
                                    <LeftPanel />
                                    <GraphPage />
                                </Route>
                                <Route exact path="/present" label="present">
                                    <PresentPage />
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
                </CompatRouter>
            </Router>
        </HelmetProvider>
    );
}

export default observer(CSX);
