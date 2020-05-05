import AppBar from '@material-ui/core/AppBar';
import React from 'react';
import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';
import {Link, useParams} from 'react-router-dom';
import styles from './DashboardBar.css';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

export const DashboardBar = () => {
    const {widgetId, dashboardTab, itemId} = useParams();

    const widget = useApi(apiActions.widget);
    widget.useFetch({widgetId})([widgetId]);

    return (<AppBar position="static">
        <div className={styles.bar}>
            <Breadcrumbs className={styles.breadcrumbs}>
                <BLink to='/'>Виджеты</BLink>
                {widgetId && <BLink to={`/dashboard/${widget.data?._id}`}>{widget.data?.name}</BLink>}
                {dashboardTab && <BLink to={`/dashboard/${widget.data?._id}/${dashboardTab}`}>
                    {dashboardTabToString(dashboardTab)}
                </BLink>}
                {itemId && <BLink to={`/dashboard/${widget.data?._id}/${dashboardTab}/${itemId}`}>{itemId}</BLink>}
            </Breadcrumbs>
        </div>
    </AppBar>);
};

const BLink = (props) => <Link {...props} className={styles.link}>{props.children}</Link>;

const dashboardTabToString = tab => {
    if(tab === 'test-specs') return 'Тесты';
    if(tab === 'test-targets') return 'Попытки';
};