/**
 * Class to manage fetch cancelling
 */
export class FetchCancelManager {
    pendingId = null;
    cancelledSet = new Set;

    constructor() {
    }

    cancel = () => {
        if(this.pendingId){
            this.cancelledSet.add(this.pendingId);
        }
    };

    pend = () => {
        this.pendingId = Math.random().toString(36).substr(2, 9);
        return this.pendingId;
    };

    cancelled = (id) => {
        return this.cancelledSet.has(id);
    };

    clear = (id) => {
        if(this.pendingId === id)
            this.pendingId = null;
        this.cancelledSet.delete(id);
    };
}