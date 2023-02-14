import {
    Flex,
    Heading,
    IconButton,
    Tooltip,
    useColorModeValue
} from '@chakra-ui/react';
import { ArrowRight, Toolbox, TrashEmpty } from 'css.gg';
import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { isEnvFalse } from 'general.utils';

function DatasetElement(props) {
    const store = useContext(RootStoreContext);

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
        store.schema.resetOverviewNodeProperties();

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
                <Tooltip
                    label={`Change default settings for  ${props.dataset}`}
                >
                    <IconButton
                        flexGrow="0"
                        size="sm"
                        variant="ghost"
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
                                    value: `Change default settings of ${props.dataset}`
                                })
                            );

                            store.search.getConifg(props.dataset);
                        }}
                        icon={
                            <Toolbox
                                style={{
                                    '--ggs': '0.7'
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
                        variant="solid"
                        opacity="0.5"
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
