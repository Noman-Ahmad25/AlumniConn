import { API } from "../../../services/api";

export interface College {
    id: number
    name: string
    location?: string | null
    established_year?: number | null
    domain: string
    description?: string | null
}

const getColleges = async (): Promise<College[]> => {
    const response = await API.get('/colleges/');
    console.log(response.data)
    return response.data;
}

export { getColleges }
