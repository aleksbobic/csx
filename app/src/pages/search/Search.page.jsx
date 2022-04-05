import { Flex } from '@chakra-ui/react';
import AdvancedSearchComponent from 'components/feature/advancedsearch/AdvancedSearch.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { useEffect } from 'react';
import { useHistory, useLocation, withRouter } from 'react-router-dom';

function SearchPage(props) {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        if (!queryString.parse(location.search).query) {
            history.push('/');
        }
    }, [history, location.search]);

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
