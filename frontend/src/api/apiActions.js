import {api, fetchJSON} from './index';

export const apiActions = {
    widgets: () => api(`/widgets/`),
    widget: ({widgetId}) => api(`/widgets/${widgetId}`),

    widgetCreate: ({name}) =>
        api(`/widgets/`, {
            query: {name},
            options: {
                method: 'POST',
            }
        }),

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
                      sortBy,
                      orderBy = 'asc',
                      userDataName,
                  } = {}) => api(`/widgets/${widgetId}/test-targets`, {
        query: {
            limit,
            skip,
            ...(userDataName ? {userDataName} : {}),
            ...(sortBy ? {sortBy} : {}),
            ...(orderBy ? {orderBy} : {}),
        }
    }),

    testTarget: ({widgetId, testTargetId} = {}) => api(`/widgets/${widgetId}/test-targets/${testTargetId}`),

    testTargetSubmit: ({widgetId, testSpecId, files} = {}) =>
        api(`/widgets/${widgetId}/test-targets/`, {
            query: {testSpecId},
            options: {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(files)
            }
        }),

    testSpecSubmit: ({widgetId, name, description, spec, example, testSpecId = false} = {}) =>
        api(`/widgets/${widgetId}/test-specs/${testSpecId || ""}`, {
            query: {name, description},
            options: {
                method: testSpecId === false ? 'POST' : 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({spec, example})
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

    userData: () => fetchJSON(`/auth/user_data.php`),

    specRunner: ({spec, example} = {}) =>
        api(`/specRunner/`, {
            options: {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({spec, example})
            }
        })
};