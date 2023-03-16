import {
    Flex,
    Heading,
    IconButton,
    Tooltip,
    useColorModeValue
} from '@chakra-ui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ArrowRight, Search, TrashEmpty } from 'css.gg';
import { isEnvFalse } from 'general.utils';
import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function DatasetElement(props) {
    const store = useContext(RootStoreContext);
    const textColor = useColorModeValue('black', 'white');

    const elementBackground = useColorModeValue(
        'blackAlpha.100',
        'whiteAlpha.50'
    );
    const history = useHistory();

    const navigateToAdvancedSearch = dataset => {
        props.onNavigate();
        store.core.setCurrentGraph('overview');
        store.search.useDataset(store.search.datasets.indexOf(dataset));
        store.core.resetVisibleDimensions();
        store.workflow.resetWorkflow();
        store.overviewSchema.setAnchorProperties([]);

        history.push(`/search?dataset=${dataset}`);
    };

    return (
        <Flex
            backgroundColor={elementBackground}
            borderRadius="8px"
            height="40px"
            justifyContent="center"
            alignItems="center"
            gap="5px"
            paddingLeft="5px"
            paddingRight="5px"
            key={props.key}
            opacity="0.7"
            transition="all 0.1s ease-in-out"
            _hover={{ opacity: '1' }}
            role="group"
        >
            <Heading
                flexGrow="1"
                size="xs"
                textAlign="left"
                paddingLeft="10px"
                opacity="0.7"
                _groupHover={{ opacity: '1' }}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                color={textColor}
            >
                {props.dataset}
            </Heading>
            {isEnvFalse('REACT_APP_DISABLE_UPLOAD') && (
                <Tooltip label={`Delete ${props.dataset}`}>
                    <IconButton
                        flexGrow="0"
                        size="sm"
                        variant="ghost"
                        opacity="0"
                        _groupHover={{
                            opacity: '1'
                        }}
                        color={textColor}
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Grid',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `Delete ${props.dataset}`
                                })
                            );

                            store.search.deleteDataset(props.dataset);
                        }}
                        icon={
                            <TrashEmpty
                                style={{
                                    '--ggs': '0.7',
                                    marginTop: '1px'
                                }}
                            />
                        }
                    />
                </Tooltip>
            )}
            {isEnvFalse('REACT_APP_DISABLE_UPLOAD') && (
                <Tooltip label={`Change settings for  ${props.dataset}`}>
                    <IconButton
                        flexGrow="0"
                        size="sm"
                        variant="ghost"
                        opacity="0"
                        _groupHover={{
                            opacity: '1'
                        }}
                        color={textColor}
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Grid',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `Change default settings of ${props.dataset}`
                                })
                            );

                            store.search.getConifg(props.dataset);
                        }}
                        icon={
                            <Cog6ToothIcon
                                style={{
                                    width: '18px',
                                    height: '18px'
                                }}
                            />
                        }
                    />
                </Tooltip>
            )}

            {isEnvFalse('REACT_APP_DISABLE_ADVANCED_SEARCH') && (
                <Tooltip label={`Open advanced search for ${props.dataset}`}>
                    <IconButton
                        flexGrow="0"
                        size="sm"
                        variant="ghost"
                        color={textColor}
                        opacity="0"
                        _groupHover={{
                            opacity: '1'
                        }}
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Grid',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `Open advanced search for ${props.dataset}`
                                })
                            );

                            navigateToAdvancedSearch(props.dataset);
                        }}
                        icon={
                            <Search
                                style={{
                                    '--ggs': 0.7
                                }}
                            />
                        }
                    />
                </Tooltip>
            )}

            {isEnvFalse('REACT_APP_DISABLE_ADVANCED_SEARCH') && (
                <Tooltip label={`View entire ${props.dataset} dataset`}>
                    <IconButton
                        flexGrow="0"
                        size="sm"
                        variant="solid"
                        opacity="0.5"
                        color={textColor}
                        _groupHover={{
                            opacity: '1'
                        }}
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Grid',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `View entire ${props.dataset} dataset`
                                })
                            );

                            props.onNavigate();
                            store.core.setCurrentGraph('overview');
                            store.search.useDataset(
                                store.search.datasets.indexOf(props.dataset)
                            );
                            store.core.resetVisibleDimensions();
                            store.workflow.resetWorkflow();
                            store.overviewSchema.setAnchorProperties([]);
                            store.search.setAdvancedSearchQuery({
                                action: 'visualise',
                                query: {
                                    action: 'get dataset',
                                    dataset: props.dataset
                                }
                            });
                            store.workflow.setShouldRunWorkflow(true);
                            history.push(
                                `/graph?study=${store.core.studyUuid}`
                            );
                        }}
                        icon={
                            <ArrowRight
                                style={{
                                    '--ggs': '0.7'
                                }}
                            />
                        }
                    />
                </Tooltip>
            )}
        </Flex>
    );
}

DatasetElement.propTypes = {
    dataset: PropTypes.string,
    key: PropTypes.string,
    onNavigate: PropTypes.func
};

export default withRouter(observer(DatasetElement));
