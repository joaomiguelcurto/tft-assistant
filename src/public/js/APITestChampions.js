async function getChampions() {
  const url = "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/en_US/tft-champion.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    
    // Display the champions
    displayChampions(result.data);
    
  } catch (error) {
    console.error(error.message);
  }
}

function displayChampions(championsData) {
  const container = document.getElementById('champions-container');
  container.innerHTML = '';
  
  // Loop through each champion
  Object.keys(championsData).forEach(key => {
    const champion = championsData[key];
    
    // Champ Contentor
    const championCard = document.createElement('div');
    championCard.className = 'champion-card';
    
    // Champ Img
    const img = document.createElement('img');
    img.src = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/tft-champion/${champion.image.full}`;
    img.alt = champion.name;
    
    // Nome
    const name = document.createElement('p');
    name.className = 'champion-name';
    name.textContent = champion.name;

    // Tier
    const tier = document.createElement('p');
    tier.className = 'champion-tier';
    tier.textContent = 'Tier: ' + champion.tier;

    // Id
    const id = document.createElement('p');
    id.className = 'champion-id';
    id.textContent = champion.id;


    championCard.appendChild(img);
    championCard.appendChild(name);
    championCard.appendChild(tier);
    championCard.appendChild(id);
    
    container.appendChild(championCard);
  });
}