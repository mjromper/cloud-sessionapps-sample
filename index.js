const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/12.612.0');
const WebSocket = require('ws');


(async () => {
    const randomId = Math.random().toString(32).substring(3);
    const appId = `SessionApp_${randomId}`;
    const tenant = 'manuel-romero.eu.qlikcloud.com';
    const apiKey = 'xxxxx';
    const url = `wss://${tenant}/app/${appId}`;
    console.log("--- URL", url);
    const script = `
    LIB CONNECT TO 'PostgreSQL_QMI';

    LOAD businessentityid, 
        persontype, 
        namestyle, 
        title, 
        firstname, 
        middlename, 
        lastname, 
        suffix, 
        emailpromotion, 
        additionalcontactinfo, 
        demographics, 
        rowguid, 
        modifieddate;
    
    [person]:
    SELECT "businessentityid",
        "persontype",
        "namestyle",
        "title",
        "firstname",
        "middlename",
        "lastname",
        "suffix",
        "emailpromotion",
        "additionalcontactinfo",
        "demographics",
        "rowguid",
        "modifieddate"
    FROM "person"."person";`;

    const session = enigma.create({
        schema,
        createSocket: () =>
            new WebSocket(url, {
                // use the API key to authenticate:
                headers: { Authorization: `Bearer ${apiKey}` },
            }),
    });

    try {
        
        const global = await session.open();
        console.log("--- Creating session app");
        const app = await global.getActiveDoc();
        console.log("--- Setting script to session app:", script);
        await app.setScript(script);
        console.log("--- Reload data into Session app");
        await app.doReload();
        

        const result = await app.evaluate('COUNT([persontype])');
        console.log('Check if data was loaded. Evaluating COUNT([persontype]) = ', result);

        
    } catch (err) {
        console.log('An unexpected error thrown:', err);
    }

    session.close();
})();