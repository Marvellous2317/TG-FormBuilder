
import config from "../appConfig";
import nigeriaData from "../data/nigeria_states_lgas.json" assert { type: "json" };
import axios from "axios";




export const getStateLgaFromLatLng = async (lat, lng) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.GOOGLE_API_KEY}`
  );

  if (!data.results || data.results.length === 0) {
    throw new Error("No address found for provided coordinates");
  }

  let state = null, lga = null, address = data.results[0].formatted_address;

  for (const result of data.results) {
    for (const comp of result.address_components) {
      if (!state && comp.types.includes("administrative_area_level_1")) {
        state = comp.long_name;
      }
      if (!lga && comp.types.includes("administrative_area_level_2")) {
        lga = comp.long_name;
      }
    }

    if (state && lga) {
      address = result.formatted_address;
      break;
    }
  }

  const matchedState = nigeriaData.find(
    (s) => s.state.toLowerCase() === state?.toLowerCase()
  );
  const matchedLga = matchedState?.lgas.find(
    (l) => l.name.toLowerCase() === lga?.toLowerCase()
  );

  if (!matchedLga) throw new Error("Invalid location");


  console.log(  matchedState.state,
     matchedLga.name,
    address)


  return {
    state: matchedState.state,
    lga: matchedLga.name,
    address
  };
};
