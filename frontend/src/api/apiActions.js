import {api, fetchJSON} from './index';

export const apiActions = {
    widgets: () => api(`/widgets/`),

    testSpecs:
        ({
             widgetId,
             limit = 100,
             skip = 0,
             sortBy = 'name',
             orderBy = 'asc',
             name,
         } = {}) => api(`/widgets/${widgetId}/test-specs`, {
            query: {
                limit,
                skip,
                ...(name ? {name} : {}),
                ...(sortBy ? {sortBy} : {}),
                ...(orderBy ? {orderBy} : {}),
            }
        }),

    testSpec: ({widgetId, testSpecId} = {}) => api(`/widgets/${widgetId}/test-specs/${testSpecId}`,
        {query: {includeSources: true}}),

    testTargets: ({
                      widgetId,
                      limit = 100,
                      skip = 0,
                      sortBy = 'name',
                      orderBy = 'asc',
                      userDataName,
                  } = {}) => api(`/widgets/${widgetId}/test-targets`, {
        query: {
            limit,
            skip,
            ...(userDataName ? {userDataName} : {}),
            sortBy,
            orderBy,
        }
    }),

    testTarget: ({widgetId, testTargetId} = {}) => api(`/widgets/${widgetId}/test-targets/${testTargetId}`),

    testTargetSubmit: ({widgetId, formData} = {}) =>
        api(`/widgets/${widgetId}/test-targets/`, {
            query: {
                testSpecId: formData.get('testSpecId')
            },
            options: {
                method: 'POST',
                body: formData
            }
        }),

    testSpecSubmit: ({widgetId, formData, testSpecId = false} = {}) =>
        api(`/widgets/${widgetId}/test-specs/${testSpecId || ""}`, {
            query: {
                name: formData.get('name'),
                description: formData.get('description')
            },
            options: {
                method: testSpecId === false ? 'POST' : 'PUT',
                body: formData
            }
        }),

    testSpecDelete: ({widgetId, testSpecId} = {}) =>
        api(`/widgets/${widgetId}/test-specs/${testSpecId}`, {
            options: {
                method: 'DELETE',
            }
        }),

    testSpecsTotalCount: ({widgetId} = {}) => api(`/widgets/${widgetId}/test-specs/total-count`),
    testTargetsTotalCount: ({widgetId} = {}) => api(`/widgets/${widgetId}/test-targets/total-count`),

    userData: () => fetchJSON(`/auth/user_data.php`)
};