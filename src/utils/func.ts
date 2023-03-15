export const getDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 月份从0开始，需要加1
    const day = today.getDate();
    return `${year}-${month}-${day}`;
}