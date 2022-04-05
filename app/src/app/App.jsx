import { Box, useColorMode } from '@chakra-ui/react';
import ControlPanelComponent from 'components/interface/controlpanel/ControlPanel.component';
import NavigationPanelComponent from 'components/interface/navigation/NavigationPanel.component';
import { observer } from 'mobx-react';
import OverviewGraphPage from 'pages/graph/Graph.page';
import HomePage from 'pages/home/Home.page';
import SearchPage from 'pages/search/Search.page';
import {
    BrowserRouter as Router,
    Route,
    Switch as RRSwitch
} from 'react-router-dom';
import './App.scss';

function BasicExample() {
    const { colorMode } = useColorMode();

    return (
        <Router>
            <NavigationPanelComponent />
            <Box
                backgroundColor={colorMode === 'light' ? 'white' : '#171A23'}
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
                    <Route path="/search" label="search">
                        <SearchPage />
                    </Route>
                </RRSwitch>
            </Box>
        </Router>
    );
}

export default observer(BasicExample);
