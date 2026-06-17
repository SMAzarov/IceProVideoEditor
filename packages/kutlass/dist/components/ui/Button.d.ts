import { ButtonHTMLAttributes } from "react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    icon?: React.ReactNode;
}
export declare function Button({ children, variant, size, icon, className, ...props }: ButtonProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Button.d.ts.map