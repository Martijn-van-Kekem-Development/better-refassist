export class Helpers {
    /**
     * Pad a given input with zeroes.
     * @param input
     */
    public static pad(input: number) {
        let out = String(input);
        while (out.length < 2) {
            out = `0${out}`;
        }
        return out;
    }

    /**
     * Parse the date string.
     * @param date
     */
    public static parseDate(date: string) {
        const dateObj = new Date(date);
        return `${
            this.pad(dateObj.getDate())}-${
            this.pad(dateObj.getMonth()+1)}-${
            this.pad(dateObj.getFullYear())}`;
    }
}