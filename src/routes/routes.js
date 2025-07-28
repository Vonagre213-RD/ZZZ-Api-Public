import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Router } from 'express';
dotenv.config();
const pool = new Pool();
const router = Router();
const getRows = async (name, faction, attributeName, agentId) => {
    let query = 'SELECT * FROM public.agents';
    const values = [];
    const conditions = [];
    if (name) {
        conditions.push(`name ILike $${values.length + 1}`);
        values.push(`%${name}%`);
    }
    if (faction) {
        conditions.push(`faction ILike $${values.length + 1}`);
        values.push(`%${faction}%`);
    }
    if (attributeName) {
        conditions.push(`attribute ILike $${values.length + 1}`);
        values.push(`%${attributeName}%`);
    }
    if (agentId) {
        conditions.push(`id = $${values.length + 1}`);
        values.push(`${agentId}`);
    }
    if (conditions.length > 0) {
        query += ' where ' + conditions.join(" AND ");
    }
    const results = await pool.query(query, values);
    const rows = results.rows;
    return rows;
};
/* ===========================
    ROUTES/
    ===========================*/
router.get('/characters/agents/All', async (req, res) => {
    const rows = await getRows();
    res.status(200).json(rows);
});
//base Searchs
router.get('/characters/agents/name/:name', async (req, res) => {
    const { name } = req.params;
    const rows = await getRows(name);
    let response = rows;
    if (!response || rows.length == 0) {
        response = [{ Message: "couldn't find character, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/Attribute/:attributeName', async (req, res) => {
    const { attributeName } = req.params;
    const rows = await getRows(null, null, attributeName);
    let response = rows;
    if (!response || rows.length == 0) {
        response = [{ Message: "couldn't find atributte, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/faction/:factionName', async (req, res) => {
    const { factionName } = req.params;
    const rows = await getRows(null, factionName);
    let response = rows;
    if (!response || rows.length == 0) {
        response = [{ Message: "couldn't find faction, check the written name again" }];
    }
    res.status(200).json(response);
});
router.get('/characters/agents/id/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const rows = await getRows(null, null, null, `agent-${agentId}`);
    let response = rows;
    if (!response || rows.length == 0) {
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
