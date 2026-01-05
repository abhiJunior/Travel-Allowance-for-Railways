

const BASE_URL = "http://localhost:5000/api";

const getHeaders = () => ({
    'Content-Type' : 'application/json',
    'Authorization' : `Bearer ${localStorage.getItem("token")}`
})

export const api = {

    login : (data)=> fetch(`${BASE_URL}/api/user/login`,{
        method : "POST",
        headers : { "Content-Type" : "application/json"},
        body : JSON.stringify(data)
    }),
    register : (data) => fetch(`${BASE_URL}/api/user/register`,{
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(data)
    }),
    getMe : ()=> fetch(`${BASE_URL}/user/me`, {headers : getHeaders()}),

    updateProfile : (values) => fetch(`${BASE_URL}/user/update-profile`,{
        method : "PATCH",
        headers : getHeaders(),
        body: JSON.stringify(values)
    }),

    getJournal : (monthYear)=> fetch(`${BASE_URL}/journal/${monthYear}`,{headers : getHeaders()}),

    addEntry : (entryData) =>
        fetch(`${BASE_URL}/journal/add`,{
            method : "POST",
            headers : getHeaders(),
            body : JSON.stringify(entryData)
        }),

    downloadPdf : (monthYear) =>
        fetch(`${BASE_URL}/journal/generate-pdf/${monthYear}`,{
            method : "GET",
            headers : getHeaders(),
        })

    
}