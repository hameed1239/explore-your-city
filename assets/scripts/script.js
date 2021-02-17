let searchBtn = $("#search-btn");
let coordinates;
let fetchInterval;
let counter = 0;
let placesCategories = ["sport", "accomodations","museums","historical_places","archaeology","theatres_and_entertainments", "beaches", "nature_reserves", "water", "restaurants", "pubs", "islands", "religion", "architecture", "amusements", "adult"];
let i = 0;

let getCoodinates = async (city) => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=eEZcngxNkDzmZxnzJSAyPekHTPjmQyaG&inFormat=kvp&outFormat=json&location=${city}&thumbMaps=false`)
        .then(response => {
            return response.json();
        })
        .then(response => {
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
        .catch(error => {
            console.log("error")
        })
}

const getPlacesXID = (coordinates) => {
    // define the categories of places you want in the result
    if (i === placesCategories.length-1) {
         clearInterval(fetchInterval) 
         $(".search").removeAttr( "disabled", false );
        }

    fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=10009.096&lon=${coordinates.lon}&lat=${coordinates.lat}&rate=2&kinds=${placesCategories[i]}&limit=8&apikey=5ae2e3f221c38a28845f05b60fec7edd6c3842c3f334aa9d51ab3bfd`)
        .then(response => {
            return response.json()
        }).then(response => {
            console.log(response)
            if (response) {
                setTimeout(() => { getPlaceInfo(response.features) }, 1000)

            }
            return response
        })
        .catch(error => {
        console.log("error")
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
            let address = response.address;
            var resultCard = $(`<div class="result"><div class="image-container"><img src=${newImgSrc}  class="result-images" alt=${response.name} onerror="changeImageSrc(this)"></div><div class="result-text"><h2>${response.name}</h2><p>${response.wikipedia_extracts.text}</p><p class="address">${address.house_number || ""} ${address.road || ""} ${address.city ||""} ${address.state||""}  ${address.postcode||""}</p></div></div>`)
            $(".result-grid").append(resultCard);
            $(".landing").attr("hidden", true)
            $("nav").attr("hidden", false);
        }

    });
    if(!!$(".result")&&i===placesCategories.length){
        $(".bg-text").append(`<p class="error">No result was found for this location. Please try again</p>`)
    }
}

// Remove image if there's an error when downloading
const changeImageSrc=(img)=>{
    $(img).remove();
    console.clear();
}

$(".search-form").on("submit", (event) => {
    event.preventDefault();
    $(".error").remove()
    $(".search").prop( "disabled", true );
    i=0
    // console.log(event)
    let city = event.target[1].value;
    
    if (city.length) {
        console.log(city)
        getCoodinates(city)
            
        
    }
})