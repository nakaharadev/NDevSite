import { JSX } from "react";

export interface Page {
    id: string,
    title: string,
    component: JSX.Element
}