import React, {useRef} from 'react';
import {TimeUpdated} from '../TimeUpdated/TimeUpdated';
import {useHistory, useParams} from 'react-router-dom';
import {apiActions} from '../../api/apiActions';
import {testTargetResultBadges} from './testTargetResultBadges';
import {useApi} from '../../api/useApi';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {Link} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';

export const TestTargetsListGrouped = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    //useEffect(() => tableRef.current && tableRef.current.onQueryChange(), [widgetId]);

    const testTargetsGrouped = useApi(apiActions.testTargetsByGroupByUsersByTestSpecs);
    testTargetsGrouped.useFetch({widgetId})([widgetId]);

    //const groupsUsersTree = testTargetsGrouped.data?.map(({group, users}) =>
    //
    //);

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
            defaultExpanded={['root']}
        >
            {testTargetsGrouped.data?.map(({group, users}) =>
                <TreeItem nodeId={`group-${group}`} label={group}>
                    {users.map(({userData, testTargetsByTestSpec}) =>
                        <TreeItem nodeId={userData.login} label={`${userData.name} (${userData.login})`}>
                            {testTargetsByTestSpec.map(({testSpec, testTargets}) =>
                                <TreeItem nodeId={testSpec._id + userData.login} label={testSpec.name}>
                                    {testTargets.map(({_id, timestamp, targetCompilerResult, specCompilerResult, linkerResult, runnerResult}) =>
                                        <TreeItem nodeId={_id}
                                                  label={
                                                      <Link href={`/dashboard/${widgetId}/test-targets/${_id}`}
                                                            rel="noopener noreferrer"
                                                            target="_blank">
                                                          <ChevronRightIcon/>
                                                          {testTargetResultBadges({
                                                              targetCompilerResult,
                                                              specCompilerResult,
                                                              linkerResult,
                                                              runnerResult
                                                          })}
                                                          <Chip variant="outlined"
                                                                label={<TimeUpdated>{timestamp}</TimeUpdated>}/>
                                                      </Link>
                                                  }
                                        />
                                    )}
                                </TreeItem>
                            )}
                        </TreeItem>
                    )}
                </TreeItem>
            )}
        </TreeView>
    );

    //return (
    //    <MaterialTable
    //        title={"Решения"}
    //        tableRef={tableRef}
    //        options={{
    //            showTitle: true,
    //            search: true
    //        }}
    //
    //        onRowClick={(event, rowData) => {
    //            history.push(`/dashboard/${widgetId}/test-targets/${rowData._id}`);
    //        }}
    //
    //        columns={[
    //            {
    //                title: 'Тест',
    //                render: ({testSpec}) => <TestSpecName testSpecId={testSpec} widgetId={widgetId}/>,
    //                sorting: false,
    //            },
    //            {
    //                title: 'Пользователь',
    //                render: ({userData: {name, login}}) => name ? `${name} (${login})` : login,
    //                sorting: false,
    //            },
    //            {
    //                title: 'Отправлено',
    //                render: ({timestamp}) => <TimeUpdated>{timestamp}</TimeUpdated>,
    //                sorting: true,
    //                sortingField: 'timestamp',
    //            },
    //            {
    //                title: 'Проверки',
    //                render: testTargetResultBadges,
    //                sorting: false
    //            }
    //        ]}
    //
    //        data={async ({
    //                         page,
    //                         pageSize,
    //                         search,
    //                         orderBy,
    //                         orderDirection
    //                     }) => {
    //            const totalCount = await apiActions.testTargetsTotalCount({widgetId});
    //
    //            let data;
    //            try{
    //                data = await apiActions.testTargets({
    //                    widgetId,
    //                    limit: pageSize,
    //                    skip: page * pageSize,
    //                    userDataName: search,
    //                    sortBy: orderBy ? orderBy.sortingField : undefined,
    //                    orderBy: orderDirection,
    //                });
    //            }
    //            catch(e){
    //                console.error(e);
    //                return {
    //                    data: [],
    //                    page: 0,
    //                    totalCount: 0
    //                };
    //            }
    //
    //            return {
    //                data,
    //                page,
    //                totalCount
    //            };
    //        }}/>
    //);
};