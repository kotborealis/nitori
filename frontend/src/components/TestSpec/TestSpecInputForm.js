import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    }
}));

export const TestSpecInputForm = ({onSubmit, name = "", description = ""}) => {
    const classes = useStyles();

    const [formState, setFormState] = useState({
        files: undefined,
        name,
        description,
    });

    return (
        <Paper className={classes.root}>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl className={classes.formControl}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                component="label"
                                startIcon={<CloudUploadIcon/>}
                                style={{width: 300}}
                            >
                                {!formState.files && "Исходный код"}
                                {formState.files && `Файлы: ${formState.files.length}`}
                                <input
                                    type="file"
                                    name={"sources"}
                                    multiple={true}
                                    style={{display: "none"}}
                                    onChange={({target: {files}}) =>
                                        setFormState(state => ({...state, files}))
                                    }
                                />
                            </Button>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl className={classes.formControl}>
                            <TextField
                                label="Название теста"
                                variant="outlined"
                                fullWidth
                                name="name"
                                value={formState.name}
                                onChange={({target: {value: name}}) =>
                                    setFormState(state => ({...state, name}))
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl className={classes.formControl}>
                            <TextField
                                id="test-spec-description"
                                label="Описание"
                                multiline
                                rowsMax="5"
                                margin="normal"
                                variant="outlined"
                                name="description"
                                value={formState.description}
                                onChange={({target: {value: description}}) =>
                                    setFormState(state => ({...state, description}))
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            component="button"
                            endIcon={<SendIcon/>}
                        >
                            Отправить
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};