function getCookie(name) {
  let cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return "";
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function trackGameVisit() {
  let hostPrefix = window.location.origin + "/";
  let gamePath = "game/";
  let currentUrl = window.location.href;

  if (currentUrl.startsWith(hostPrefix + gamePath)) {
    let gameName = currentUrl.replace(hostPrefix + gamePath, "").replace(".html", "");
    let recentGames = getCookie("recentGames");
    let gamesList = recentGames ? JSON.parse(recentGames) : [];

    // Oyun zaten eklenmişse ekleme
    if (!gamesList.includes(gameName)) {
      gamesList.unshift(gameName);
    }

    // Eğer oyun sayısı 5'ten fazla ise en eskiyi çıkar
    if (gamesList.length > 15) {
      gamesList.pop();
    }

    setCookie("recentGames", JSON.stringify(gamesList), 7);
  }
}

async function showRecentGames() {
  let hostPrefix = window.location.origin + "/";
  let gamePath = "game/";
  let recentGames = getCookie("recentGames");
  let gamesList = recentGames ? JSON.parse(recentGames) : [];

  let recentContainer = document.getElementById("recent-games");

  if (gamesList.length === 0) {
    recentContainer.innerHTML += "<p>Henüz oyun oynanmadı.</p>";
    return;
  }

  try {
    let response = await fetch("/data-json/games.json");
    let gamesData = await response.json();

    let cardsContainer = document.createElement("div");
    cardsContainer.className = "cards-container masonry-horizontal-scroll";

    // Her bir oyun için kart oluştur
    gamesList.forEach((gameSlug) => {
      let game = gamesData.find((g) => g.slug === gameSlug);
      if (game) {
        let card = document.createElement("a");
        card.href = hostPrefix + game.url;
        card.className = "card";
        card.style.height = "70px";

        card.innerHTML = `
                    <picture>
                        <source srcset="${game.image}" type="image/png">
                        <img src="${game.image}" alt="${game.title}" class="img-fluid">
                    </picture>
                    <div class="card-body" >
                        <h3>${game.title}</h3>
                    </div>
                `;
        cardsContainer.appendChild(card);
      }
    });

    recentContainer.appendChild(cardsContainer);
  } catch (error) {
    console.error("JSON yüklenirken hata oluştu:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  trackGameVisit(); // Oyun ziyaretini kaydet
  showRecentGames(); // Son oynanan oyunları göster
});
