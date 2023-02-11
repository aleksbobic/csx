import {
    Box,
    Heading,
    SimpleGrid,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';

import { observer } from 'mobx-react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { withRouter } from 'react-router-dom';
import { isEnvFalse, isEnvTrue } from 'utils';
import { FileUploadArea } from '../fileupload/FileUploadArea.component';

function DatasetGrid(props) {
    const gridBGColor = useColorModeValue('blackAlpha.100', 'blackAlpha.300');

    const renderDatasets = () => (
        <Box width="100%" padding="0 10px" style={{ margin: 0 }}>
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
                    {props.children}
                </SimpleGrid>
            </OverlayScrollbarsComponent>
        </Box>
    );

    return (
        (isEnvFalse('REACT_APP_DISABLE_DATASET_LIST') ||
            isEnvFalse('REACT_APP_DISABLE_UPLOAD')) && (
            <VStack
                marginTop="40px"
                backgroundColor={gridBGColor}
                borderRadius="12px"
                paddingBottom={isEnvTrue('REACT_APP_DISABLE_UPLOAD') && '50px'}
            >
                <Heading
                    colSpan={2}
                    size="sm"
                    opacity="0.76"
                    height="50px"
                    width="100%"
                    textAlign="center"
                    lineHeight="50px"
                >
                    Datasets
                </Heading>
                {isEnvFalse('REACT_APP_DISABLE_DATASET_LIST') &&
                    renderDatasets()}
                {isEnvFalse('REACT_APP_DISABLE_UPLOAD') && <FileUploadArea />}
            </VStack>
        )
    );
}

export default withRouter(observer(DatasetGrid));
