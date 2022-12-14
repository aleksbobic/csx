import {
    Button,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    useDisclosure
} from '@chakra-ui/react';
import DatasetConfigComponent from 'components/feature/datasetconfig/DatasetConfig.component';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (store.fileUpload.showFileUploadModal) {
            onOpen();
        } else if (!store.fileUpload.showFileUploadModal && isOpen) {
            onClose();
        }
    }, [isOpen, onClose, onOpen, store.fileUpload.showFileUploadModal]);

    const renderModalBody = () => {
        if (
            store.fileUpload.fileUploadData.originalName === '' ||
            store.fileUpload.isPopulating
        ) {
            return (
                <ModalBody
                    overflowY="scroll"
                    marginBottom="20px"
                    marginTop="20px"
                >
                    <Heading size="sm" marginBottom="25px" textAlign="center">
                        {store.fileUpload.isPopulating
                            ? 'Populating Index'
                            : 'Processing Dataset'}
                    </Heading>
                    <Flex justifyContent="center">
                        <Spinner size="xl" color="blue.500" thickness="2px" />
                    </Flex>
                </ModalBody>
            );
        }

        return (
            <ModalBody overflowY="scroll" width="748px">
                <DatasetConfigComponent />
            </ModalBody>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
            closeOnEsc={false}
            closeOnOverlayClick={false}
        >
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent width="748px" minWidth="748px" maxWidth="748px">
                {store.fileUpload.fileUploadData.originalName !== '' &&
                    !store.fileUpload.isPopulating && (
                        <ModalHeader>Dataset Defaults Setup</ModalHeader>
                    )}

                {isOpen && renderModalBody()}

                {store.fileUpload.fileUploadData.originalName !== '' &&
                    !store.fileUpload.isPopulating && (
                        <ModalFooter>
                            <Button
                                variant="outline"
                                mr={3}
                                onClick={() => {
                                    store.track.trackEvent(
                                        'dataset upload modal',
                                        'button click',
                                        'cancel'
                                    );
                                    store.fileUpload.cancelFileUpload();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={() => {
                                    store.track.trackEvent(
                                        'dataset upload modal',
                                        'button click',
                                        'set default config'
                                    );
                                    store.fileUpload.setDefaults();
                                }}
                            >
                                Set defaults
                            </Button>
                        </ModalFooter>
                    )}
            </ModalContent>
        </Modal>
    );
}

export default observer(FileUploadModal);
