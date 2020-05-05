import {useApi} from '../../api/useApi';
import {apiActions} from '../../api/apiActions';
import React, {useState} from 'react';
import styles from './WidgetSearch.css';
import InputBase from '@material-ui/core/InputBase';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import Container from '@material-ui/core/Container';
import {useHistory} from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import {Error} from '../../components/InvalidState/Error';

const filter = createFilterOptions();

export const WidgetSearch = () => {
    const history = useHistory();

    const widgets = useApi(apiActions.widgets);
    widgets.useFetch()([]);

    const [selectedWidget, setSelectedWidget] = useState(null);

    const handleWidgetSelection = (event, selection) => {
        if(selection._id){
            setSelectedWidget(selection);
            history.push(`/dashboard/${selection._id}`);
        }
        else if(selection.inputValue){
            setSelectedWidget({name: selection.inputValue, _id: ''});
            apiActions
                .widgetCreate({name: selection.inputValue})
                .then((data) => {
                    history.push(`/dashboard/${data._id}`);
                    widgets.fetch();
                });
        }
    };

    return (<Container max="lg" className={styles.container}>
        <Typography variant="h3">/testcpp</Typography>
        <Autocomplete
            value={selectedWidget}
            blurOnSelect
            selectOnFocus
            onChange={handleWidgetSelection}
            className={styles.searchContainer}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if(params.inputValue !== ''){
                    filtered.push({
                        inputValue: params.inputValue,
                        name: `Создать "${params.inputValue}"`,
                    });
                }

                return filtered;
            }}
            options={(widgets.loading || widgets.error) ? [] : widgets.data}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <>
                <SearchIcon className={styles.searchIcon}/>
                <InputBase
                    ref={params.InputProps.ref}
                    inputProps={params.inputProps}
                    placeholder={"Выберите или создайте виджет"}
                    className={styles.searchInput}
                />
            </>
            }
        />
        {widgets.error && <Error error={widgets.error}/>}
    </Container>);
};