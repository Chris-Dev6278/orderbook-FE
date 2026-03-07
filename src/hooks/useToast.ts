import { useState, useEffect } from "react";
import type { Toast, ToastType } from "../types";

let _counter = 0;
let _listeners = new Set<(t: Toast) => void>();

export function addToast(t: { type: ToastType; title: string; msg: string }) {
    const toast: Toast = { ...t, id: ++_counter };
    _listeners.forEach(fn => fn(toast));
}

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handler = (t: Toast) => {
            setToasts(prev => [t, ...prev].slice(0, 4));
            setTimeout(
                () => setToasts(prev => prev.filter(x => x.id !== t.id)),
                4500
            );
        };
        _listeners.add(handler);
        return () => {
            _listeners.delete(handler);
        };
    }, []);

    return toasts;
}
