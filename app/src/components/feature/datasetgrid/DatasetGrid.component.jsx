import {
    Box,
    Flex,
    Heading,
    IconButton,
    SimpleGrid,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { ArrowRight, FileAdd, Toolbox, TrashEmpty } from 'css.gg';

import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function DatasetGrid(props) {
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const history = useHistory();

    const onDrop = async files => {
        store.track.trackEvent('File upload', 'File dropped');

        store.fileUpload.changeFileUploadModalVisiblity(true);
        const response = await store.fileUpload.uploadFile(files);

        if (!response) {
            store.track.trackEvent('File upload', 'File upload failed');
            store.fileUpload.changeFileUploadModalVisiblity(false);
        }
    };

    const navigateToAdvancedSearch = dataset => {
        props.onNavigate();
        store.core.setCurrentGraph('overview');
        store.search.useDataset(store.search.datasets.indexOf(dataset));
        store.core.resetVisibleDimensions();
        store.workflow.resetWorkflow();
        store.schema.resetOverviewNodeProperties();

        history.push(`/search?dataset=${dataset}`);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    const renderFileUpload = () => (
        <div
            {...getRootProps()}
            style={{
                border: '1px dashed rgba(100,100,100,0.5)',
                width: '100%',
                borderRadius: '7px',
                height: '150px',
                marginTop: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                padding: '25px',
                background: 'rgba(100,100,100,0.05)'
            }}
        >
            <FileAdd
                style={{ '--ggs': '1.2', marginBottom: '10px', opacity: 0.5 }}
            />
            <input {...getInputProps()} width="100%" height="100%" />
            {isDragActive ? (
                <p style={{ opacity: 0.5 }}>Drop your dataset files here ...</p>
            ) : (
                <p
                    style={{
                        opacity: 0.5,
                        paddingLeft: '50px',
                        paddingRight: '50px'
                    }}
                >
                    Drop your dataset files here, or click to select files.
                    Supported format is .csv.
                </p>
            )}
        </div>
    );

    return (
        (process?.env.REACT_APP_DISABLE_DATASET_LIST !== 'true' ||
            process?.env.REACT_APP_DISABLE_UPLOAD !== 'true') && (
            <VStack marginTop="40px">
                <Box
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'blackAlpha.300'
                    }
                    width="100%"
                    height="50px"
                    margin="0"
                    borderTopRadius="12px"
                    display="flex"
                    alignItems="center"
                >
                    <Heading
                        colSpan={2}
                        size="sm"
                        opacity="0.76"
                        width="100%"
                        textAlign="center"
                    >
                        Datasets
                    </Heading>
                </Box>
                {process?.env.REACT_APP_DISABLE_DATASET_LIST !== 'true' && (
                    <Box
                        width="100%"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        padding="0 10px"
                        style={{ margin: 0 }}
                    >
                        <OverlayScrollbarsComponent
                            style={{
                                width: '100%',
                                height: '100%',
                                paddingRight: '10px',
                                paddingLeft: '10px'
                            }}
                            options={{
                                scrollbars: {
                                    theme: 'os-theme-dark',
                                    autoHide: 'scroll',
                                    autoHideDelay: 600,
                                    clickScroll: true
                                }
                            }}
                        >
                            <SimpleGrid
                                width="100%"
                                columns={[1, 1, 2]}
                                spacing="10px"
                                maxHeight="156px"
                                marginBottom="0"
                                borderRadius="8px"
                                style={{ marginTop: 0 }}
                            >
                                {store.search.datasets.map((dataset, index) => (
                                    <Flex
                                        backgroundColor={
                                            colorMode === 'light'
                                                ? 'blackAlpha.100'
                                                : 'whiteAlpha.50'
                                        }
                                        borderRadius="8px"
                                        height="40px"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap="5px"
                                        paddingLeft="5px"
                                        paddingRight="5px"
                                        key={`dataset_list_${dataset}`}
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
                                            {dataset}
                                        </Heading>
                                        {process?.env
                                            .REACT_APP_DISABLE_UPLOAD ===
                                            'true' && (
                                            <Tooltip
                                                label={`Delete ${dataset}`}
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
                                                            'Dataset grid',
                                                            'delete dataset',
                                                            dataset
                                                        );

                                                        store.search.deleteDataset(
                                                            dataset
                                                        );
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
                                        {process?.env
                                            .REACT_APP_DISABLE_UPLOAD ===
                                            'true' && (
                                            <Tooltip
                                                label={`Change default settings for  ${dataset}`}
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
                                                            'Dataset grid',
                                                            'change dataset default settings',
                                                            dataset
                                                        );

                                                        store.search.getConifg(
                                                            dataset
                                                        );
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
                                        {process?.env
                                            .REACT_APP_DISABLE_ADVANCED_SEARCH !==
                                            'true' && (
                                            <Tooltip
                                                label={`Open advanced search for ${dataset}`}
                                            >
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
                                                            'Dataset grid',
                                                            'Open advanced search',
                                                            dataset
                                                        );

                                                        navigateToAdvancedSearch(
                                                            dataset
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
                                ))}
                            </SimpleGrid>
                        </OverlayScrollbarsComponent>
                    </Box>
                )}
                {process?.env.REACT_APP_DISABLE_UPLOAD !== 'true' && (
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        padding="20px"
                        width="100%"
                        style={{ marginTop: '0px' }}
                        borderBottomRadius="12px"
                    >
                        {renderFileUpload()}
                    </Box>
                )}
                {process?.env.REACT_APP_DISABLE_UPLOAD === 'true' && (
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        width="100%"
                        height="50px"
                        borderBottomRadius="12px"
                        display="flex"
                        alignItems="center"
                        style={{ margin: 0 }}
                    ></Box>
                )}
            </VStack>
        )
    );
}

DatasetGrid.propTypes = {
    onNavigate: PropTypes.func
};

export default withRouter(observer(DatasetGrid));
