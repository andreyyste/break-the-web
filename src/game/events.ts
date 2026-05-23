export const EventBus = new EventTarget();

export interface ElementDropData {
    id: string;
    text: string;
    x: number;
    y: number;
}

export const emitElementDrop = (data: ElementDropData) => {
    EventBus.dispatchEvent(new CustomEvent('elementDrop', { detail: data }));
};
