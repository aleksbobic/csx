import { Button, HStack } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function DatasetConfigFooter(props) {
    const store = useContext(RootStoreContext);

    const renderEditConfigModalFooter = () => (
        <HStack justifyContent="center" paddingBottom="20px" marginTop="-40px">
            <Button
                variant="outline"
                mr={3}
                onClick={() => {
                    store.track.trackEvent(
                        'Home Page - Dataset Configuration Modal',
                        'Button',
                        JSON.stringify({
                            type: 'Click',
                            value: 'Cancel configuration change'
                        })
                    );
                    store.fileUpload.changeConfigChangeModalVisiblity(false);
                    store.fileUpload.resetFileUploadData();
                }}
            >
                Cancel
            </Button>
            <Button
                variant="solid"
                backgroundColor="blue.500"
                onClick={() => {
                    store.track.trackEvent(
                        'Home Page - Dataset Configuration Modal',
                        'Button',
                        JSON.stringify({
                            type: 'Click',
                            value: 'Update default configuration'
                        })
                    );

                    store.fileUpload.updateConfig();
                }}
            >
                Update
            </Button>
        </HStack>
    );

    const renderSetConfigModalFooter = () => (
        <HStack justifyContent="center" paddingBottom="20px">
            {props.activeTab === 0 && (
                <Button
                    variant="outline"
                    onClick={() => {
                        store.track.trackEvent(
                            'Home Page - Dataset Upload Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: 'Cancel dataset upload'
                            })
                        );
                        store.fileUpload.cancelFileUpload();
                    }}
                >
                    Cancel
                </Button>
            )}
            {props.activeTab > 0 && (
                <Button
                    variant="outline"
                    onClick={() => {
                        store.track.trackEvent(
                            'Home Page - Dataset Upload Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Navigate to ${
                                    props.activeTab === 2
                                        ? 'default overview schema config'
                                        : 'data types and general config of dataset'
                                }`
                            })
                        );

                        if (props.activeTab === 2) {
                            store.overviewSchema.populateStoreData(true);
                        }
                        props.setActiveTab(props.activeTab - 1);
                    }}
                >
                    Prev
                </Button>
            )}
            {props.activeTab < 2 && (
                <Button
                    variant="solid"
                    backgroundColor="blue.500"
                    onClick={() => {
                        store.track.trackEvent(
                            'Home Page - Dataset Upload Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: `Navigate to ${
                                    props.activeTab === 0
                                        ? 'default overview schema config'
                                        : 'default detail schema config'
                                }`
                            })
                        );

                        if (props.activeTab === 0) {
                            store.overviewSchema.populateStoreData(true);
                        }
                        if (props.activeTab === 1) {
                            store.schema.populateStoreData(true);
                        }
                        props.setActiveTab(props.activeTab + 1);
                    }}
                >
                    Next
                </Button>
            )}
            {props.activeTab === 2 && (
                <Button
                    variant="solid"
                    backgroundColor="blue.500"
                    onClick={() => {
                        store.track.trackEvent(
                            'Home Page - Dataset Upload Modal',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: 'Set default configuration'
                            })
                        );
                        store.fileUpload.setDefaults();
                    }}
                >
                    Save
                </Button>
            )}
        </HStack>
    );

    return props.formType === 'modify'
        ? renderEditConfigModalFooter()
        : renderSetConfigModalFooter();
}

DatasetConfigFooter.propTypes = {
    formType: PropTypes.string,
    activeTab: PropTypes.number,
    setActiveTab: PropTypes.func
};

DatasetConfigFooter.defaultProps = {
    formType: 'upload'
};

export default observer(DatasetConfigFooter);
