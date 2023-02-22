import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { DocumentArrowUpIcon } from '@heroicons/react/20/solid';
import { FileAdd } from 'css.gg';
import { useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { RootStoreContext } from 'stores/RootStore';

export function FileUploadArea() {
    const store = useContext(RootStoreContext);
    const textColor = useColorModeValue('black', 'white');

    const onDrop = async files => {
        store.track.trackEvent(
            'Home Page - Dataset Grid',
            'File Upload Area',
            JSON.stringify({
                type: 'Drop'
            })
        );

        store.fileUpload.uploadFile(files);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    return (
        <Box
            padding="20px"
            width="100%"
            style={{ marginTop: '0px' }}
            borderBottomRadius="12px"
        >
            <Box
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
                <DocumentArrowUpIcon
                    width="22px"
                    height="22px"
                    opacity="0.5"
                    style={{ marginBottom: '10px' }}
                />
                <input {...getInputProps()} width="100%" height="100%" />
                {isDragActive ? (
                    <Text style={{ opacity: 0.5, color: textColor }}>
                        Drop your dataset files here ...
                    </Text>
                ) : (
                    <Text
                        style={{
                            opacity: 0.5,
                            paddingLeft: '50px',
                            paddingRight: '50px',
                            color: textColor
                        }}
                    >
                        Drop your dataset files here, or click to select files.
                        Supported format is .csv.
                    </Text>
                )}
            </Box>
        </Box>
    );
}
