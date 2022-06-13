function checkDateFormat(date) {
    if (date < 10)
        return (`0${date}`)
    return date;
}

function getTDate(date) {
    let newDate = `${checkDateFormat(date.getDate())}-${checkDateFormat(date.getMonth() + 1)}-${date.getFullYear()} ${checkDateFormat(date.getHours())}:${checkDateFormat(date.getMinutes())}`;
    return newDate;
}

function getTime(time) {
    const s = checkDateFormat(Math.floor(time % 60));
    time = Math.floor(time / 60);
    const m = checkDateFormat(Math.floor(time % 60));
    time = Math.floor(time / 60);
    const h = checkDateFormat(time % 24);
    time = Math.floor(time / 24);
    const d = time;

    if (d > 0)
        return `${d}:${h}:${m}:${s}s`;
    if (h > 0)
        return `${h}:${m}:${s}s`;
    if (m > 0)
        return `${m}:${s}s`;
    return `${s}s`;
}

function roundAmount(amount) {
    return Math.round((amount + Number.EPSILON) * 100) / 100
}
export { getTDate, getTime, roundAmount }