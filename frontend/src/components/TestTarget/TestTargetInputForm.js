import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SendIcon from '@material-ui/icons/Send';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 300,
    }
}));

export const TestTargetInputForm = ({onSubmit = undefined, disabled = false, testSpecs = []}) => {
    const classes = useStyles();

    const [formState, setFormState] = useState({
        files: null,
        task: ""
    });

    const handleTestSpecSelect = (event) =>
        setFormState(state => ({
            ...state,
            task: event.target.value
        }));

    return (
        <Paper className={classes.root}>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography>Выберите задание из предложенного списка:</Typography>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="test-spec-select-label">Задание</InputLabel>
                            <Select
                                labelId="test-spec-select-label"
                                id="test-spec-select"
                                value={formState.task}
                                name={"testSpecId"}
                                onChange={handleTestSpecSelect}
                                disabled={disabled}
                                fullWidth
                            >
                                {testSpecs.map(({name, _id}) =>
                                    <MenuItem value={_id}>{name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Выберите исходный код для проверки:</Typography>
                        <FormControl className={classes.formControl}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                component="label"
                                startIcon={<CloudUploadIcon/>}
                                disabled={disabled}
                            >
                                {!formState.files && "Исходный код"}
                                {formState.files && `Прикреплены файлы: ${formState.files.length}`}
                                <input
                                    directory=""
                                    webkitdirectory=""
                                    type="file"
                                    name={"sources"}
                                    multiple={true}
                                    style={{display: "none"}}
                                    onChange={({target: {files}}) => {
                                        setFormState(state => ({...state, files}));
                                        console.log(files);
                                    }}
                                />
                            </Button>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl className={classes.formControl}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                component="button"
                                endIcon={<SendIcon/>}
                                disabled={disabled}
                            >
                                Отправить на проверку
                            </Button>
                        </FormControl>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};