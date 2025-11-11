export default class Storage {
    constructor(readonly isBrowser: boolean) { }

    get<T>(key: string): T | null {
        if (this.isBrowser) {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        return null;
    }

    save<T>(key: string, value: T): void {
        if (this.isBrowser) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    delete(key: string): void {
        if (this.isBrowser) {
            localStorage.removeItem(key);
        }
    }

}