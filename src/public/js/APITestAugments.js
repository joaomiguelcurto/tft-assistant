// Classes
class Augment {
    constructor(id, name, image) {
        this.id = id
        this.name = name
        this.image = image
    }
}

// URLs
const AUGMENTS_URL = "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/en_US/tft-augments.json"
const AUGMENTS_IMAGE_URL = "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/tft-augment/" // + Image.png

/** 
Receives the list of augments from the URL and returns the group of objects
*/
async function GetData() {
    const RESPONSE = await fetch(AUGMENTS_URL)
    if (RESPONSE.ok) {
        const RESULT = await RESPONSE.json()
        return RESULT.data
    } else {
        console.error(`HTTP Error: ${RESPONSE.status} ${RESPONSE.statusText}`)
        return null
    }
}

/** 
Receives the data from GetData() and organizes it using the class Augment and fills the AUGMENTLIST array
*/
async function OrganizeData() {
    const DATA = await GetData()

    const AUGMENTLIST = []

    Object.entries(DATA).forEach(([key, value]) => {
        const NEWAUGMENT = new Augment(value.id, value.name, value.image.full)
        AUGMENTLIST.push(NEWAUGMENT)
    });

    return AUGMENTLIST
}

/**
Displays the organized data from OrganizeData() in the HTML
*/
async function DisplayAugments() {
    const CONTAINER = document.getElementById('augmentsDiv')

    const ORGANIZED_DATA = await OrganizeData()

    ORGANIZED_DATA.forEach(element => {
        const AUGMENT = document.createElement("div")
        AUGMENT.classList.add("augment")
        const AUGMENT_NAME = document.createElement("h2")
        AUGMENT.appendChild(AUGMENT_NAME)
        const AUGMENT_ID = document.createElement("h3")
        AUGMENT.appendChild(AUGMENT_ID)
        const AUGMENT_IMAGE = document.createElement("img")
        AUGMENT.appendChild(AUGMENT_IMAGE)

        AUGMENT_NAME.innerHTML = element.name
        AUGMENT_ID.innerHTML = element.id
        AUGMENT_IMAGE.setAttribute('src', AUGMENTS_IMAGE_URL + element.image);

        CONTAINER.appendChild(AUGMENT)
    })

}

DisplayAugments()