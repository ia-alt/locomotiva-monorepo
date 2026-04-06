import { useContext } from "react";
import { AccessCodeContext } from "../contexts/access-code";

export function useAccessCode() {
    return useContext(AccessCodeContext);
}