export const exitCodeToColor = (code) => {
    if(code === 0) return 'primary';
    if(code === undefined) return undefined;
    return 'secondary';
};