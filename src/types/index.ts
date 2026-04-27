export enum CropTypes {
    Wheat = 1, Rye = 2, Peas = 3, Phacelia = 4, Sunflower = 5, Corn = 6, None = 7, Lucerne = 8, Lawns = 9,
}

export enum FieldOperationTypes {
    Plowing = 1, Sowing = 2, Fertilizing = 3, Spraying = 4, Harvesting = 5, Disking = 6, None = 7,
}

export interface UserInfo {
    userId: number;
    names: string;
    shouldChangePassword: boolean;
}

export interface LoginResponse {
    userId: number;
    shouldChangePassword: boolean;
    names: string;
}

export interface Activity {
    id: number;
    type: FieldOperationTypes;
    date: string;
    notes?: string;
    driverId?: number;
    driverName?: string;
}

export interface Expense {
    id: number;
    type: string;
    amount: number;
    date: string;
}

export interface Sale {
    saleId: number;
    dateSigned: string;
    cropType: CropTypes;
    priceForKg: number;
    quantity: number;
    totalPrice: number;
    buyerName: string;
}

export interface FieldSeason {
    id: number;
    year: number;
    cropType: CropTypes;
    activities: Activity[];
    sales: Sale[];
    expenses: Expense[];
}


export interface Field {
    fieldId: number;
    fieldName: string;
    fieldSize: number;
    fieldLocation: string;
    boundaryJson?: string | null;
    createdOn?: string;
    seasons: FieldSeason[];
}

export interface FieldMapEditorProps {
    initialBoundaryJson: string | null;
    onSaveBoundary: (boundaryJson: string) => void;
}