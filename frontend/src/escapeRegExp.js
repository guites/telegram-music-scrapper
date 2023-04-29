// source: https://stackoverflow.com/a/9310752
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export default escapeRegExp;