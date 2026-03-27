import { State } from "../models/model.js";
import { sequelize } from "../config/database.js";
import fs from "fs";

export async function importStates() {
  const transaction = await sequelize.transaction();
  try {
    const rawData = fs.readFileSync("./state_and_lga.json", "utf8");
    const statesData = JSON.parse(rawData);

    // Prepare states for bulk insert
    const stateRecords = statesData.map((state) => ({
      stateName: state.state,
    }));

    // Bulk insert states with transaction
    const createdStates = await State.bulkCreate(stateRecords, {
      ignoreDuplicates: true,
      returning: true,
      transaction,
    });

    // Map stateName -> stateId
    const stateMap = {};
    createdStates.forEach((s) => {
      stateMap[s.stateName] = s.stateId;
    });

    // Prepare LGAs for bulk insert
    const lgaRecords = [];
    statesData.forEach((state) => {
      if (state.lgas && state.lgas.length > 0) {
        const stateId = stateMap[state.state];
        state.lgas.forEach((lga) => {
          lgaRecords.push({
            localGovtName: lga.name,
            stateId,
          });
        });
      }
    });

    // Bulk insert LGAs with transaction
    if (lgaRecords.length > 0) {
      await LocalGovt.bulkCreate(lgaRecords, { 
        ignoreDuplicates: true, 
        transaction 
      });
    }

    // Commit transaction
    await transaction.commit();
    console.log("✅ States and LGAs imported successfully!");
  } catch (err) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("❌ Error importing states and LGAs:", err);
  } finally {
    await sequelize.close();
  }
}


const sku_data = [
{ name : "FES Large"},
{ name : "FES Medium"},
{ name : "FES Small"},
{ name : "FES Can 440ml"},
{ name : "FES Can 330ml"},
{ name : "Guinness Smooth"},
{ name : "Guinness Smooth Can 440ml"},
{ name : "Guinness Smooth Can 330ml"},
{ name : "Orijin Beer"},
{ name : "Orijin Beer Can 440ml"},
{ name : "Orijin Beer Can 330ml"},
{ name : "Gordon Pink Gin & Tonic Can"},
{ name : "Smirnoff Ice Double black 600ml"},
{ name : "Smirnoff Ice Double black 330ml"},
{ name : "Smirnoff Ice Pineapple 330ml"},
{ name : "Smirnoff Ice 330ml"},
{ name : "Smirnoff Ice Double Black Can 440ml"},
{ name : "Smirnoff Ice Double Black Can 330ml"},
{ name : "Smirnoff Ice Pineapple Can 330ml"},
{ name : "Smirnoff Ice Can 330ml"},
{ name : "Malta Guinness"},
{ name : "Malta Guinness Can"},
{ name : "Don Royal Gin 750ml"},
{ name : "Don Royal Gin 305ml"},
{ name : "Don Royal Rum 750ml"},
{ name : "Don Royal Rum 305ml"},
{ name : "Smirnoff 1x Choco 750ml"},
{ name : "Smirnoff 1x Choco 305ml"},
{ name : "Gordons Moringa 750ml"},
{ name : "Gordons Moringa 305ml"},
{ name : "Gordons Pink 750ml"},
{ name : "Gordons Pink 305ml"},
{ name : "Gordons Sunset 750ml"},
{ name : "Gordons Sunset 305ml"},
{ name : "Orijin Bitters 750ml"},
{ name : "Orijin Bitters 200ml"}
]



export const createBulkSku = async ()=>{

   try {

    await SKU.bulkCreate(sku_data);
    console.log('Bulk SKU creation completed successfully');
  } catch (error) {
    console.error('Error creating bulk SKUs:', error);
    throw error;
  }
}






