export const checkExist = (array, item) => {
    return array.some(function (el) {
        return el.id === item.id;
    });
}