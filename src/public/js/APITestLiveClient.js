const outputDiv = document.getElementById("output")

async function GetData() {
    URL_ALL_DATA = "/api/allgamedata"

    let DATA
    
    const RESPONSE = await fetch(URL_ALL_DATA)
    if (RESPONSE.ok) {
        const RESULT = await RESPONSE.json()
        DATA = RESULT
    } else {
        console.error(`HTTP Error: ${RESPONSE.status} ${RESPONSE.statusText}`)
        return null
    }

    if (DATA) {
        outputDiv.innerHTML = JSON.stringify(DATA)
    } else {
        outputDiv.innerHTML = "Error fetching data or data is empty."
    }

}

GetData()