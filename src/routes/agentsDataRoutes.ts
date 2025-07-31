import { supabase } from '../functions/supabase.js';

import { Router } from 'express';

const router = Router();

const getRows = async (field: string, query?: string) => {

    const fields = ["name", "attribute", "faction", "id", "all", "images"]

    if (!fields.includes(field)) return console.log(`campo ${field} no existe`)

    if (field !== "all") {
        let { data, error } = await supabase
            .from('agents')
            .select('*')
            .ilike(field, `%${query}%`)

        if (error) {
            console.log(error)
            return []
        }
        else {
            return data
        }
    }
    else {
        let { data, error } = await supabase
            .from('agents')
            .select('*')
        if (error) {
            console.log(error)
            return []
        }
        else {
            return data
        }
    }

}
/* ===========================
    ROUTES/
    ===========================*/
router.get('/characters/agents/all', async (req, res) => {
    const rows = await getRows("all");
    res.status(200).json(rows);
});
//base Searchs
router.get('/characters/agents/name/:name', async (req, res) => {
    const { name } = req.params;
    const rows = await getRows("name", name);
    let response = rows;
    if (!response || rows!.length == 0) {
        response = [{ Message: "couldn't find character, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/Attribute/:attributeName', async (req, res) => {
    const { attributeName } = req.params;
    const rows = await getRows("attribute", attributeName);
    let response = rows;
    if (!response || rows!.length == 0) {
        response = [{ Message: "couldn't find atributte, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/faction/:factionName', async (req, res) => {
    const { factionName } = req.params;
    const rows = await getRows("faction", factionName);
    let response = rows;
    if (!response || rows!.length == 0) {
        response = [{ Message: "couldn't find faction, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/id/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const rows = await getRows("id", `agent-${agentId}`);
    let response = rows;
    if (!response || rows!.length == 0) {
        response = [{ Message: "couldn't find faction, check the written name again" }];
    }
    res.status(200).json(response);
});
// //Mixed Searchs
// await router.get('/characters/agents/name/:name/faction/:factionName', async (req, res) => {
//     const { name, factionName } = req.params
//     const rows = await getRows(name, factionName)
//     let response = rows
//     if (!response || rows.length == 0) {
//         response = { Message: "couldn't find character, check the written name again" }
//     }
//     res.status(200).json(response)
// })
// await router.get('/characters/agents/name/:name/Attribute/:attributeName', async (req, res) => {
//     const { name, attributeName} = req.params
//     const rows = await getRows(name, null, attributeName)
//     let response = rows
//     if (!response || rows.length == 0) {
//         response = { Message: "couldn't find character, check the written name again" }
//     }
//     res.status(200).json(response)
// })
export { router as Routes };
