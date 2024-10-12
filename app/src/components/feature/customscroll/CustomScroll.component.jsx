import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import PropTypes from 'prop-types';

function CustomScroll(props) {
    return (
        <OverlayScrollbarsComponent
            style={{
                width: '100%',
                height: '100%',
                ...props.style
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
            {props.children}
        </OverlayScrollbarsComponent>
    );
}

CustomScroll.propTypes = {
    style: PropTypes.object
};

export default CustomScroll;
