export type TShortestPathResponse = {
    message: string;
    data: Datum[];
}

interface Datum {
    source_id: string;
    destination_id: string;
    distance: number;
}