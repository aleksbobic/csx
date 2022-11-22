import { Box, useColorMode } from '@chakra-ui/react';
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

function CSX() {
    const { colorMode } = useColorMode();

    return (
        <HelmetProvider>
            <Router>
                {process?.env.REACT_APP_MANDATORY_HTTPS === 'true' && (
                    <Helmet>
                        <meta
                            http-equiv="Content-Security-Policy"
                            content="upgrade-insecure-requests"
                        />
                    </Helmet>
                )}
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
                        {process?.env.REACT_APP_DISABLE_ADVANCED_SEARCH !==
                            'true' && (
                            <Route path="/search" label="search">
                                <SearchPage />
                            </Route>
                        )}
                    </RRSwitch>
                </Box>
            </Router>
        </HelmetProvider>
    );
}

export default observer(CSX);
