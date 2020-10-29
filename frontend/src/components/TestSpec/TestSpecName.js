import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';

export const TestSpecName = ({testSpecId, widgetId}) => {
    const testSpec = useApi(apiActions.testSpec);
    testSpec.useFetch({testSpecId, widgetId})([testSpecId, widgetId]);

    if(testSpec.loading || testSpec.init) return '...';
    if(testSpec.data)
        return testSpec.data.name;
};