
let searchBtn = $("#search-btn");
let coordinates;
let fetchInterval;
let counter = 0;
let placesCategories = ["sport", "accomodations","museums","historical_places","archaeology","theatres_and_entertainments", "beaches", "nature_reserves", "water", "restaurants", "pubs", "islands", "religion", "architecture", "amusements", "adult"];
let i = 0;

// const getCity = () => {
//     return $("#search-input").val()
// }

let getCoodinates = async (city) => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=eEZcngxNkDzmZxnzJSAyPekHTPjmQyaG&inFormat=kvp&outFormat=json&location=${city}&thumbMaps=false`)
    // fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${city}&apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
        .then(response => {
            return response.json();
        })
        .then(response => {
            // console.log(response);
            // if (response.status === "NOT_FOUND") {
            //     // display a message letting the user know that the city cannot be found
            //     coordinates = "NOT_FOUND"
            //     // return;
            // }
            // else {
                $(".result-grid").empty();
                console.log(response.results[0].locations[0].latLng)
                fetchInterval = setInterval(() => {
                    getPlacesXID({
                        lat: response.results[0].locations[0].latLng.lat,
                        lon: response.results[0].locations[0].latLng.lng
                    });
                    counter++
                }, 3000);
                coordinates = {
                    lat: response.lat,
                    lon: response.lon
                };
            return coordinates;
        })
}

const getPlacesXID = (coordinates) => {
    // define the categories of places you want in the result
    if (i === placesCategories.length-1) { clearInterval(fetchInterval) }

    fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=16093.4&lon=${coordinates.lon}&lat=${coordinates.lat}&rate=2&kinds=${placesCategories[i]}&limit=5&apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
        .then(response => {
            return response.json()
        }).then(response => {
            console.log(response)
            if (response) {
                setTimeout(() => { getPlaceInfo(response.features) }, 1000)

            }
            return response
        })
    i++;
}

function getPlaceInfo(xIDs) {
    const promises = xIDs.map((xIDs) => {
        return fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xIDs.properties.xid}?apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
    })
    Promise.all(promises)
        .then(values => {
            return Promise.all(values.map(function (value) {
                return value.json();
            }))
        })
        .then(function (response) {
            console.log(response)
            displayCards(response);
        });
}// fetch images and place description
function displayCards(response) {

    response.map((response, index) => {
        if (response.preview && response.wikipedia_extracts) {
            let imgSrc = response.preview.source;
            let pxIndex = imgSrc.lastIndexOf("px");
            let newImgSrc = imgSrc.replace(`${imgSrc[pxIndex - 3]}${imgSrc[pxIndex - 2]}${imgSrc[pxIndex - 1]}`, "1920");
            var resultCard = $(`<div class="result"><div class="image-container"><img src=${newImgSrc}  class="result-images" alt=... onerror="changeImageSrc(this)"></div><div class="result-text"><h2>${response.name}</h2><p>${response.wikipedia_extracts.text}</p><h3>Address</h3></div></div>`)
            $(".result-grid").append(resultCard);
            $(".landing").attr("hidden", true)
            $("nav").attr("hidden", false);
            // if (index === 0) {
            //     $(".carousel-item").addClass("active");
            // }
        }

    });
    // fetchAirports();
    // weatherFetch();
}// display carousel

// Remove image if there's an error when downloading
const changeImageSrc=(img)=>{
    $(img).remove();
    console.clear();
}

$(".search-form").on("submit", (event) => {
    i=0
    event.preventDefault();
    // console.log(event)
    let city = event.target[1].value;

    if (city.length) {
        console.log(city)
        getCoodinates(city)
        // .then(()=>{
        //     console.log (coordinates)
        //     getPlacesXID(coordinates)
        // }
        // )

    }
})