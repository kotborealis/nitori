import Warning from '@material-ui/icons/Warning';
import DoneOutline from '@material-ui/icons/DoneOutline';
import HelpOutline from '@material-ui/icons/HelpOutline';

export const exitCodeToIcon = (code) => {
    if(code === 0) return DoneOutline;
    if(code === undefined) return HelpOutline;
    return Warning;
};