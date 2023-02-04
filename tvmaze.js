"use strict";
//use jquery syntax to access/manipulate the DOM
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

//variable for the first part of TV Maze API
const tvMaze = "http://api.tvmaze.com/";
const $episodesList = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
const norating = "none found";
async function getShowsByTerm(term) {
	// Request shows from API TVMaze based on the search term
	const res = await axios.get(`${tvMaze}search/shows?q=${term}`);

	// return/create a results array from the response promise;
	// result array is made of objects having show id, name, summary, image
	return res.data.map((result) => {
		const show = result.show;
		return {
			id: show.id,
			name: show.name,
			summary: show.summary,
			rating: show.rating ? show.rating.average : norating,
			image: show.image ? show.image.medium : "https://tinyurl.com/missing-tv",
		};
	});
}

/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
	$showsList.empty();

	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
			 <div><small>${show.summary}</small></div>
			 <h6>Rating: ${show.rating}<h6>
             <button class="btn btn-light btn-outline-primary  Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
		);

		$showsList.append($show);
	}
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
	// define a variable(term) that gets the search query from the input box
	const term = $("#search-query").val();
	// get a list of shows from the API based on the search term
	const shows = await getShowsByTerm(term);

	// call a function to display the shows received from the API on the DOM
	$episodesArea.hide();
	populateShows(shows);
}

$searchForm.on("input", async function (evt) {
	evt.preventDefault();
	await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

async function getEpisodesOfShow(id) {
	//  get the list of episodes from the API based on the show ID
	const res = await axios.get(`${tvMaze}shows/${id}/episodes`);
	// getting the show name from the API to use as header above episode listing
	const res2 = await axios.get(`https://api.tvmaze.com/shows/${id}`);
	console.log(res);

	return res.data.map((e) => ({
		// showName taken from 2nd API response above
		showName: res2.data.name,
		// id, name, season, number of episodes taken from 1st API response above
		id: e.id,
		name: e.name,
		season: e.season,
		number: e.number,
	}));
}


// Populating episodes for a selected show

const $h2 = $("h2");
function populateEpisodes(episodes) {
	$episodesList.empty();

	for (let episode of episodes) {
		const $item = $(
			`<li>
		   ${episode.name}
		   (season ${episode.season}, episode ${episode.number})
		 </li>
		`
		);

		$episodesList.append($item);
	}
	$h2.text(`Episodes: ${episodes[0].showName}`);
	$episodesArea.show();
}

async function getEpisodesAndDisplay(evt) {
	// get ID of the show from the HTML data attribute "data-show-id"

	const showId = $(evt.target).closest(".Show").data("show-id");

	// pass in the show ID to get episodes from the API

	const episodes = await getEpisodesOfShow(showId);
	// console.log(episodes);

	// Populate the episodes on the DOM
	populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
