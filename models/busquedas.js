const fs = require("fs");

const { default: axios } = require("axios");

class Busquedas {

    historial = [];
    dbPath = "./db/database.json";

    constructor() {
        // todo: leer db si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        // Capitalizar
        return this.historial.map( lugar => {
            let palabras = lugar.split(" ");
            palabras = palabras.map( palabra => palabra[0].toUpperCase() + palabra.substring(1));

            return palabras.join(" ");
        });
    }

    get paramsMapbox() {
        return {
            limit: 5,
            language: "es",
            access_token: process.env.MAPBOX_KEY
        };
    }

    get paramsWeather() {
        return {
            lang: "es",
            units: "metric",
            appid: process.env.OPENWEATHER_KEY
        }
    }
    
    async ciudad( lugar = "" ) {
        // peticion http
        try {

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }) );
        } catch (error) {
            
        }
    }

    async climaLugar( lat, lon ) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = "" ) {
        if ( this.historial.includes( lugar.toLowerCase() ) ){
            return;
        }
        this.historial.unshift( lugar.toLowerCase() );

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));
    }

    leerDB() {
        // Debe existir
        try {
            const info = fs.readFileSync( this.dbPath, { encoding: "utf-8" });
            const data = JSON.parse( info );
            
            this.historial = data.historial;
        } catch (error) {
            return;
        }

        //
    }
}

module.exports = Busquedas;