import { Flex } from '@chakra-ui/react';
import AdvancedSearchComponent from 'components/feature/advancedsearch/AdvancedSearch.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useHistory, useLocation, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function SearchPage(props) {
    const location = useLocation();
    const history = useHistory();
    const store = useContext(RootStoreContext);

    useBeforeunload(() => {
        store.core.deleteStudy();
    });

    useEffect(() => {
        store.track.trackPageChange();
    }, [store.track]);

    useEffect(() => {
        if (
            store.core.currentGraph === '' ||
            store.search.currentDataset === null
        ) {
            history.push('/');
        }
    }, [
        history,
        location.search,
        store.core.currentGraph,
        store.search.currentDataset
    ]);

    return (
        <Flex
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            padding="10px"
            paddingTop="55px"
            backgroundColor="blackAlpha.300"
        >
            <AdvancedSearchComponent marginTop="100px" isPanel={false} />
        </Flex>
    );
}

SearchPage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(SearchPage));
