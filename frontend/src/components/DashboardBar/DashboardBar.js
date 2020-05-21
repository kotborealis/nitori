import AppBar from '@material-ui/core/AppBar';
import React, {useEffect} from 'react';
import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';
import {Link, useParams} from 'react-router-dom';
import styles from './DashboardBar.css';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

export const DashboardBar = () => {
    const {widgetId, dashboardTab, itemId} = useParams();

    const widget = useApi(apiActions.widget);
    widget.useFetch({widgetId})([widgetId]);

    const testSpec = useApi(apiActions.testSpec);

    useEffect(() => {
        if(dashboardTab === 'test-specs')
            testSpec.fetch({widgetId, testSpecId: itemId});
    }, [itemId, dashboardTab]);

    let itemName = itemId;
    if(dashboardTab === 'test-specs' && testSpec.data)
        itemName = testSpec.data.name;

    return (<AppBar position="static">
        <div className={styles.bar}>
            <Breadcrumbs className={styles.breadcrumbs}>
                <BLink to='/'>Виджеты</BLink>
                {widgetId && <BLink to={`/dashboard/${widget.data?._id}`}>{widget.data?.name}</BLink>}
                {dashboardTab && <BLink to={`/dashboard/${widget.data?._id}/${dashboardTab}`}>
                    {dashboardTabToString(dashboardTab)}
                </BLink>}
                {itemId && <BLink to={`/dashboard/${widget.data?._id}/${dashboardTab}/${itemId}`}>{itemName}</BLink>}
            </Breadcrumbs>
        </div>
    </AppBar>);
};

const BLink = (props) => <Link {...props} className={styles.link}>{props.children}</Link>;

const dashboardTabToString = tab => {
    if(tab === 'test-specs') return 'Тесты';
    if(tab === 'test-targets') return 'Попытки';
};