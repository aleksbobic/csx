import { Box, useColorMode } from '@chakra-ui/react';
import ControlPanelComponent from 'components/interface/controlpanel/ControlPanel.component';
import NavigationPanelComponent from 'components/interface/navigation/NavigationPanel.component';
import { observer } from 'mobx-react';
import HomePage from 'pages/home/Home.page';
import OverviewGraphPage from 'pages/graph/Graph.page';
import SearchPage from 'pages/search/Search.page';
import { useContext } from 'react';
import Joyride from 'react-joyride';
import {
    BrowserRouter as Router,
    Route,
    Switch as RRSwitch
} from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './App.scss';

function BasicExample() {
    const { colorMode } = useColorMode();

    const store = useContext(RootStoreContext);

    const clickElement = selector => {
        const element = document.querySelector(selector);
        element.click();
    };

    const guidePrevStep = step => {
        switch (step) {
            case 2:
                clickElement('#viewsettingstab');
                break;
            case 4:
                clickElement('#demonavigation div>span:first-child');
                break;
            case 5:
                clickElement('#navigationtab');
                break;
            case 7:
                clickElement('#colorschemeselector label:nth-child(2) input');
                break;
            case 10:
                store.graphInstance.stopForce();
                store.graph.resetNodesPositions();
                break;
            case 11:
                clickElement('#datapnaletoggle');
                break;
            case 13:
                clickElement('#detailstab');
                break;
            case 14:
                document.querySelector('#nodesearch').value = '';
                clickElement('#nodesearchbutton');
                setTimeout(() => clickElement('#zoomtofitbutton'), 200);
                break;
            case 15:
                clickElement('#closedirectconnections');
                clickElement('#nodelistbody > tr > td > div > dl > dd');
                break;
            case 17:
                clickElement('#directconnections');
                break;
            default:
                break;
        }
    };

    // Take care of back and forward movement
    const guideNextStep = step => {
        switch (step) {
            case 0:
                clickElement('#navigationtab');
                break;
            case 3:
                clickElement('#demonavigation div>span:last-child');
                break;
            case 4:
                clickElement('#viewsettingstab');
                break;
            case 6:
                clickElement('#colorschemeselector label:last-child input');
                break;
            case 9:
                clickElement('#applyforcebutton');
                break;
            case 10:
                clickElement('#datapnaletoggle');
                break;
            case 12:
                clickElement('#resultstab');
                break;
            case 13:
                document.querySelector('#nodesearch').value = 'Austria';
                clickElement('#nodesearchbutton');
                setTimeout(
                    () =>
                        clickElement('#nodelistbody > tr > td > div > dl > dd'),
                    200
                );
                break;
            case 14:
                const node = store.graph.currentGraphData.nodes.find(
                    node => node.label === 'Austria'
                );
                store.contextMenu.showContextMenu(node, 0, 0);
                store.graphInstance.triggerSelfCentric();
                clickElement('#zoomtofitbutton');
                store.contextMenu.hideContextMenu();
                break;
            case 15:
                const index = store.graph.currentGraphData.nodes.findIndex(
                    node =>
                        node.label ===
                        'compensation models for interactive advertising'
                );
                store.contextMenu.showContextMenu(
                    store.graph.currentGraphData.nodes[index],
                    0,
                    0
                );

                store.graph.toggleNodeSelection(
                    store.graph.currentGraphData.nodes[index].id,
                    -1
                );
                break;
            case 16:
                clickElement('#mutualconnectionsbutton');
                break;
            case 17:
                clickElement('#zoomtofitbutton');
                break;
            default:
                break;
        }
    };

    return (
        <Router>
            {store.core.demoMode &&
                store.graph.currentGraphData.meta.graphID ===
                    'getting_started' && (
                    <Joyride
                        steps={store.tourSteps}
                        run={true}
                        continuous={true}
                        spotlightPadding={0}
                        showProgress={true}
                        disableCloseOnEsc={true}
                        disableOverlayClose={true}
                        hideCloseButton={true}
                        disableScrollParentFix={true}
                        spotlightClicks={false}
                        floaterProps={{ hideArrow: true }}
                        callback={state => {
                            if (
                                state.lifecycle === 'complete' &&
                                state.action === 'next'
                            ) {
                                guideNextStep(state.index);
                            } else if (state.lifecycle === 'tooltip') {
                                guideNextStep(state.index - 1);
                            } else if (state.action === 'prev') {
                                guidePrevStep(state.index);
                            }
                            switch (state.action) {
                                case 'start':
                                    store.track.trackEvent(
                                        'ui guide',
                                        'guide event',
                                        'start guide'
                                    );
                                    break;
                                case 'update':
                                    if (state.type === 'tooltip') {
                                        store.track.trackEvent(
                                            'ui guide',
                                            'guide event',
                                            `move to index ${state.index}`
                                        );
                                    } else if (state.type === 'beacon') {
                                        store.track.trackEvent(
                                            'ui guide',
                                            'guide event',
                                            'close guide'
                                        );
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }}
                        styles={{
                            options: {
                                overlayColor: 'rgba(0, 0, 0, 0.5)',
                                primaryColor: '#2B6CB0'
                            }
                        }}
                    />
                )}
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
