import {
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useColorMode
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { v4 as uuidv4 } from 'uuid';
import DatasetConfigColumns from './DatasetConfigColumns.component';
import DatasetConfigFooter from './DatasetConfigFooter.component';
import DatasetConfigSchema from './DatasetConfigSchema.component';

function DatasetConfig(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const [activeTab, setActiveTab] = useState(0);

    const renderDatasetNameConfig = () => (
        <>
            <Heading size="xs" marginBottom="10px" opacity="0.6">
                {props.formType === 'modify'
                    ? store.fileUpload.fileUploadData.name.toUpperCase()
                    : 'Dataset name:'}
            </Heading>
            {props.formType === 'upload' &&
                store.fileUpload.fileUploadData.originalName !== '' && (
                    <Editable
                        defaultValue={
                            store.fileUpload.fileUploadData.originalName
                        }
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        borderRadius="5px"
                        onSubmit={val => {
                            store.track.trackEvent(
                                `Home Page - ${
                                    props.formType === 'modify'
                                        ? 'Dataset Configuration Modal'
                                        : 'Dataset Upload Modal'
                                }`,
                                'Editable Element - Dataset - Title',
                                JSON.stringify({
                                    type: 'Change selection',
                                    value: val
                                })
                            );

                            store.fileUpload.changeDatasetName(val);
                        }}
                    >
                        <EditablePreview padding="5px 23px" width="100%" />
                        <EditableInput padding="5px 23px" width="100%" />
                    </Editable>
                )}
        </>
    );

    const renderTabs = count => {
        const tabKeys = [];

        for (let i = 0; i < count; i++) {
            tabKeys[i] = uuidv4();
        }

        return (
            <TabList
                justifyContent="center"
                marginTop="20px"
                marginBottom="20px"
            >
                {tabKeys.map(key => (
                    <Tab
                        key={key}
                        width="10px"
                        height="10px"
                        borderRadius="full"
                        padding="0"
                        border="2px solid"
                        borderColor="whiteAlpha.500"
                        margin="4px"
                        cursor="default"
                        _hover={{ cursor: 'default' }}
                        isDisabled
                        _selected={{
                            backgroundColor: 'blue.500',
                            border: 'none'
                        }}
                    ></Tab>
                ))}
            </TabList>
        );
    };

    return (
        <>
            <Tabs variant="solid-rounded" size="sm" index={activeTab}>
                <TabPanels>
                    <TabPanel
                        padding={
                            props.formType === 'upload' ? '20px 0 0 0' : '0'
                        }
                        height="450px"
                    >
                        {renderDatasetNameConfig()}
                        <DatasetConfigColumns formType={props.formType} />
                    </TabPanel>
                    {props.formType === 'upload' && (
                        <TabPanel padding="20px 0 0 0" height="450px">
                            <DatasetConfigSchema graphType="overview" />
                        </TabPanel>
                    )}
                    {props.formType === 'upload' && (
                        <TabPanel padding="20px 0 0 0" height="450px">
                            <DatasetConfigSchema graphType="detail" />
                        </TabPanel>
                    )}
                </TabPanels>
                {props.formType === 'upload' && renderTabs(3)}
            </Tabs>
            <DatasetConfigFooter
                formType={props.formType}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </>
    );
}

DatasetConfig.propTypes = {
    formType: PropTypes.string
};

DatasetConfig.defaultProps = {
    formType: 'upload'
};

export default observer(DatasetConfig);
