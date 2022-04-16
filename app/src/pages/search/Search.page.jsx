import { Flex } from '@chakra-ui/react';
import AdvancedSearchComponent from 'components/feature/advancedsearch/AdvancedSearch.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useHistory, useLocation, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function SearchPage(props) {
    const location = useLocation();
    const history = useHistory();
    const store = useContext(RootStoreContext);

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
        >
            <AdvancedSearchComponent marginTop="100px" />
        </Flex>
    );
}

SearchPage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(SearchPage));
