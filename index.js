require('dotenv').config()

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {

    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput("Introduzca una ciudad:");

                // Mostrar los lugares
                const lugares = await busquedas.ciudad( termino );

                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if ( id === "0" ) continue;

                const lugarSelect = lugares.find(lugar => lugar.id === id);

                // Guardar en DB
                busquedas.agregarHistorial( lugarSelect.nombre );

                // Clima
                const clima = await busquedas.climaLugar( lugarSelect.lat, lugarSelect.lng );
                // Mostrar resultados
                console.log("\nInformación de la ciudad\n".green);
                console.log("Ciudad:", lugarSelect.nombre);
                console.log("Lat:", lugarSelect.lat);
                console.log("Lng:", lugarSelect.lng);
                console.log("Temp.:", clima.temp, "ºC");
                console.log("T. max:", clima.max, "ºC");
                console.log("T. min:", clima.min , "ºC");
                console.log("Cómo está el clima:", clima.desc);
                break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i ) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${ idx } ${ lugar }`)
                });
                break;
        }
        
        if (opt !== 0) await pausa();

    } while (opt !== 0);
}

main();