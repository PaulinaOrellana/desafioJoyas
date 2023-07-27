const express = require('express');
const app = express();
const { obtenerJoyas, obtenerJoyasPorFiltros } = require('./consultasDb')

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor conectado en puerto ${port}`);
});

// Función para preparar HATEOAS
const prepararHATEOAS = (joyas) => {
    const results = joyas.map((j) => {
     return {
     name: j.nombre, 
     href: `/joyas/${j.id}`,
             };
      }).slice(0, 4);
       const total = joyas.length;
          const HATEOAS = {
            total,
            results,
          };
          return HATEOAS;
           };

// Ruta para obtener todas las joyas
app.get('/joyas', async (req, res) => {
    try{
    const { items: results, count } = await obtenerJoyas(req.query);
    const HATEOAS = prepararHATEOAS(results); 
    res.status(200).json({ ok: true, results: HATEOAS.results, actual: HATEOAS.results.length, count });
    }catch (error){
        res.status(500).json({ error: 'Error al obtener las joyas' });
        }
    });

// Ruta para obtener joyas filtradas
app.get('/joyas/filtros', async (req, res) => {
    try{
    const { precio_max, precio_min, categoria, metal } = req.query;
    const joyasFiltradas = await obtenerJoyasPorFiltros({ precio_max, precio_min, categoria, metal });
    res.status(200).json({ ok: true, results: joyasFiltradas, actual: joyasFiltradas.length, count: joyasFiltradas.length });
}catch (error){
    res.status(500).json({ error: 'Error al obtener las joyas filtradas' });
}
  });

  app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe")
    })



   