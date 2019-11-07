import {FC} from "react";

export declare interface Stage {
    variant: string | "info" | "danger" | "success";
    size: number;
}

export declare interface ProgressbarStagesProps {
    state: Array<Stage>;
    loading: boolean;
}
export declare const ProgressbarStages: FC<ProgressbarStagesProps>;