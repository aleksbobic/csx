import {
    Button,
    Heading,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    useDisclosure
} from '@chakra-ui/react';
import DatasetConfigComponent from 'components/feature/datasetconfig/DatasetConfig.component';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loadProgress, setLoadProgress] = useState(0);
    const [intervalCounter, setIntervalCounter] = useState(null);

    useEffect(() => {
        if (store.fileUpload.showFileUploadModal) {
            setLoadProgress(0);
            onOpen();
        } else if (!store.fileUpload.showFileUploadModal && isOpen) {
            onClose();
        }
    }, [isOpen, onClose, onOpen, store.fileUpload.showFileUploadModal]);

    useEffect(() => {
        if (
            (store.fileUpload.fileUploadData.name === '' ||
                store.fileUpload.isPopulating) &&
            isOpen &&
            intervalCounter == null
        ) {
            const interval = setInterval(() => {
                setLoadProgress(prevProgress => {
                    return prevProgress < 90
                        ? prevProgress + Math.floor(Math.random() * 10)
                        : prevProgress;
                });
            }, 750);
            setIntervalCounter(() => interval);
        } else if (
            store.fileUpload.fileUploadData.name !== '' &&
            !store.fileUpload.isPopulating &&
            isOpen &&
            intervalCounter !== null
        ) {
            return () => {
                setLoadProgress(() => 0);
                clearInterval(intervalCounter);
                setIntervalCounter(() => null);
            };
        }
    }, [
        intervalCounter,
        isOpen,
        loadProgress,
        store.fileUpload.fileUploadData.name,
        store.fileUpload.isPopulating
    ]);

    const renderModalBody = () => {
        if (
            store.fileUpload.fileUploadData.name === '' ||
            store.fileUpload.isPopulating
        ) {
            return (
                <ModalBody overflowY="scroll" marginBottom="20px">
                    <Heading size="sm" marginBottom="10px">
                        {store.fileUpload.isPopulating
                            ? 'populating index'
                            : 'Processing Dataset'}
                    </Heading>
                    <Progress size="xs" value={loadProgress} />
                </ModalBody>
            );
        }

        return (
            <ModalBody overflowY="scroll" width="748px">
                <DatasetConfigComponent />
            </ModalBody>
        );
    };

    const populateIndex = () => {
        store.fileUpload.setDefaults();
    };

    const cancelFileUpload = () => {
        store.fileUpload.cancelFileUpload();
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
                <ModalHeader>Dataset Defaults Setup</ModalHeader>
                {isOpen && renderModalBody()}

                {store.fileUpload.fileUploadData.name !== '' &&
                    !store.fileUpload.isPopulating && (
                        <ModalFooter>
                            <Button
                                variant="outline"
                                mr={3}
                                onClick={cancelFileUpload}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={() => populateIndex()}
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
