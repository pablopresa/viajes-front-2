
export class Util {

    public static parseLocalDate(value: string | Date): Date {
        if (value instanceof Date) return value;

        // Espera formato YYYY-MM-DD
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

}
