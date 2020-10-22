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
import Typography from '@material-ui/core/Typography';

function testTargetLabel({widget, _id, targetCompilerResult, specCompilerResult, linkerResult, runnerResult, timestamp}) {
    return <Link href={`/dashboard/${widget}/test-targets/${_id}`}
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
    </Link>;
}

function testTargetsByTestSpecList(testTargetsByTestSpec, userData) {
    const hasSolution = testTargetsByTestSpec
        ?.map(({testTargets}) =>
            testTargets.map(target => target.runnerResult?.exitCode)
                ?.some(_ => _ === 0)
        );

    return testTargetsByTestSpec.map(({testSpec, testTargets}, i) =>
        <TreeItem
            nodeId={testSpec._id + userData.login}
            label={
                <Typography style={{background: hasSolution[i] ? '#b4ffb4' : ''}}>
                    {testSpec.name}
                </Typography>
            }
        >
            {testTargets.map(target =>
                <TreeItem nodeId={target._id}
                          component='a'
                          label={testTargetLabel(target)}
                />
            )}
        </TreeItem>
    );
}

function usersList(users) {
    return users.map(({userData, testTargetsByTestSpec}) =>
        <TreeItem nodeId={userData.login} label={`${userData.name} (${userData.login})`}>
            {testTargetsByTestSpecList(testTargetsByTestSpec, userData)}
        </TreeItem>
    );
}

function groupsList(testTargetsGrouped) {
    return testTargetsGrouped.data?.map(({group, users}) =>
        <TreeItem nodeId={`group-${group}`} label={group}>
            {usersList(users)}
        </TreeItem>
    );
}

export const TestTargetsListGrouped = () => {
    const history = useHistory();
    const {widgetId} = useParams();
    const tableRef = useRef(null);

    const testTargetsGrouped = useApi(apiActions.testTargetsByGroupByUsersByTestSpecs);
    testTargetsGrouped.useFetch({widgetId})([widgetId]);

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
            defaultExpanded={['root']}
        >
            {groupsList(testTargetsGrouped)}
        </TreeView>
    );
};