import { supaBase } from '../functions/supabase.js';
import { Router } from 'express';

const router = Router();

const getRows = async (field: string, query?: string) => {

    const fields = ["name", "attribute", "faction", "agent_id", "all"];

    if (!fields.includes(field)) return console.log(`campo ${field} no existe`);

    switch (true) {
        case field !== "all" && field !== "agent_id":
            try {
                const { data } = await supaBase
                    .from('agents')
                    .select('*')
                    .ilike(field, `%${query}%`);
                return data;
            }
            catch (error) {
                console.log(error);
                return [];
            }
        case field === "all":
            try {
                const { data } = await supaBase
                    .from('agents')
                    .select('*');
                return data;
            }
            catch (error) {
                console.log(error);
                return [];
            }
        case field === "agent_id": {
            const { data } = await supaBase
                .from('agents')
                .select('*')
                .eq(field, query);
            return data;
        }
    }
};
/* ===========================
    ROUTES/
    ===========================*/
router.get('/characters/agents/all', async (req, res) => {
    try {

        const rows = await getRows("all");
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ Message: "Server error", error: error });

    }
});
//base Searchs
router.get('/characters/agents/name/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const rows = await getRows("name", name);

        if (!rows || rows!.length == 0) {
            return res.status(404).json({ Message: "couldn't find factionName, check the written name again" });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ Message: "Server error", error: error });

    }
});
router.get('/characters/agents/Attribute/:attributeName', async (req, res) => {
    const { attributeName } = req.params;
    try {
        const rows = await getRows("attribute", attributeName);

        if (!rows || rows!.length == 0) {
            return res.status(404).json({ Message: "couldn't find factionName, check the written name again" });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ Message: "Server error", error: error });

    }
});
router.get('/characters/agents/faction/:factionName', async (req, res) => {
    const { factionName } = req.params;
    try {
        const rows = await getRows("faction", factionName);

        if (!rows || rows!.length == 0) {
            return res.status(404).json({ Message: "couldn't find factionName, check the written name again" });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ Message: "Server error", error: error });

    }
});
router.get('/characters/agents/id/:agentId', async (req, res) => {
    const { agentId } = req.params;

    const rows = await getRows("agent_id", `agent-${agentId}`);

    if (!rows || rows!.length == 0) {
        return res.status(404).json({ Message: "couldn't find agent, check the written name again" });
    }
    res.status(200).json(rows);
}

);
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
