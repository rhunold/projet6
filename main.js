const api_url = "http://localhost:8000/api/v1/titles";


function createModal(DetailMovieJson) {
    let modal = document.querySelector(".modal");
    let content = document.querySelector(".modal div");
    let closeBtn = document.querySelector(".modal span");

    modal.style.display = "block";    
  
    content.innerHTML = `
              <img class="modal-img" src="${DetailMovieJson.image_url}" alt="${DetailMovieJson.title} cover" />
              <h3>${DetailMovieJson.title}</h3>
              <p>Genre: ${DetailMovieJson.genres}</p>
              <p>Release date: ${DetailMovieJson.date_published}</p>
              <p>Duration: ${DetailMovieJson.duration} min</p>
              <p>Country: ${DetailMovieJson.countries}</p>
              <p>Gross income: ${DetailMovieJson.worldwide_gross_income}</p>
              <p>Imdb score: ${DetailMovieJson.imdb_score}</p>
              <p>Vote: ${DetailMovieJson.avg_vote}</p>
              <p>Director: ${DetailMovieJson.directors}</p>
              <p>Actors: ${DetailMovieJson.actors}</p>
              <p>Description: ${DetailMovieJson.long_description}</p>
          `;
  
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }


async function bestMovie() {
  let BestMovieRequest = await fetch(`${api_url}?sort_by=-imdb_score`);
  let BestMovieJson = await BestMovieRequest.json();

  let DetailMovieRequest = await fetch(`${api_url}/${BestMovieJson.results[0].id}`);
  let DetailMovieJson = await DetailMovieRequest.json(); 

  let bestMovie = document.querySelector(`#best_movie div`);

  bestMovie.innerHTML = `
            <img src="${DetailMovieJson.image_url}" />
            <button id="bestmovie_modal">Info</button>
            <h1>${DetailMovieJson.title}</h1>
            <p>${DetailMovieJson.long_description}</p>
        `;

  document.getElementById("bestmovie_modal").onclick = function () {
    createModal(DetailMovieJson);
  };
}

function createCategoryName(genre, id) {
  let catTitle = document.querySelector(`#${id} h2`);

  if (genre !== "best_movies") {
    catTitle.innerText = `${genre}`;
  } else {
    catTitle.innerText = `best movies`;
  }
}

async function createCarrousel(dataMovies, id) {
  let carousel = document.querySelector(`#${id} div`);

  for (let dataMovie of dataMovies) {
    carousel.innerHTML += `
    <a id="${dataMovie.id}">
        <img src="${dataMovie.image_url}" alt="${dataMovie.title}" />
    </a>
    `;
  }

  carousel.innerHTML =
    `<button class="prev">&#10094;</button>`
    + carousel.innerHTML +
    `<button class="next">&#10095;</button>`;  

  carousel.children[0].onclick = () => previous(carousel);
  carousel.children[8].onclick = () => next(carousel);

  for (let i = 1; i < 8; i++) {
    if (i > 4) {
      carousel.children[i].setAttribute("class", "hide");
    }
    
    let movieCardDetail = await detailMovie(dataMovies[i - 1]);
    carousel.children[i].onclick = () => createModal(movieCardDetail);
  }
}

async function detailMovie(dataMovie) {
  let DetailMovieRequest = await fetch(`${dataMovie.url}`);
  let MovieDetailJson = await DetailMovieRequest.json();
  return MovieDetailJson;
}


function next(carousel) { 
  carousel.insertBefore(carousel.children[7], carousel.children[1]); // On insert le film 7 comme le premier

  carousel.children[1].setAttribute("class", ""); // On change sa class pour qu'il apparaissent
  carousel.children[5].setAttribute("class", "hide"); // le 5ème film est caché
}

function previous(carousel) {
  carousel.insertBefore(carousel.children[1], carousel.children[8]); // On prend le 1er film affiché et on le met en fin carrousel

  carousel.children[4].setAttribute("class", "");
  carousel.children[7].setAttribute("class", "hide");
}



async function getMovies(genre) {
  let movies = new Array();

  for (let i = 1; movies.length < 2; i++) {

    if (genre === "best_movies") {
      var MovieRequest = await fetch(`${api_url}?page=${i}&sort_by=-imdb_score`);
    } 
    else {
      var MovieRequest = await fetch(`${api_url}?page=${i}&sort_by=-imdb_score&genre=${genre}`);
      // console.log(MovieRequest);
    }

    let MovieJson = await MovieRequest.json();
    movies.push(MovieJson.results);

  }

  let dataMovies = movies.flat();

  if (genre === "best_movies") {
    dataMovies.shift(); 
  }   

  let carrouselMovies = dataMovies.slice(0, 7); 

  // console.table(carrouselMovies);  

  return carrouselMovies;
}


async function categoryMovies(genre, id) {
  createCategoryName(genre, id);

  let dataMovies = await getMovies(genre);
  createCarrousel(dataMovies, id);
}



bestMovie();
categoryMovies("best_movies", "cat_0");
categoryMovies("mystery", "cat_2");
categoryMovies("action", "cat_1");
categoryMovies("animation", "cat_3");

