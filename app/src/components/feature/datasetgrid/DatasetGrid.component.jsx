import {
    Box,
    Heading,
    SimpleGrid,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';

import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { withRouter } from 'react-router-dom';
import { isEnvFalse, isEnvTrue } from 'general.utils';
import CustomScroll from '../customscroll/CustomScroll.component';
import { FileUploadArea } from '../fileupload/FileUploadArea.component';
import { DocumentTextIcon } from '@heroicons/react/20/solid';

function DatasetGrid(props) {
    const gridBGColor = useColorModeValue('blackAlpha.100', 'blackAlpha.300');
    const textColor = useColorModeValue('black', 'white');

    const renderDatasets = () => (
        <Box width="100%" padding="0 10px" style={{ margin: 0 }}>
            <CustomScroll style={{ paddingRight: '10px', paddingLeft: '10px' }}>
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
            </CustomScroll>
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
                    color={textColor}
                >
                    <DocumentTextIcon
                        width="18px"
                        height="18px"
                        style={{
                            display: 'inline',
                            marginBottom: '-2px',
                            marginRight: '10px'
                        }}
                    />
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
