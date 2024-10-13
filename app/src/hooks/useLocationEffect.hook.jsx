import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useLocationEffect(callback) {
    const location = useLocation;

    useEffect(() => {
        callback(location);
    }, [location, callback]);
}
