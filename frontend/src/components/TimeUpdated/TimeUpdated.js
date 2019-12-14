import {formatDistance, formatRelative} from "date-fns";
import {ru} from "date-fns/locale";
import Tooltip from '@material-ui/core/Tooltip';
import React, {useEffect, useRef} from 'react';

export const TimeUpdated = ({timestamp, children}) => {
    const time = timestamp || children || 0;
    const now = useRef(new Date);

    useEffect(() => void (now.current = new Date), [Date.now()]);

    return <Tooltip title={
        formatRelative(new Date(time), now.current, {locale: ru})
    } interactive>
        <span>{formatDistance(new Date(time), now.current, {locale: ru})} назад</span>
    </Tooltip>;
};