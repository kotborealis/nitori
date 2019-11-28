export const exitCodeToVariant = (code) => {
    if(code === 0) return 'success';
    if(code === undefined) return 'light';
    return 'danger';
};