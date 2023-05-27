const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initalizeDBAndServer = async () =>{
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(3000, ()=>
            console.log("server Running at http://loclhost:3000/");
        );
    }catch (error){
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};
initalizeDBAndServer();
const convertDbObjectToResponseObjet = (dbObject) =>{
    return {
        playerId: dbObject.player_id,
        playerName: dbObject.player_name,
        jerseyNumber: dbObject.jersey_number,
        role: dbObject.role
   };
};

app.get("/players/", async (request, response)=>{
    const getCricketQuery = `
    SELECT 
    *
    FROM
    cricket_team; 
    `;
    const cricketArray = await db.all(getCricketQuery);
    response.send(cricketArray.map((eachPlayer)=>
    convertDbObjectToResponseObjet(eachPlayer)
    ));
});
app.get("/players/:playerId/", async(request, response)=>{
    const { playerId } = request.params;
    const getPlayerQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_Id = ${playerId};`;
    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObjet(player));
});

app.post("/players/", async (request,response)=>{
    const { playerName, jerseyNumber,role } = request.body;
    const postPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES
    (${playerName},${jerseyNumber},${role});`;
    const player = await db.run(postPlayerQuery);
    response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response)=>{
    const { playerName, jerseyNumber, role } = request.body;
    const {playerId} = request.params;
    const updatePlayerQuery = `
    UPDATE
    cricket_team
    SET
    plyer_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE
    player_id = ${playerId};`;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request,response)=>{
    const {playerId} = request.params;
    const deletePlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE
    player_id = ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});

module.exports = app;