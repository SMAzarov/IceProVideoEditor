import { InputHTMLAttributes } from "react";
interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onValueChange: (value: number) => void;
    displayValue?: string;
}
export declare function Slider({ label, value, min, max, step, onValueChange, displayValue, }: SliderProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Slider.d.ts.map